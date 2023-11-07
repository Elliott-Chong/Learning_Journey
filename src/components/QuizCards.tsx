"use client";
import { Chapter, Question } from "@prisma/client";
import React from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  chapter: Chapter & { questions: Question[] };
};

const QuizCards = ({ chapter }: Props) => {
  const [questionsStatus, setQuestionsStatus] = React.useState<
    Record<string, boolean | null>
  >({});
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  if (chapter.questions.length === 0) {
    return <></>;
  }
  const checkAnswer = () => {
    const newQuestionsStatus = { ...questionsStatus };
    chapter.questions.forEach((question) => {
      const answer = answers[question.id];
      if (!answer) {
        return;
      }
      if (answer === question.answer) {
        newQuestionsStatus[question.id] = true;
      } else {
        newQuestionsStatus[question.id] = false;
      }
    });
    setQuestionsStatus(newQuestionsStatus);
  };
  console.log(questionsStatus);
  return (
    <div className="flex-[1] mt-16 ml-0 sm:ml-8">
      <h1 className="text-2xl font-bold">Concept Check</h1>
      <div className="mt-2">
        {chapter.questions.map((question) => {
          const options = JSON.parse(question.options) as string[];
          return (
            <div
              className={cn("p-3 mt-4 border border-secondary rounded-lg", {
                "bg-green-700": questionsStatus[question.id] === true,
                "bg-red-700": questionsStatus[question.id] === false,
                "bg-secondary": questionsStatus[question.id] === null,
              })}
              key={question.id}
            >
              <h1 className="text-lg font-semibold">{question.question}</h1>
              <div className="mt-2">
                <RadioGroup
                  defaultValue="comfortable"
                  onValueChange={(e) => {
                    setQuestionsStatus((prev) => {
                      prev[question.id] = null;
                      return prev;
                    });
                    setAnswers((prev) => {
                      prev[question.id] = e;
                      return prev;
                    });
                  }}
                >
                  {options.map((option, index) => {
                    return (
                      <div className="flex items-center space-x-2" key={index}>
                        <RadioGroupItem
                          value={option}
                          id={question.id + index.toString()}
                        />
                        <Label htmlFor={question.id + index.toString()}>
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          );
        })}
      </div>
      <Button
        className="w-full mt-2"
        size="lg"
        onClick={() => {
          checkAnswer();
        }}
      >
        Check Answer
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

export default QuizCards;
