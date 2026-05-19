export function buildFeedBlocks(summaries) {
  const aiNews = [];
  const normalNews = [];

  summaries.forEach((item) => {
    const category = (item.category || "").toLowerCase();
    const isAI =
      category.includes("ai") ||
      category.includes("artificial intelligence") ||
      category.includes("machine learning");

    (isAI ? aiNews : normalNews).push(item);
  });

  const blocks = [];

  normalNews.forEach((summary, index) => {
    blocks.push({ type: "summary", data: summary });

    if (index === 1 && aiNews.length > 0) {
      blocks.push({ type: "ai-rail", data: aiNews });
    }
  });

  return blocks;
}
