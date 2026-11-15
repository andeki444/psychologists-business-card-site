document.getElementById("year").textContent = new Date().getFullYear();

const paintedSections = document.querySelectorAll(".painted");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const rootStyle = document.documentElement.style;

let activeSection = null;
let pendingFrame = 0;

function updatePaint() {
  pendingFrame = 0;

  if (motionPreference.matches) {
    rootStyle.removeProperty("--current-tone");
    activeSection = null;
    return;
  }

  const readingLine = window.innerHeight * 0.55;
  let visibleSection = paintedSections[0];

  for (const section of paintedSections) {
    if (section.getBoundingClientRect().top > readingLine) break;
    visibleSection = section;
  }

  const distanceFromBottom =
    document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
  if (distanceFromBottom < 2) {
    visibleSection = paintedSections[paintedSections.length - 1];
  }

  if (activeSection === visibleSection) return;

  activeSection = visibleSection;
  const tone = getComputedStyle(activeSection).getPropertyValue("--section-tone").trim();
  rootStyle.setProperty("--current-tone", tone);
}

function schedulePaint() {
  if (pendingFrame === 0) {
    pendingFrame = window.requestAnimationFrame(updatePaint);
  }
}

window.addEventListener("scroll", schedulePaint, { passive: true });
window.addEventListener("resize", schedulePaint);
window.addEventListener("pageshow", schedulePaint);
motionPreference.addEventListener("change", schedulePaint);

updatePaint();
