import { strict_output } from "./gpt";

export async function promptPalm(prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${process.env.PALM_API}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: {
          text: prompt,
        },
        temperature: 0.4,
        top_k: 40,
        top_p: 0.95,
        candidate_count: 1,
        max_output_tokens: 2048,
        stop_sequences: [],
        safety_settings: [
          { category: "HARM_CATEGORY_DEROGATORY", threshold: 3 },
          { category: "HARM_CATEGORY_TOXICITY", threshold: 3 },
          { category: "HARM_CATEGORY_VIOLENCE", threshold: 3 },
          { category: "HARM_CATEGORY_SEXUAL", threshold: 3 },
          { category: "HARM_CATEGORY_MEDICAL", threshold: 3 },
          { category: "HARM_CATEGORY_DANGEROUS", threshold: 3 },
        ],
      }),
    }
  );
  console.log("PaLM api status: ", response.status);
  const json = await response.json();
  return json.candidates[0].output;
}

function limitWordCount(text: string, limit: number) {
  const words = text.split(" ");
  return words.slice(0, limit).join(" ");
}

export async function getQuestionsFromTranscript(
  transcript: string,
  course_title: string
) {
  transcript = limitWordCount(transcript, 100);
  const questions = (await strict_output(
    "You are a helpful AI that is able to generate mcq of question and answers, the length of each answer should not be more than 15 words",
    new Array(5).fill(
      `You are to generate a random hard mcq question about ${course_title} with context of the following transcript: ${transcript}`
    ),
    {
      question: "question",
      answer: "answer with max length of 15 words",
      option1: "option1 with max length of 15 words",
      option2: "option2 with max length of 15 words",
      option3: "option3 with max length of 15 words",
    }
  )) as {
    question: string;
    answer: string;
    option1: string;

    option2: string;
    option3: string;
  }[];

  return questions;
}
export async function palmGetQuestionFromTranscript(
  transcript: string,
  chapter_title: string
) {
  let quizPrompt = `${transcript}\n
Generate at least a 3 question educational informative quiz on the text given above. The questions should be on the material of the entire transcript as a whole. The question should be knowledgeable and not about the specifics. The question should relate to ${chapter_title}. The output has to be an array of questions. Each question should have a question, which is a string question, the choices, which is 3 possible answer choices represented in an array, and the answer.

Here is an example answer:
[
{
  "question": "What is (sqrt(16)+5-4)/1/24",
  "choices": ["120", "40", "12"],
  "answer": "100" 
},
{
  "question": "What is a forrier trnasformation?",
  "choices": ["a transform that converts a function into a form that describes the frequencies present in the original function", "infinite sum of terms that approximate a function as a polynomial", "mathematical function that can be formally defined as an improper Riemann integral"],
  "answer": "certain kind of approximation of an integral by a finite sum"
}
]`;
  let quizJSON;
  let gotQuiz = false;
  let triedQuiz = 0;
  while (!gotQuiz) {
    if (triedQuiz < 5) {
      try {
        let quiz = await promptPalm(quizPrompt);
        console.log("got palm quiz response");
        const quizFragments = quiz.split("[");
        let quizString = "";
        for (const i in quizFragments) {
          if (Number(i) == 0) {
          } else {
            if (Number(i) == quizFragments.length - 1) {
              quizString += "[";
              quizString += quizFragments[i].split("`")[0];
            } else {
              quizString += "[";
              quizString += quizFragments[i];
            }
          }
        }
        console.log("about to parse quiz");
        quizJSON = await JSON.parse(quizString);
        gotQuiz = true;
        console.log("parsed quiz");
      } catch (error) {
        console.log("FAILED: Error Info getting guiz");
        console.log("prompt:\n", quizPrompt);
        console.log("error:\n", error, "\n\n");
      }
      triedQuiz++;
      return quizJSON as {
        question: string;
        choices: string[];
        answer: string;
      }[];
    } else {
      throw new Error("tried getting quiz too many times");
    }
  }
}
