const container = document.getElementById("scroll-gallery");
const cards = document.querySelectorAll(".story-card");

container.addEventListener("scroll", () => {
  const scrollLeft = container.scrollLeft;
  const containerWidth = container.offsetWidth;

  cards.forEach((card) => {
    const cardLeft = card.offsetLeft;
    const cardRight = cardLeft + card.offsetWidth;

    // cek posisi card relatif terhadap scroll
    const visibleWidth = Math.max(
      0,
      Math.min(cardRight, scrollLeft + containerWidth) - Math.max(cardLeft, scrollLeft)
    );

    // hitung seberapa terlihat card-nya
    const visibility = visibleWidth / card.offsetWidth;

    // opacity makin tinggi kalau card makin ke tengah
    card.style.opacity = 0.3 + visibility * 0.7;
    card.style.transition = "opacity 0.3s ease";
  });
});
