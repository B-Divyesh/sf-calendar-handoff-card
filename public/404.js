window.addEventListener("pageshow", () => {
  document.querySelector("h1")?.focus({ preventScroll: true });
});
