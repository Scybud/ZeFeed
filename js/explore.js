import { fetchArticles } from "./data/fetch.js";
import { renderNewsArticles } from "./render/renderArticles.js";
import { buildFeedBlocks } from "./render/feedBlocks.js";

window.addEventListener("DOMContentLoaded", async () => {
  const { data: articles } = await fetchArticles();
  renderNewsArticles(articles);
});
