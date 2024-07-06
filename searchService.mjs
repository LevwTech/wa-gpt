import axios from 'axios';

export const searchGoogle = async (searchTerm) => {
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: process.env.GOOGLE_API_KEY,
        cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
        q: searchTerm,
        num: 1
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      const snippet = response.data.items[0].snippet;
      return snippet;
    } else {
      return "No results found for the given search term.";
    }
  } catch (error) {
    console.error("Error in searchGoogle:", error);
    return "An error occurred while searching for information.";
  }
};