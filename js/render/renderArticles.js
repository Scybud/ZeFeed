import { formatTimeAgo } from "../utils/time.js";

export function renderNewsArticles(articles) {
  const feed = document.querySelector(".articlesFeed");
  const count = document.querySelector(".articleCount");

  if (!feed) return;

  if (count) count.textContent = articles.length;

  feed.innerHTML = "";

  if (articles.length === 0) {
    feed.innerHTML = `<p class="placeholderText">Nothing new yet.</p>`;
    return;
  }

  articles.forEach((article) => {
    const card = document.createElement("a");
    card.href = article.url;
    card.target = "_blank";
    card.rel = "noopener";
    card.classList.add("articleCard");

    card.innerHTML = `
      ${
        article.has_image && article.image_url?.trim()
          ? `<img class="cardImg" loading="lazy" src="${article.image_url}" alt="${article.title}" />`
          : `<div class="placeholderImg"></div>`
      }

      <div class="articleCardContent">
        <h2 class="cardTitle">${article.title}</h2>
        <p class="cardDesc">${article.description || "No description available."}</p>
      </div>

      <div class="cardMeta">
        <span class="source">${article.source}</span>
        <span class="time">${formatTimeAgo(article.published_at)}</span>
      </div>
    `;

    feed.appendChild(card);
  });
}
