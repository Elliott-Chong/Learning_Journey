import { buttonVariants, Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/nextauth";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};

const Dashboard = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }
  return (
    <>
      <Link href="/create" className={buttonVariants()}>
        meow
      </Link>
      <Button className="">ihiiiiiii</Button>
    </>
  );
};

export default Dashboard;
