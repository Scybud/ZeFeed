export function loadAnalytics() {
  if (window.__analyticsLoaded) return;
  window.__analyticsLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-7VJLL0C80S";
  document.head.appendChild(script);

  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", "G-7VJLL0C80S");
  };
}

export function handleConcentEvents() {
  const consentBanner = document.getElementById("consentBanner");
  const editConcentBtn = document.getElementById("editConcentBtn");

  // Edit preferences
  if (editConcentBtn) {
    editConcentBtn.addEventListener("click", () => {
      localStorage.removeItem("consent-preferences");
      document.body.appendChild(consentBanner);
      editConcentBtn.remove();
    });
  }

  const acceptBtn = document.getElementById("acceptConcent");
  const rejectBtn = document.getElementById("rejectConcent");

  if (!acceptBtn || !rejectBtn) return;

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("consent-preferences", "allows tracking");
    loadAnalytics();
    consentBanner.remove();
    document.body.appendChild(editConcentBtn);
  });

  rejectBtn.addEventListener("click", () => {
    localStorage.setItem("consent-preferences", "rejects tracking");
    consentBanner.remove();
    document.body.appendChild(editConcentBtn);
  });
}
