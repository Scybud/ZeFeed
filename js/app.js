import { handleSidebarToggle } from "./utils/toggle.js";
import { loadAnalytics, handleConcentEvents } from "./analytics.js";


document.addEventListener("DOMContentLoaded", async () => {

  handleSidebarToggle();

  //ANALYTICS
handleConcentEvents();

const saved = localStorage.getItem("consent-preferences");
const consentBanner = document.getElementById("consentBanner");
const editConcentBtn = document.getElementById("editConcentBtn");

if (saved) {
  // Hide banner
  if (consentBanner) consentBanner.remove();

  // Show edit button
  document.body.appendChild(editConcentBtn);

  if (saved === "allows tracking") loadAnalytics();
} else {
  // Show banner
  document.body.appendChild(consentBanner);

  // Hide edit button
  editConcentBtn.remove();
}

});
