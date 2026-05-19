const toggleSidebar = document.querySelector(".toggleSidebar");
const sidebar = document.querySelector(".sidebar");

export function handleSidebarToggle() {
  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("slideIn");
  });
}


export function toggleHistoryView() {
  const buttons = document.querySelectorAll(".viewBtn");

  const flashcardsView = document.querySelector(".flashcardsView");

  const tableView = document.querySelector(".tableView");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));

      button.classList.add("active");

      const view = button.dataset.view;

      flashcardsView.classList.remove("activeView");
      tableView.classList.remove("activeView");

      if (view === "cards") {
        flashcardsView.classList.add("activeView");
      } else {
        tableView.classList.add("activeView");
      }
    });
  });
}