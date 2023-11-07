import { YoutubeTranscript } from "youtube-transcript";
export async function searchYouTube(searchQuery: string) {
  searchQuery = searchQuery.replaceAll(" ", "+");
  console.count("youtube search");
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`,
    {
      method: "GET",
    }
  );
  const json = await response.json();
  if (!json) {
    console.log("youtube fail");
    return null;
  }
  if (json.items[0] == undefined) {
    console.log("youtube fail");
    return null;
  }
  return json.items[0].id.videoId;
}

export async function getTranscript(videoId: string) {
  try {
    let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
      country: "EN",
    });
    let transcript = "";
    for (let i = 0; i < transcript_arr.length; i++) {
      transcript += transcript_arr[i].text + " ";
    }
    transcript = transcript.replaceAll("\n", " ");
    const MAX_LENGTH = 500;
    transcript = transcript.split(" ").slice(0, MAX_LENGTH).join(" ");
    return transcript;
  } catch (e) {
    // const response = await fetch(
    //   `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API}&id=${videoId}&videoDuration=medium&videoEmbeddable=true&type=video&part=snippet&maxResults=1`,
    //   {
    //     method: "GET",
    //   }
    // );
    // const json = await response.json();
    // return json.items[0].snippet.title;
    return "";
  }
}
