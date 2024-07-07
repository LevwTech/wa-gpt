import axios from 'axios';
import { SEARCH_RESULTS_NUMBER } from './helpers/constants.mjs';

export const searchGoogle = async (searchTerm) => {
    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: process.env.GOOGLE_API_KEY,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
          q: searchTerm,
          num: SEARCH_RESULTS_NUMBER,
          fields: 'items(title,snippet)'
        }
      });
  
      if (response.data.items && response.data.items.length > 0) {
        const results = response.data.items.map((item, index) => 
          `Result ${index + 1}:\nTitle: ${item.title}\nSnippet: ${item.snippet}\n`
        );
        return results.join('\n');
      } else {
        return "No results found for the given search term.";
      }
    } catch (error) {
      console.error("Error in searchGoogle:", error);
      return "An error occurred while searching for information.";
    }
  };