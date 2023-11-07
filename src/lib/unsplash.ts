export const getUnsplashImage = async (query: string) => {
  const imageResponseRaw = await fetch(
    `https://api.unsplash.com/search/photos?per_page=1&query=${query}&client_id=${process.env.UNSPLASH_API_KEY}`
  );
  const imageResponse = await imageResponseRaw.json();
  return imageResponse.results[0].urls.small_s3;
};
