import GalleryCourseCard from "@/components/GalleryCourseCard";
import { prisma } from "@/lib/prisma";
import React from "react";

type Props = {};

const GalleryPage = async (props: Props) => {
  const courses = await prisma.course.findMany({
    include: {
      units: {
        include: {
          chapters: true,
        },
      },
    },
  });
  courses.reverse();
  return (
    <div className="py-8 mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:px-0">
        {courses.map((course) => {
          return <GalleryCourseCard course={course} key={course.id} />;
        })}
      </div>
    </div>
  );
};

export default GalleryPage;
