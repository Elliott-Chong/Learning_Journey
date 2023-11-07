import { palmGetQuestionFromTranscript } from "@/lib/palm";
import { NextResponse } from "next/server";

export async function POST() {
  const transctip = `Hogwarts Legacy is a new immersive open-world action roleplaying game set in the wizarding world. Experience Hogwarts School of Witchcraft and Wizardry in the 1890s as a student who holds the key to an ancient secret that threatens to tear the wizarding world apart.

    Explore Hogwarts, Hogsmeade, the Forbidden Forest, and the surrounding Overland area. Learn spells, brew potions, grow plants, and tend to magical beasts along your journey. Get sorted into your House, forge relationships, and master skills to become the witch or wizard you want to be. Experience the wizarding world in an unexplored era to uncover a hidden truth from its past. Battle against trolls, Dark wizards, goblins, and more as you face a dangerous villain threatening the fate of the wizarding world.
    
    Hogwarts Legacy is published by Warner Bros. Games under the Portkey Games label and developed by Avalanche Software. The game launched on 10 February 2023 on PlayStation 5, Xbox X|S, and PC, and on 5 May 2023 on PlayStation 4 and Xbox One. It will be released on 14 November 2023 on Nintendo Switch. `;
  const questions = await palmGetQuestionFromTranscript(
    transctip,
    "Hogwarts Legacy"
  );
  return NextResponse.json({ questions });
}
