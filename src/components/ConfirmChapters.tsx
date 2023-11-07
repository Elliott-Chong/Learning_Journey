"use client";
import { Chapter, Course, Unit } from "@prisma/client";
import React from "react";
import { Separator } from "./ui/separator";
import { Button, buttonVariants } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import ChapterCard, { ChapterCardHandler } from "./ChapterCard";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
};

const ConfirmChapters = ({ course }: Props) => {
  const [completedChapters, setCompletedChapters] = React.useState<Set<String>>(
    new Set()
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const chapterRefs: Record<string, React.RefObject<ChapterCardHandler>> = {};
  course.units.forEach((unit) => {
    unit.chapters.forEach((chapter) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      chapterRefs[chapter.id] = React.useRef<ChapterCardHandler>(null);
    });
  });
  const totalChaptersCount = React.useMemo(() => {
    return course.units.reduce((acc, unit) => {
      return acc + unit.chapters.length;
    }, 0);
  }, [course.units]);
  React.useEffect(() => {
    console.log(completedChapters, totalChaptersCount);
    if (completedChapters.size === totalChaptersCount) {
      setIsLoading(false);
    }
  }, [totalChaptersCount, completedChapters]);

  return (
    <div className="w-full mt-4">
      {course.units.map((unit, unitIndex) => {
        return (
          <div key={unit.id} className="mt-5">
            <h2 className="text-sm uppercase text-secondary-foreground/60">
              Unit {unitIndex + 1}
            </h2>
            <h3 className="text-2xl font-bold">{unit.name}</h3>
            <div className="mt-2">
              {unit.chapters.map((chapter, chapterIndex) => {
                return (
                  <ChapterCard
                    setCompletedChapters={setCompletedChapters}
                    chapter={chapter}
                    key={chapter.id}
                    chapterIndex={chapterIndex}
                    ref={chapterRefs[chapter.id]}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-center mt-4">
        <Separator className="flex-[1]" />
        <div className="flex items-center mx-4">
          <Link
            className={buttonVariants({
              variant: "secondary",
            })}
            href="/create"
            type="button"
            onClick={() => {
              // form.setValue("units", [...form.watch("units"), ""]);
            }}
          >
            <ChevronLeft className="w-4 h-4 mr-2" strokeWidth={4} />
            Back
          </Link>
          {completedChapters.size === totalChaptersCount ? (
            <Link
              href={`/course/${course.id}/0/0`}
              type="button"
              className={buttonVariants({
                className: "ml-4 font-semibold",
              })}
            >
              Save & Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          ) : (
            <Button
              type="button"
              disabled={isLoading}
              className="ml-4 font-semibold"
              onClick={() => {
                setIsLoading(true);
                Object.keys(chapterRefs).forEach((chapterId) => {
                  chapterRefs[chapterId].current?.triggerLoad();
                });
              }}
            >
              Generate
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
        <Separator className="flex-[1]" />
      </div>
    </div>
  );
};

export default ConfirmChapters;
