import { Chapter } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";

type Props = {
  chapter: Chapter;
  chapterIndex: number;
  setCompletedChapters: React.Dispatch<React.SetStateAction<Set<String>>>;
};

export type ChapterCardHandler = {
  triggerLoad: () => void;
};

const ChapterCard = React.forwardRef<ChapterCardHandler, Props>(
  (props, ref) => {
    const [success, setSuccess] = React.useState<boolean | null>(null);
    const { toast } = useToast();
    const { mutate: getChapterInfo, isLoading } = useMutation({
      mutationFn: async ({ chapterId }: { chapterId: string }) => {
        const response = await axios.post("/api/chapter/getInfo", {
          chapterId,
        });
        return response.data;
      },
    });
    const addChapterId = React.useCallback(() => {
      props.setCompletedChapters((prev) => {
        const newSet = new Set(prev);
        newSet.add(props.chapter.id);
        return newSet;
      });
    }, [props]);
    React.useImperativeHandle(ref, () => ({
      async triggerLoad() {
        if (props.chapter.videoId) {
          setSuccess(true);
          addChapterId();

          return;
        }
        getChapterInfo(
          { chapterId: props.chapter.id },
          {
            onSuccess: () => {
              setSuccess(true);
              addChapterId();
            },
            onError: (error) => {
              if (error instanceof AxiosError) {
                console.log(error?.response?.data);
              }
              setSuccess(true);
              // toast({
              //   title: "Something went wrong",
              //   description: "There was an error loading your chapter",
              //   variant: "destructive",
              // });
              addChapterId();
            },
          }
        );
      },
    }));
    const { chapter, chapterIndex } = props;
    React.useEffect(() => {
      if (chapter.videoId) {
        setSuccess(true);
        props.setCompletedChapters((prev) => prev.add(props.chapter.id));
      }
    }, [chapter, props]);
    return (
      <div
        key={chapter.id}
        className={cn("px-4 py-2 mt-2 rounded flex justify-between", {
          "opacity-50": isLoading,
          "bg-secondary": success == null,
          "bg-red-500": success === false,
          "bg-green-500": success === true,
        })}
      >
        <h5 className="">
          Chapter {chapterIndex + 1} {chapter.name}
        </h5>
        {isLoading && <Loader2 className="animate-spin" />}
      </div>
    );
  }
);

ChapterCard.displayName = "ChapterCard";

export default ChapterCard;
