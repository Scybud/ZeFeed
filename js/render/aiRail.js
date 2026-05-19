import { formatTimeAgo } from "../utils/time.js";

export function createAIRail(news) {
  const rail = document.createElement("section");
  rail.classList.add("aiNewsRail");

  rail.innerHTML = `
    <div class="railTop">
      <h2>Trending in AI</h2>
      <div class="railControls">
        <button class="railBtn prevBtn">←</button>
        <button class="railBtn nextBtn">→</button>
      </div>
    </div>
    <div class="railTrack"></div>
  `;

  const track = rail.querySelector(".railTrack");

  news.forEach((item) => {
    const card = document.createElement("article");
    card.classList.add("railCard");

    card.innerHTML = `
      <div class="summaryTop">
        <span class="source">${item.source}</span>
        <span class="dot">•</span>
        <span class="time">${formatTimeAgo(item.published_at)}</span>
      </div>

      <h3 class="headline">${item.title}</h3>

      <p class="summary">${item.summary?.slice(0, 120) || "No summary available."}</p>

      <a href="${item.url}" class="sourceUrl" target="_blank" rel="noopener">
        Read on ${item.source} →
      </a>
    `;

    track.appendChild(card);
  });

  const scrollAmount = 400;

  rail.querySelector(".prevBtn").addEventListener("click", () => {
    track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });

  rail.querySelector(".nextBtn").addEventListener("click", () => {
    track.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  return rail;
}
