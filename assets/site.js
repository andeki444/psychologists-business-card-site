document.getElementById("year").textContent = new Date().getFullYear();

const questions = document.getElementById("topic-choices");
const otherTopic = document.getElementById("other-topic");
const otherTopicFields = document.getElementById("other-topic-fields");
const otherTopicText = document.getElementById("other-topic-text");
const requestReview = document.getElementById("request-review");
const selectedTopicsList = document.getElementById("selected-topics");
const telegramLink = document.getElementById("telegram-request");
const telegramChat = telegramLink.href;

function getSelectedTopics() {
  return Array.from(questions.querySelectorAll("input:checked"), input => {
    const description = input === otherTopic ? otherTopicText.value.trim() : "";
    return description ? input.value + " — " + description : input.value;
  });
}

function updateReview() {
  otherTopicFields.hidden = !otherTopic.checked;

  const topics = getSelectedTopics();
  const items = topics.map(topic => {
    const item = document.createElement("li");
    item.textContent = topic;
    return item;
  });

  selectedTopicsList.replaceChildren(...items);
  requestReview.hidden = topics.length === 0;
  telegramLink.href = telegramChat;
}

telegramLink.addEventListener("click", () => {
  const draft = new URL(telegramChat);
  const topics = getSelectedTopics();
  const lines = ["Здравствуйте, Полина! Хочу договориться о первой встрече."];

  if (topics.length > 0) {
    lines.push("", "Темы, которые хочу обсудить:", ...topics.map(topic => "• " + topic));
  }

  draft.searchParams.set("text", lines.join("\n"));
  draft.search = draft.search.replaceAll("+", "%20");
  telegramLink.href = draft.href;
});

questions.addEventListener("change", updateReview);
otherTopicText.addEventListener("input", updateReview);
window.addEventListener("pageshow", updateReview);
updateReview();

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

if ("IntersectionObserver" in window && !motionPreference.matches) {
  const priceList = document.querySelector(".price-list");
  const revealPrices = new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;

    priceList.classList.add("prices-in-view");
    observer.disconnect();
  }, { threshold: 0.12 });

  revealPrices.observe(priceList);
}
