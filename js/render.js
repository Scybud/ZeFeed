import { supabase } from "./supabase.js";
import { formatTimeAgo } from "./utils/time.js";

async function loadNewsSummary() {
  const { data: articles, error } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error loading articles:", error);
    return;
  }


  renderArticles(articles);
}

function renderArticles(articles) {
  const feed = document.querySelector(".feed");

  feed.innerHTML = "";

  if(articles.length === 0) {
    feed.innerHTML = `<p class="placeholderText">Nothing new yet.</p>`
  }
  articles.forEach((article) => {
    const card = document.createElement("a");
card.href = article.url;

    card.classList.add("summaryCard");

    card.innerHTML = `
            <div class="summaryTop">
                <span class="source">${article.source}</span>
                <span class="dot">•</span>
                <span class="time">  ${formatTimeAgo(article.published_at)}
</span>
            </div>

            <h2 class="headline">
                ${article.title}
            </h2>

            <p class="summary">
                ${article.summary}
            </p>
        `;

    feed.appendChild(card);

  });
}

loadNewsSummary();
