// journeys.js — Journeys module. Data + rendering for the destination cards.
// Source of truth for SILENCE destinations; add/remove by editing the array.
// Interface: renderJourneys(container) — injects each destination as a card.
// Description/image fields are placeholders until official content is produced.

const LOCATIONS = [
  {
    id: "algodoes",
    name: "Praia de Algodões",
    region: "Maraú Peninsula, Bahia",
    accommodation: "Vila Oyá Casa Hotel",
    flagship: true,
    image: null, // placeholder: assign a real photo before launch
    description:
      "On Bahia's coast, the Atlantic, the forest, and the architecture make their presence felt without asking for attention.",
  },
  {
    id: "atins",
    name: "Atins",
    region: "Lençóis Maranhenses, Maranhão",
    accommodation: "Boutique pousada",
    flagship: false,
    image: null, // placeholder
    description:
      "A quiet village between the dunes and the sea, where white sand and fresh water meet at the edge of the Lençóis National Park.",
  },
  {
    id: "amazon",
    name: "The Amazon",
    region: "Amazon region",
    accommodation: "Boutique lodge",
    flagship: false,
    image: null, // placeholder
    description:
      "Deep in the forest, the river sets the pace. A place where silence is the loudest presence and the day follows the current.",
  },
];

function buildCard(location) {
  const article = document.createElement("article");
  article.className = location.flagship ? "journey-card journey-card-flagship" : "journey-card";

  const image = document.createElement("div");
  image.className = "journey-image";
  if (location.image) {
    const img = document.createElement("img");
    img.src = location.image;
    img.alt = location.name;
    img.loading = "lazy";
    image.appendChild(img);
  } else {
    image.className += " journey-image-placeholder";
    image.setAttribute("role", "img");
    image.setAttribute("aria-label", `Placeholder image for ${location.name}`);
  }
  article.appendChild(image);

  const body = document.createElement("div");
  body.className = "journey-body";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = location.flagship ? "The inaugural journey" : location.region;
  body.appendChild(eyebrow);

  const title = document.createElement("h3");
  title.textContent = location.name;
  body.appendChild(title);

  const region = document.createElement("p");
  region.className = "journey-region";
  region.textContent = location.flagship
    ? `${location.region} · ${location.accommodation}`
    : location.accommodation;
  body.appendChild(region);

  const description = document.createElement("p");
  description.className = "journey-description";
  description.textContent = location.description;
  body.appendChild(description);

  const link = document.createElement("a");
  link.className = "text-link";
  link.href = "#invitation";
  link.textContent = "Enquire about this journey ";
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  link.appendChild(arrow);
  body.appendChild(link);

  article.appendChild(body);
  return article;
}

export function renderJourneys(container) {
  if (!container) return;
  const fragment = document.createDocumentFragment();
  LOCATIONS.forEach((location) => fragment.appendChild(buildCard(location)));
  container.replaceChildren(fragment);
}