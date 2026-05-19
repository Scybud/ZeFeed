import { fetchSummaries } from "./data/fetch.js";
import { buildFeedBlocks } from "./render/feedBlocks.js";
import { renderSummaries } from "./render/renderSummaries.js";

window.addEventListener("DOMContentLoaded", async () => {

 const { data: summaries } = await fetchSummaries();
 const blocks = buildFeedBlocks(summaries);

 renderSummaries(summaries, blocks, document.querySelector(".summariesFeed"));


});
