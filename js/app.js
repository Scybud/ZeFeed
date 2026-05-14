import { loadNewsArticle, loadNewsSummary } from "./render.js";
import { handleSidebarToggle } from "./utils/toggle.js";

window.addEventListener("DOMContentLoaded", () => {
loadNewsArticle();
loadNewsSummary();

handleSidebarToggle();
})