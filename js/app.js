import { fetchArticles, fetchSummaries } from "./data/fetch.js";
import { renderNewsArticles } from "./render/renderArticles.js";
import { buildFeedBlocks } from "./render/feedBlocks.js";
import { renderSummaries } from "./render/renderSummaries.js";
import { handleSidebarToggle } from "./utils/toggle.js";

window.addEventListener("DOMContentLoaded", async () => {
  const { data: articles } = await fetchArticles();
  renderNewsArticles(articles);

 const { data: summaries } = await fetchSummaries();
 const blocks = buildFeedBlocks(summaries);

 renderSummaries(summaries, blocks, document.querySelector(".summariesFeed"));


  handleSidebarToggle();
});
