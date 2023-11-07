import CourseSideBar from "@/components/CourseSideBar";
import MainVideoSummary from "@/components/MainVideoSummary";
import QuizCards from "@/components/QuizCards";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    slug: string[];
  };
};

const CoursePage = async ({ params: { slug } }: Props) => {
  const [courseSlug, unitIndexParam, chapterIndexParam] = slug;
  const course = await prisma.course.findUnique({
    where: {
      id: courseSlug,
    },
    include: {
      units: {
        include: {
          chapters: {
            include: { questions: true },
          },
        },
      },
    },
  });
  if (!course) {
    return redirect("/");
  }
  const unitIndex = parseInt(unitIndexParam);
  const chapterIndex = parseInt(chapterIndexParam);
  const unit = course.units[unitIndex];
  if (!unit) {
    return redirect("/");
  }
  const chapter = unit.chapters[chapterIndex];
  if (!chapter) {
    return redirect("/");
  }

  const nextChapter = unit.chapters[chapterIndex + 1];
  const prevChapter = unit.chapters[chapterIndex - 1];

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-start w-full px-4 py-10 mx-auto gap-x-8 sm:px-6 lg:px-8">
        <aside className="sticky hidden w-1/5 top-8 lg:block">
          <CourseSideBar course={course} currentChapterId={chapter.id} />
        </aside>

        <main className="flex-1 w-3/5">
          <div className="px-8">
            <div className="flex flex-col">
              <MainVideoSummary
                unit={unit}
                chapter={chapter}
                unitIndex={unitIndex}
                chapterIndex={chapterIndex}
              />
              <div className="block xl:hidden">
                <QuizCards chapter={chapter} />
              </div>
              <div className="block mt-4 lg:hidden">
                <CourseSideBar course={course} currentChapterId={chapter.id} />
              </div>
            </div>

            <div className="flex-[1] h-[1px] mt-4 text-gray-500 bg-gray-500" />
            <div className="flex pb-8">
              {prevChapter && (
                <Link
                  href={`/course/${course.id}/${unitIndex}/${chapterIndex - 1}`}
                  className="flex mt-4 mr-auto w-fit"
                >
                  <div className="flex items-center">
                    <ChevronLeft className="w-6 h-6 mr-1" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm text-secondary-foreground/60">
                        Previous
                      </span>
                      <span className="text-xl font-bold">
                        {prevChapter.name}
                      </span>
                    </div>
                  </div>
                </Link>
              )}
              {nextChapter && (
                <Link
                  href={`/course/${course.id}/${unitIndex}/${chapterIndex + 1}`}
                  className="flex mt-4 ml-auto w-fit"
                >
                  <div className="flex items-center">
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-secondary-foreground/60">
                        Next
                      </span>
                      <span className="text-xl font-bold">
                        {nextChapter.name}
                      </span>
                    </div>
                    <ChevronRight className="w-6 h-6 ml-1" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </main>

        <aside className="sticky hidden w-1/5 top-8 shrink-0 xl:block">
          <QuizCards chapter={chapter} />
        </aside>
      </div>
    </div>
  );
};

export default CoursePage;
