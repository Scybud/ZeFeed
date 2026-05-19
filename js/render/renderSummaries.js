import { createSummaryCard } from "./summaryCards.js";
import { createAIRail } from "./aiRail.js";

export function renderSummaries(summaries, blocks, container) {
  const feed = document.querySelector(".summariesFeed");
  const count = document.querySelector(".summaryCount");

  if (!feed) return;

  // Correct count
  if (count) {
    count.textContent = summaries.length;
  }

  container.innerHTML = ""
  blocks.forEach((block) => {
    if (block.type === "summary") {
      container.appendChild(createSummaryCard(block.data));
    } else if (block.type === "ai-rail") {
      container.appendChild(createAIRail(block.data));
    }
  });
}
