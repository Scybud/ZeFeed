import { fetchSummaries } from "./data/fetch.js";
import { buildFeedBlocks } from "./render/feedBlocks.js";
import { renderSummaries } from "./render/renderSummaries.js";
import { supabase } from "./supabase.js";
import { AudioReader } from "./utils/audioReader.js";

window.addEventListener("DOMContentLoaded", async () => {

 const { data: summaries } = await fetchSummaries();
 const blocks = buildFeedBlocks(summaries);

 renderSummaries(summaries, blocks, document.querySelector(".summariesFeed"));



const playBtn = document.getElementById("reader-play-btn");
const prevBtn = document.getElementById("reader-prev-btn");
const nextBtn = document.getElementById("reader-next-btn");
const positionEl = document.getElementById("reader-position");
const titleEl = document.getElementById("reader-title");

let queueLoaded = false;

const reader = new AudioReader({
  onArticleChange: (script, index, total) => {
    positionEl.textContent = `${index + 1} / ${total}`;
    titleEl.textContent = script.title;
    titleEl.href = "#" + script.id;
  },
  onStateChange: (state) => {
    playBtn.textContent = state === "playing" ? "⏸" : "▶";
  },
  onQueueEnd: () => {
    positionEl.textContent = "Done";
    titleEl.textContent = "";
  },
});

async function loadQueueIfNeeded() {
  if (queueLoaded) return;
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, summary, description, source")
    .order("published_at", { ascending: false });
    
  if (error) {
    console.error("Failed to load articles for reader:", error);
    return;
  }
  reader.setQueue(data);
  queueLoaded = true;
}

playBtn.addEventListener("click", async () => {
  await loadQueueIfNeeded(); // must resolve before play() to keep this inside the same user gesture chain on most browsers
  reader.isPlaying ? reader.pause() : reader.play();
});

nextBtn.addEventListener("click", () => reader.next());
prevBtn.addEventListener("click", () => reader.previous());
});
