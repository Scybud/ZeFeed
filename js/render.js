import { supabase } from "./supabase.js";
import { formatTimeAgo } from "./utils/time.js";

export async function loadNewsSummary() {
  const { data: summaries, error } = await supabase
    .from("articles")
    .select("source, published_at, title, summary, url")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error loading news summaries:", error);
    return;
  }

  renderNewsSummary(summaries);
}

function renderNewsSummary(summaries) {
  const summariesFeed = document.querySelector(".summariesFeed");
  const summaryCount = document.querySelector(".summaryCount");

  if(summaryCount) {
    summaryCount.textContent = summaries.length
  }
  if (!summariesFeed) return;
  summariesFeed.innerHTML = "";

  if (summaries.length === 0) {
    summariesFeed.innerHTML = `<p class="placeholderText">Nothing new yet.</p>`;
  }
  summaries.forEach((summary) => {
    const card = document.createElement("div");
    card.href = summary.url;
    card.target = "_blank";
    card.rel = "noopener";

    card.classList.add("summaryCard");

    card.innerHTML = `
            <div class="summaryTop">
                <span class="source">${summary.source}</span>
                <span class="dot">•</span>
                <span class="time">  ${formatTimeAgo(summary.published_at)}
</span>
            </div>

            <h2 class="headline">
                ${summary.title}
            </h2>

            <p class="summary">
                ${summary.summary}
            </p>
            <a href=${summary.url} class="sourceUrl" target="_blank">Read on ${summary.source} →</a>
        `;

    summariesFeed.appendChild(card);
  });
}

export async function loadNewsArticle() {
  const { data: articles, error } = await supabase
    .from("articles")
    .select("source, published_at, title, description, image_url, url, has_image")
    .eq("has_image", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error loading articles:", error);
    return;
  }

  renderNewsArticles(articles);
}

function renderNewsArticles(articles) {
  const articlesFeed = document.querySelector(".articlesFeed");
    const articleCount = document.querySelector(".articleCount");

    if (articleCount) {
      articleCount.textContent = articles.length;
    }
  if (!articlesFeed) return;

  articlesFeed.innerHTML = "";

  if (articles.length === 0) {
    articlesFeed.innerHTML = `<p class="placeholderText">Nothing new yet.</p>`;
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
      ? `
        <img class="cardImg" loading="lazy" src="${article.image_url}" />
        <div class="articleCardContent">
          <h2 class="cardTitle">${article.title}</h2>
          <p class="cardDesc">${article.description}</p>
        </div>
        <div class="cardMeta">
          <span class="source">${article.source}</span>
          <span class="time">${formatTimeAgo(article.published_at)}</span>
        </div>
      `
      : `
        <div class="placeholderImg"></div>
        <div class="articleCardContent">
          <h2 class="cardTitle">${article.title}</h2>
          <p class="cardDesc">${article.description}</p>
        </div>
        <div class="cardMeta">
          <span class="source">${article.source}</span>
          <span class="time">${formatTimeAgo(article.published_at)}</span>
        </div>
      `
  }
`;


    articlesFeed.appendChild(card);
  });
}
