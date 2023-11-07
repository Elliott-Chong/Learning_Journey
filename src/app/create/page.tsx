import CreateCourseForm from "@/components/CreateCourseForm";
import { getAuthSession } from "@/lib/nextauth";
import { checkSubscription } from "@/lib/subscription";

import { redirect } from "next/navigation";
import React from "react";

type Props = {};

const CreateLearningJourney = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/gallery");
  }
  const isPro = await checkSubscription();
  return <CreateCourseForm isPro={isPro} />;
};

export default CreateLearningJourney;
