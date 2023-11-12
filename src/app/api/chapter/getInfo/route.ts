import { strict_output } from "@/lib/gpt";
import {
  getQuestionsFromTranscript,
  palmGetQuestionFromTranscript,
} from "@/lib/palm";
import { prisma } from "@/lib/prisma";
import { getTranscript, searchYouTube } from "@/lib/youtube";
import axios from "axios";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs'
export const maxDuration = 300

const bodyParser = z.object({
  chapterId: z.string(),
});

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { chapterId } = bodyParser.parse(body);
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });
    if (!chapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }
    const videoId = await searchYouTube(chapter.youtubeSearchQuery);
    const transcript = await getTranscript(videoId);
    const { summary }: { summary: string } = await strict_output(
      "You are an AI capable of summarising a youtube transcript",
      "summarise in 300 words or less and do not talk of the sponsors or anything unrelated to the main topic, also do not introduce what the summary is about.\n" +
        transcript,
      { summary: "summary of the transcript" }
    );
    const mindmapCreation = axios.post(
      `${process.env.BACKEND_URL}/api/generate`,
      {
        content: summary,
      }
    );

    let questions = await palmGetQuestionFromTranscript(
      transcript,
      chapter.name
    );
    if (!questions) {
      questions = [];
    }
    const manyData = questions.map((question) => {
      return {
        chapterId,
        question: question.question.toString(),
        options: JSON.stringify(question.choices),
        answer: question.answer.toString(),
      };
    });
    const questionCreation = prisma.question.createMany({
      data: manyData,
    });
    let [_, mindmap_url] = await Promise.all([
      questionCreation,
      mindmapCreation,
    ]);
    await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        videoId,
        summary: summary,
        mindmap_url: mindmap_url.data,
      },
    });
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors.toString() },
        { status: 400 }
      );
    } else {
      console.log("elle error", error);
      return NextResponse.json(
        { success: false, error: "unknown error" },
        { status: 500 }
      );
    }
  }
}
