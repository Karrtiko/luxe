const mobileMenu = document.getElementById("mobile-menu");
const openBtn = document.getElementById("open-mobile-menu");
const closeBtn = document.getElementById("close-mobile-menu");

openBtn.addEventListener("click", () => {
  mobileMenu.classList.remove("hidden");
  setTimeout(() => mobileMenu.classList.add("active"), 10);
});

closeBtn.addEventListener("click", () => {
  mobileMenu.classList.remove("active");
  setTimeout(() => mobileMenu.classList.add("hidden"), 400);
});
