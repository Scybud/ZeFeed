const toggleSidebar = document.querySelector(".toggleSidebar");
const sidebar = document.querySelector(".sidebar");

export function handleSidebarToggle() {
  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("slideIn");
  });
}
