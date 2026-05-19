import { formatTimeAgo } from "../utils/time.js";

export function createSummaryCard(summary) {
  const card = document.createElement("article");
  card.classList.add("summaryCard");

  card.innerHTML = `
    <div class="summaryTop">
      <span class="source">${summary.source}</span>
      <span class="dot">•</span>
      <span class="time">${formatTimeAgo(summary.published_at)}</span>
    </div>

    <h3 class="headline">${summary.title}</h3>

    <p class="summary">${summary.summary || "No summary available."}</p>

    <a href="${summary.url}" class="sourceUrl" target="_blank" rel="noopener">
      Read on ${summary.source} →
    </a>
  `;

  return card;
}
