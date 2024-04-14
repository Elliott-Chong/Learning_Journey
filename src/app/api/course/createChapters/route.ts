import { openai } from "@/lib/gpt";
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
    const body = await req.json();
    const { title, units } = createChaptersSchema.parse(body);
    let s3_file_key: string | null = body.s3_file_key ?? null;
    type outputUnits = {
      title: string;
      chapters: {
        youtube_search_query: string;
        chapter_title: string;
      }[];
    }[];
    const response = await openai.createChatCompletion({
      temperature: 0.5,
      model: 'gpt-4-turbo',
      // @ts-ignore
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an AI capable of curating course content and only answer in JSON, coming up with relavent chapter titles, and finding relavent youtube videos for each chapter"
        },
        {
          role: "user", content: "Come up with chapter titles for a course about " + title + ". The user has requested to create chapters for each of the units: " + units.join(", ") + "Then, for each chapter, provide a detailed youtube search query that can be used to find an informative educational video for each chapter. Each query should give an educational informative course in youtube." +
            `Answer in JSON format, example: [
                  {
                      title: "title of the unit",
                      chapters:
                        "an array of 3 chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object",
                    }
                  )];
                  return the final answer in a JSON key of 'output'
                  e.g. {
                      output: [
                          {
                              "title": "unit 1",
                              "chapters": [
                                {
                                  "chapter_title": "string",
                                  "youtube_search_query": "string"
                                },
                                {
                                  "chapter_title": "string",
                                  "youtube_search_query": "string"
                                },
                              ]
                            },  
                            {
                              "title": "unit 2",
                              "chapters": [
                                {
                                  "chapter_title": "string",
                                  "youtube_search_query": "string"
                                },
                                {
                                  "chapter_title": "string",
                                  "youtube_search_query": "string"
                                },
                              ]
                            },... and more units
                      ]
                  }
                  `
        }
      ],
    });

    const data = await response.json()
    console.log({ output: data.choices[0].message?.content })
    let output_units = JSON.parse(data.choices[0].message?.content).output as outputUnits

    const r = await openai.createChatCompletion({
      temperature: 0.5,
      model: 'gpt-4-turbo',
      // @ts-ignore
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an AI capable of curating course content and only answer in JSON,"
        },
        {
          role: "user", content: "You are an AI capable of finding good images for a course, " + `
              Please provide a good image search term for the title of a course about ${title}. This search term
              will be fed into the unsplash API, so make sure it is a good search term that will return a good image.
  
              output in {'image_search_term': 'your search term here'}
              `
        }
      ],
    });

    const rd = await r.json()
    let res = JSON.parse(rd.choices[0].message?.content) as { image_search_term: string }
    const course_image = await getUnsplashImage(
      res.image_search_term
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
