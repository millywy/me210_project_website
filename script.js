const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll("[data-carousel-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.carouselTarget);
    if (!target) return;
    const direction = button.dataset.carouselDir === "prev" ? -1 : 1;
    const amount = target.clientWidth * 0.92 * direction;
    target.scrollBy({ left: amount, behavior: "smooth" });
  });
});
