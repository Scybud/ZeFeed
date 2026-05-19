import { toggleHistoryView } from "./utils/toggle.js";
import { fetchHistories } from "./data/fetch.js";
import { initHistories } from "./render/renderHistory.js";
import {shuffleArray} from "./utils/shuffleData.js"

window.addEventListener("DOMContentLoaded", async () => {

    const { data, error } = await fetchHistories();

    if (error) {
      console.error(error);
    } else {
        const shuffledData = shuffleArray(data);

      initHistories(shuffledData);
    }

  toggleHistoryView();
});

