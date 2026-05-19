let currentIndex = 0;
let historiesData = [];
const flashCard = document.querySelector(".flashCard");

export function renderHistoryCard() {
  const history = historiesData[currentIndex];

  const count = document.querySelector(".historyCount");
  const historyTitle = document.querySelector(".historyTitle");
  const historyFact = document.querySelector(".historyFact");
  const yearBadge = document.querySelector(".yearBadge");
  const categoryBadge = document.querySelector(".categoryBadge");
  const source = document.querySelector(".source");

  if (count) {
    count.textContent = historiesData.length;
  }

  historyTitle.textContent = history.title;
  historyFact.textContent = history.fact;
  yearBadge.textContent = history.year;
  categoryBadge.textContent = history.category;
  source.textContent = history.source;
}

export function initHistories(histories) {
  historiesData = histories;

  renderHistoryCard();
renderHistoryTable(historiesData);
  setupNavigation();
}

function setupNavigation() {
  const prevBtn = document.querySelector(".prevBtn");

  const nextBtn = document.querySelector(".nextBtn");

  nextBtn.addEventListener("click", () => {
    if (flashCard) {
    }
    currentIndex++;

    if (currentIndex >= historiesData.length) {
      currentIndex = 0;
    }

    renderHistoryCard();
  });

  prevBtn.addEventListener("click", () => {
    currentIndex--;

    if (currentIndex < 0) {
      currentIndex = historiesData.length - 1;
    }

    renderHistoryCard();
  });
}

export function renderHistoryTable(histories) {
    const tableBody = document.querySelector(".historyTable tbody");

  tableBody.innerHTML = "";

  const fragment = document.createDocumentFragment();

  histories.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.year}</td>
      <td>${item.title}</td>
      <td>
        <span class="categoryChip">
          ${item.category}
        </span>
      </td>
      <td>${item.source}</td>
    `;

    fragment.appendChild(row);
  });

  tableBody.appendChild(fragment);
}