import { supabase } from "../supabase.js";

const container = document.querySelector(".infoContainer");


let index = 0;

async function loadProducts() {

  const { data: Products, error: productsError } = await supabase
  .from("spotlight_products")
  .select("*")
  .eq("active", true);
  
  if (productsError) {
  console.error("Supabase error:", productsError);
  return;
}

if (!Products || Products.length === 0) {
  console.error("No active spotlight products found");
  return;
}
return Products;
}

const spotlightProducts = loadProducts();

function render(p) {
  
  if (!container) return;

  const card = document.getElementById("productCard");
  const logo = document.getElementById("productLogo");
  const name = document.getElementById("productName");
  const title = document.getElementById("productTitle");
  const desc = document.getElementById("productDesc");
  const features = document.getElementById("productFeatures");
  const cta = document.getElementById("ctaPrimary");

  if (!card || !logo || !name || !title || !desc || !features || !cta) {
    console.error("Missing DOM elements");
    return;
  }

  card.classList.add("slide-out");

  setTimeout(() => {
    logo.textContent = p.logo ?? "";
    name.textContent = p.name ?? "";
    title.textContent = p.title ?? "";
    desc.textContent = p.description ?? "";
    features.innerHTML = Array.isArray(p.features)
      ? p.features.map((f) => `<div class="feature">✓ ${f}</div>`).join("")
      : "";
    cta.textContent = p.cta_text ?? "Learn more";
    cta.href = p.cta_url ?? "#";

    card.classList.remove("slide-out");
    card.classList.add("slide-in");

    setTimeout(() => card.classList.remove("slide-in"), 400);
  }, 250);
}

async function initSpotlight() {
  const spotlightProducts = await loadProducts();
  if (!spotlightProducts) return;

  // Render first product
  render(spotlightProducts[0]);

  // Auto-rotate
  setInterval(() => {
    index = (index + 1) % spotlightProducts.length;
    render(spotlightProducts[index]);
  }, 6000);
}

initSpotlight();
