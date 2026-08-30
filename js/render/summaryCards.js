import { formatTimeAgo } from "../utils/time.js";


export function createSummaryCard(summary) {
  const card = document.createElement("article");
  card.id = summary.id;
  card.classList.add("summaryCard");

  const summaryUrl = addUtm(summary.url);
  
  card.innerHTML = `
    <div class="summaryTop">
      <span class="source">${summary.source}</span>
      <span class="dot">•</span>
      <span class="time">${formatTimeAgo(summary.published_at)}</span>
    </div>

    <h3 class="headline">${summary.title}</h3>

    <p class="summary">${summary.summary || "No summary available."}</p>


    ${
      summaryUrl
        ? `<a href="${summaryUrl}" class="sourceUrl" target="_blank" rel="noopener">
             Read on ${summary.source} →
           </a>`
        : `<span class="sourceUrl disabled">No link available</span>`
    }
  `;

  return card;
}


function addUtm(url) {
  if (!url) return null;

  const hasQuery = url.includes("?");
  const separator = hasQuery ? "&" : "?";

  return `${url}${separator}utm_source=zefeed`;
}
