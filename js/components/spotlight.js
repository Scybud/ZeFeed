const container = document.querySelector(".infoContainer");


const products = [
    {
    name: "LogHue",
    logo: "L",
    title: "Boost your productivity without complexity",
    desc: "LogHue is a freemium workspace platform built to help you manage tasks, stay organized, and actually get things done.",
    points: [
      "Simple task & workspace system",
      "Built for focus, not clutter",
      "Freemium — start free, upgrade later",
    ],
    cta: "Try LogHue",
    url: "https://loghue.com"
  },
  {
    name: "TryTasty",
    logo: "T",
    title: "Turn ingredients into snack ideas instantly",
    desc: "TryTasty helps you discover what to cook or snack based on what you already have at home.",
    points: [
      "AI-powered recipe suggestions",
      "Fast snack ideas in seconds",
      "Personalized based on ingredients",
    ],
    cta: "Try TryTasty",
    url: "https://trytasty.de"
  },
];

let index = 0;

function render(p) {
    if (!container) return;
  const card = document.getElementById("productCard");
  const logo = document.getElementById("productLogo");
  const name = document.getElementById("productName");
  const title = document.getElementById("productTitle");
  const desc = document.getElementById("productDesc");
  const features = document.getElementById("productFeatures");
  const cta = document.getElementById("ctaPrimary");

  card.classList.add("slide-out");

  setTimeout(() => {
    logo.textContent = p.logo;
    name.textContent = p.name;
    title.textContent = p.title;
    desc.textContent = p.desc;
    cta.textContent = p.cta;
    cta.href = p.url;
    card.target = "_blank";
    card.rel = "noopener";

    features.innerHTML = p.points
      .map((point) => `<div class="feature">✓ ${point}</div>`)
      .join("");

    card.classList.remove("slide-out");
    card.classList.add("slide-in");

    setTimeout(() => card.classList.remove("slide-in"), 400);
  }, 250);
}

setInterval(() => {
  index = (index + 1) % products.length;
  render(products[index]);
}, 6000);

render(products[0]);
