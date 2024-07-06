import { google } from "googleapis";

export const searchGoogle = async (searchTerm) => {
  try {
    const customsearch = google.customsearch('v1');
    const result = await customsearch.cse.list({
      auth: process.env.GOOGLE_API_KEY,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      q: searchTerm,
      num: 1
    });

    if (result.data.items && result.data.items.length > 0) {
      const snippet = result.data.items[0].snippet;
      return snippet;
    } else {
      return "No results found for the given search term.";
    }
  } catch (error) {
    console.error("Error in searchGoogle:", error);
    return "An error occurred while searching for information.";
  }
};