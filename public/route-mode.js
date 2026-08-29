// Apply the demo layout before the document body is parsed. The interactive
// module owns the demo state afterwards; this only prevents a visible jump
// from the landing screen to the isolated sample card.
(() => {
  const query = new URLSearchParams(window.location.search);
  if (window.location.pathname.replace(/\/$/, "") === "/demo" || query.get("demo") === "1") {
    document.documentElement.classList.add("demo-initial");
  }
})();
