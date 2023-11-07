import ConfirmChapters from "@/components/ConfirmChapters";
import { Card } from "@/components/ui/card";
import { getAuthSession } from "@/lib/nextauth";
import { prisma } from "@/lib/prisma";
import { Info } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    courseId: string;
  };
};

const SecondStepCreateCourse = async ({ params: { courseId } }: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      units: { include: { chapters: true } },
    },
  });
  if (!course) {
    return redirect("/");
  }
  //   return <pre>{JSON.stringify(course, null, 2)}</pre>;
  return (
    <div className="flex flex-col items-start max-w-xl mx-auto my-16">
      <h5 className="text-sm uppercase text-secondary-foreground/60">
        Course Name
      </h5>
      <h1 className="text-5xl font-bold">{course.name}</h1>
      <Card className="flex p-4 mt-5 border-none bg-secondary">
        <Info className="w-12 h-12 mr-3 text-blue-400" />
        <div>
          We generated chapters for each of your units. Look over them and then
          click the &quot;Finish Course Generation&quot; button to confirm and
          continue.
        </div>
      </Card>
      <ConfirmChapters course={course} />
    </div>
  );
};

export default SecondStepCreateCourse;
