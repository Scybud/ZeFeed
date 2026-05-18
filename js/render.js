import { supabase } from "./supabase.js";
import { formatTimeAgo } from "./utils/time.js";


function buildFeedBlocks(summaries) {
  const blocks = [];

  /* SPLIT ARTICLES */

  const aiNews = [];
  const normalNews = [];

  summaries.forEach((item) => {
    const category = (item.category || "").toLowerCase();

    const isAI =
      category.includes("ai") ||
      category.includes("artificial intelligence") ||
      category.includes("machine learning");

    if (isAI) {
      aiNews.push(item);
    } else {
      normalNews.push(item);
    }
  });

  /* RENDER NORMAL FEED */

  normalNews.forEach((summary, index) => {
    blocks.push({
      type: "summary",
      data: summary,
    });

    /* INSERT AI RAIL AFTER 4TH NORMAL ARTICLE */

    if (index === 1 && aiNews.length > 0) {
      blocks.push({
        type: "ai-rail",
        data: aiNews,
      });
    }
  });

  return blocks;
}

function renderFeed(blocks, container) {
  blocks.forEach((block) => {
    switch (block.type) {
      case "summary":
        container.appendChild(createSummaryCard(block.data));
        break;

      case "ai-rail":
        container.appendChild(createAIRail(block.data));
        break;
    }
  });
}

function createSummaryCard(summary) {
  const card = document.createElement("article");

  card.classList.add("summaryCard");

  card.innerHTML = `
    <div class="summaryTop">
      <span class="source">${summary.source}</span>
      <span class="dot">•</span>

      <span class="time">
        ${formatTimeAgo(summary.published_at)}
      </span>
    </div>

    <h3 class="headline">
      ${summary.title}
    </h3>

    <p class="summary">
      ${summary.summary || "No summary available."}
    </p>

    <a
      href="${summary.url}"
      class="sourceUrl"
      target="_blank"
      rel="noopener"
    >
      Read on ${summary.source} →
    </a>
  `;

  return card;
}

function createAIRail(news) {
  const rail = document.createElement("section");

  rail.classList.add("aiNewsRail");

  rail.innerHTML = `
    <div class="railTop">

      <h2>Trending in AI</h2>

      <div class="railControls">
        <button class="railBtn prevBtn">
          ←
        </button>

        <button class="railBtn nextBtn">
          →
        </button>
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

        <span class="time">
          ${formatTimeAgo(item.published_at)}
        </span>
      </div>

      <h3 class="headline">
        ${item.title}
      </h3>

      <p class="summary">
        ${item.summary?.slice(0, 120) || "No summary available."}
      </p>

      <a
        href="${item.url}"
        class="sourceUrl"
        target="_blank"
        rel="noopener"
      >
        Read on ${item.source} →
      </a>
    `;

    track.appendChild(card);
  });

  /* BUTTON CONTROLS */

  const prevBtn = rail.querySelector(".prevBtn");
  const nextBtn = rail.querySelector(".nextBtn");

  const scrollAmount = 400;

  prevBtn.addEventListener("click", () => {
    track.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });
  });

  nextBtn.addEventListener("click", () => {
    track.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  });

  return rail;
}

export async function loadNewsSummary() {
  const { data: summaries, error } = await supabase
    .from("articles")
    .select("source, published_at, title, summary, url, category")
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

  if (!summariesFeed) return;

  /* CLEANED:
     moved this after the null check
     because no point continuing if feed doesn't exist
  */
  if (summaryCount) {
    summaryCount.textContent = summaries.length;
  }

  summariesFeed.innerHTML = "";

  if (summaries.length === 0) {
    summariesFeed.innerHTML = `
      <p class="placeholderText">
        Nothing new yet.
      </p>
    `;

    return;
  }

  const feedBlocks = buildFeedBlocks(summaries);

  renderFeed(feedBlocks, summariesFeed);
}

export async function loadNewsArticle() {
  const { data: articles, error } = await supabase
    .from("articles")
    .select(
      "source, published_at, title, description, image_url, url, has_image",
    )
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

  if (!articlesFeed) return;

  /* CLEANED:
     same improvement as summaries
  */
  if (articleCount) {
    articleCount.textContent = articles.length;
  }

  articlesFeed.innerHTML = "";

  if (articles.length === 0) {
    articlesFeed.innerHTML = `
      <p class="placeholderText">
        Nothing new yet.
      </p>
    `;

    return;

    /* FIXED:
       added return so it stops rendering
    */
  }

  articles.forEach((article) => {
    const card = document.createElement("a");

    card.href = article.url;
    card.target = "_blank";
    card.rel = "noopener";

    card.classList.add("articleCard");

    /* CLEANED:
       removed duplicated markup
       only image section changes now
    */
    card.innerHTML = `
      ${
        article.has_image && article.image_url?.trim()
          ? `
            <img
              class="cardImg"
              loading="lazy"
              src="${article.image_url}"
              alt="${article.title}"
            />
          `
          : `
            <div class="placeholderImg"></div>
          `
      }

      <div class="articleCardContent">
        <h2 class="cardTitle">
          ${article.title}
        </h2>

        <p class="cardDesc">
          ${article.description || "No description available."}
        </p>
      </div>

      <div class="cardMeta">
        <span class="source">
          ${article.source}
        </span>

        <span class="time">
          ${formatTimeAgo(article.published_at)}
        </span>
      </div>
    `;

    articlesFeed.appendChild(card);
  });
}
