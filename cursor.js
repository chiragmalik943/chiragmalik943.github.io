let cursor = document.querySelector(".cursor");

function is_touch_enabled() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

if (is_touch_enabled()) {
  cursor.style.display = "none";
} else {
  cursor.style.display = "block";
  const x_center = cursor.offsetWidth / 2;
  const y_center = cursor.offsetHeight / 2;

  document.body.addEventListener("mousemove", function (e) {
    cursor.style.left = `${e.x - x_center}px`;
    cursor.style.top = `${e.y - y_center}px`;
  });

  document.body.addEventListener(
    "mouseenter",
    function (e) {
      if (e.target.tagName.toLowerCase() === "a") {
        cursor.classList.remove("unactive");
        cursor.classList.add("active");
      }
    },
    true
  );

  document.body.addEventListener(
    "mouseleave",
    function (e) {
      if (e.target.tagName.toLowerCase() === "a") {
        cursor.classList.remove("active");
        cursor.classList.add("unactive");
      }
    },
    true
  );
}
