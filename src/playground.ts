import { openai } from "./lib/gpt";


const chapterTitles = ['differentation', 'integration', 'fourier transformation']
const title = 'math'

const response = await openai.createChatCompletion({
    temperature: 0.5,
    model: 'gpt-4-turbo',
    response_format: { type: "json_object" },
    messages: [
        {
            role: "system",
            content: "You are an AI capable of curating course content and only answer in JSON,"
        },
        {
            role: 'user',
            content: `
            please provide a fake 200 word summary for a video on ${chapterTitles[0]}.
            answer in {summary: 'your summary here'}
            `
        }
    ],
});

const data = await response.json()
let res = JSON.parse(data.choices[0].message?.content)
console.log(JSON.stringify(res, null, 2))
