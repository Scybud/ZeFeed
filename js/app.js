import { handleSidebarToggle } from "./utils/toggle.js";
import { loadAnalytics, handleConcentEvents } from "./analytics.js";


window.addEventListener("DOMContentLoaded", async () => {

  handleSidebarToggle();

  //ANALYTICS
handleConcentEvents()

  const saved = localStorage.getItem("consent-preferences");
  if (saved) {
    const prefs = saved;
    const consentBanner = document.getElementById("consentBanner");
    if (consentBanner) consentBanner.remove();
    
    if (prefs === "allows tracking") loadAnalytics();
  }
});
