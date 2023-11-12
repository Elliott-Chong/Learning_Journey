import { strict_output } from "@/lib/gpt";
import { getAuthSession } from "@/lib/nextauth";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/lib/subscription";
import { getUnsplashImage } from "@/lib/unsplash";
import { createChaptersSchema } from "@/validators/course";
import axios from "axios";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: Request, res: Response) {
  try {
    // const session = await getAuthSession();
    // if (!session?.user) {
    //   return new NextResponse("unauthorised", { status: 401 });
    // }
    // const isPro = await checkSubscription();
    // if (session?.user.credits <= 0 && !isPro) {
    //   return new NextResponse("no credits", { status: 400 });
    // }
    const body = await req.json();
    const { title, units } = createChaptersSchema.parse(body);
    let s3_file_key: string | null = body.s3_file_key ?? null;
    let summarised_content = "";
    try {
      const { data } = await axios.post(
        `${process.env.BACKEND_URL}/api/get-summarised-s3-content`,
        {
          s3_file_key,
        }
      );
      summarised_content = data;
    } catch (error) {
      summarised_content = "";
    }

    type outputUnits = {
      title: string;
      chapters: {
        youtube_search_query: string;
        chapter_title: string;
      }[];
    }[];
    let output_units: outputUnits = await strict_output(
      "You are an AI capable of curating course content, coming up with relavent chapter titles, and finding relavent youtube videos for each chapter",
      new Array(units.length).fill(
        // `	It is your job to create a course about ${title}. The user has requested to create chapters for each of the above units.`
        `	It is your job to create a course about ${title}. ${
          s3_file_key &&
          "The user has also passed in a document context in which they they want to be taken into consideration when generating the course, the document is this: \n\n" +
            summarised_content +
            "\n\n"
        } The user has requested to create chapters for each of the above units. Then, for each chapter, provide a detailed youtube search query that can be used to find an informative educational video for each chapter. Each query should give an educational informative course in youtube.`
      ),
      {
        title: "title of the unit",
        chapters:
          "an array of 3 chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object",
      }
    );
    const imagePrompt = `
    Please provide a good image search term for the title of a course about ${title}. This search term
    will be fed into the unsplash API, so make sure it is a good search term that will return a good image.
    `;
    const imageSearchTerm = (await strict_output(
      "You are an AI capable of finding good images for a course",
      imagePrompt,
      { image_search_term: "image_search_term" }
    )) as { image_search_term: string };
    const course_image = await getUnsplashImage(
      imageSearchTerm.image_search_term
    );
    const course = await prisma.course.create({
      data: {
        name: title,
        image: course_image,
      },
    });
    for (const unit of output_units) {
      const title = unit.title;
      // use regex to remove things like "Unit 1: " from the title
      const regex = /Unit \d+: /;
      const unitTitle = title.replace(regex, "");
      const prismaUnit = await prisma.unit.create({
        data: { name: unitTitle, courseId: course.id },
      });
      await prisma.chapter.createMany({
        data: unit.chapters.map((chapter) => {
          return {
            name: chapter.chapter_title,
            youtubeSearchQuery: chapter.youtube_search_query,
            unitId: prismaUnit.id,
          };
        }),
      });
    }

    // console.log("response", output_units);
    // await prisma.user.update({
    //   where: {
    //     id: session.user.id,
    //   },
    //   data: {
    //     credits: {
    //       decrement: 1,
    //     },
    //   },
    // });
    return NextResponse.json({ course_id: course.id });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues },
        {
          status: 400,
        }
      );
    }
    console.error(error);
  }
}
