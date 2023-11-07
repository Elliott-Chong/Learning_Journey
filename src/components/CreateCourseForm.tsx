"use client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createChaptersSchema } from "@/validators/course";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "./ui/separator";
import { Plus, Trash, Upload, Zap } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";
import SubscriptionAction from "./SubscriptionAction";
import { uploadToS3 } from "@/lib/s3";
import LoadingQuestions from "./LoadingScreen";

type Input = z.infer<typeof createChaptersSchema>;

const CreateCourseForm = ({ isPro }: { isPro: boolean }) => {
  const [showLoader, setShowLoader] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: createChapters, isLoading: creatingChapters } = useMutation({
    mutationFn: async ({ units, title }: Input) => {
      console.log("meow");
      let s3_file_key = null;
      if (file) {
        s3_file_key = await uploadToS3(file);
        console.log("s3_file_key", s3_file_key);
      }
      // return;
      const payload = {
        units,
        title,
        s3_file_key,
      };
      const response = await axios.post("/api/course/createChapters", payload);
      return response.data;
    },
  });
  const form = useForm<Input>({
    resolver: zodResolver(createChaptersSchema),
    defaultValues: {
      title: "",
      units: ["", "", ""],
    },
  });
  function onSubmit(data: Input) {
    if (data.units.some((unit) => unit === "")) {
      toast({
        title: "Error",
        description: "Please fill out all units",
        variant: "destructive",
      });
      return;
    }
    setShowLoader(true);
    createChapters(
      { ...data },
      {
        onSuccess: ({ course_id }) => {
          setFinished(true);
          setShowLoader(false);
          setTimeout(() => {
            router.push(`/create/${course_id}`);
          }, 1000);
        },
        onError: (error) => {
          setShowLoader(false);
          if (error instanceof AxiosError) {
            if (error.response?.status === 400) {
              toast({
                title: "You have run out of free credits!",
                description: "Please upgrade to create more courses",
                variant: "destructive",
              });
              return;
            }
            toast({
              title: "Error",
              description: "There was an error creating your course",
              variant: "destructive",
            });
          }
          console.log("error", error);
        },
      }
    );
  }
  form.watch();
  if (showLoader) {
    return <LoadingQuestions finished={finished} />;
  }

  return (
    <div className="flex flex-col items-start max-w-xl px-8 mx-auto my-16 sm:px-0">
      <h1 className="self-center text-3xl font-bold text-center sm:text-6xl">
        Learning Journey
      </h1>
      <Card className="flex p-4 mt-5 border-none bg-secondary">
        <Info className="w-12 h-12 mr-3 text-blue-400" />
        <div>
          Enter in a course title, or what you want to learn about. Then enter a
          list of units, which are the specifics you want to learn. and our AI
          will generate a course for you!
          <br />
          <br />
          You may also upload a file that will be used to generate the course.
        </div>
      </Card>
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full sm:items-center sm:flex-row">
                  <FormLabel className="flex-[1] text-xl">Title</FormLabel>
                  <FormControl className="flex-[6]">
                    <Input
                      placeholder="Enter the main topic of the course (e.g. 'Calculus')"
                      disabled={creatingChapters}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <AnimatePresence initial={false}>
              {form.watch("units").map((_, index) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      height: { duration: 0.2 },
                    }}
                  >
                    <FormField
                      control={form.control}
                      name={`units.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start w-full sm:items-center sm:flex-row">
                          <FormLabel className="flex-[1] text-xl">
                            Unit {index + 1}
                          </FormLabel>
                          <FormControl className="flex-[6]">
                            <Input
                              disabled={creatingChapters}
                              placeholder="Enter subtopic of the course (e.g. 'What is differentiation?')"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div className="flex items-center justify-center mt-4">
              <Separator className="flex-[1]" />
              <div className="mx-4">
                <Button
                  variant="secondary"
                  className="font-semibold"
                  type="button"
                  onClick={() => {
                    form.setValue("units", [...form.watch("units"), ""]);
                  }}
                >
                  Add Unit
                  <Plus
                    className="w-4 h-4 ml-2 text-green-500 "
                    strokeWidth={4}
                  />
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  className="ml-2 font-semibold"
                  onClick={() => {
                    if (form.watch("units").length === 1) {
                      toast({
                        title: "Error",
                        description: "You must have at least one unit",
                        variant: "destructive",
                      });
                      return;
                    }
                    form.setValue("units", form.watch("units").slice(0, -1));
                  }}
                >
                  Remove Unit <Trash className="w-4 h-4 ml-2 text-red-500" />
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  className="ml-2 font-semibold"
                  onClick={() => {
                    // upload file

                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".pdf";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      setFile(file);
                    };
                    input.click();
                  }}
                >
                  Upload PDF <Upload className="w-4 h-4 ml-2 " />
                </Button>
              </div>
              <Separator className="flex-[1]" />
            </div>
            {file && (
              <div className="flex items-center justify-center mt-4">
                <Separator className="flex-[1]" />
                <span>{file.name}</span>
                <div className="mx-4">
                  <Button
                    variant="secondary"
                    type="button"
                    className="ml-2 font-semibold"
                    onClick={() => {
                      setFile(null);
                    }}
                  >
                    Remove File <Trash className="w-4 h-4 ml-2 text-red-500" />
                  </Button>
                </div>
                <Separator className="flex-[1]" />
              </div>
            )}
            <Button
              type="submit"
              className="w-full mt-6"
              size="lg"
              isLoading={creatingChapters}
            >
              Let&apos;s Go!
            </Button>
          </form>
        </Form>
        {/* {!isPro && <SubscriptionAction />} */}
      </div>
    </div>
  );
};

export default CreateCourseForm;
