import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";

export default async function Home() {
  return redirect("/gallery");
}
