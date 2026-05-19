import { supabase } from "../supabase.js";

//FETCH ARTICLES
export async function fetchArticles() {
  return await supabase
    .from("articles")
    .select(
      "source, published_at, title, description, image_url, url, has_image",
    )
    .eq("has_image", true)
    .order("published_at", { ascending: false });
}

//FETCH SUMMARIES
export async function fetchSummaries() {
  return await supabase
    .from("articles")
    .select("source, published_at, title, summary, url, category")
    .order("published_at", { ascending: false });
}