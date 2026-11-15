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
const threadStart = document.getElementById("thread-start");
const threadHand = document.getElementById("thread-hand");
const threadGuide = document.getElementById("thread-guide");
const threadLine = document.getElementById("thread-line");

let activeSection = null;
let pendingFrame = 0;
let threadBounds;

function updateThreadProgress() {
  if (!threadBounds) return;

  const { start, end, length } = threadBounds;
  const viewportBottom = window.scrollY + window.innerHeight;
  const atBottom = document.documentElement.scrollHeight - viewportBottom < 2;
  const readingPoint = window.scrollY + window.innerHeight * .8;
  const progress = motionPreference.matches || atBottom
    ? 1
    : Math.min(1, Math.max(0, (readingPoint - start) / (end - start)));

  threadLine.setAttribute("stroke-dashoffset", (length * (1 - progress)).toFixed(2));
}

function layoutThread() {
  if (!threadStart || !threadHand || !threadGuide || !threadLine) return;

  const scrollY = window.scrollY;
  const start = threadStart.getBoundingClientRect();
  const hand = threadHand.getBoundingClientRect();
  const startX = start.left + start.width / 2;
  const startY = start.top + start.height / 2 + scrollY;
  const endX = hand.left + hand.width / 2;
  const endY = hand.top + hand.height / 2 + scrollY;
  const gutter = threadStart.closest(".wrap").getBoundingClientRect().left;
  const edge = gutter - Math.min(55, gutter * .54);
  const sway = Math.min(34, gutter * .27);
  const lastSection = paintedSections[paintedSections.length - 1];

  let y = startY + 28;
  let route = `M ${startX} ${startY} C ${startX - 9} ${startY + 8}, ${edge} ${startY + 7}, ${edge} ${y}`;

  for (const [index, section] of paintedSections.entries()) {
    const nextY = section === lastSection ? endY - 26 : section.getBoundingClientRect().bottom + scrollY;
    const height = nextY - y;
    const turn = edge + (index % 2 === 0 ? -sway : sway);
    route += ` C ${edge} ${y + height * .24}, ${turn} ${y + height * .34}, ${turn} ${y + height * .53}`;
    route += ` C ${turn} ${y + height * .69}, ${edge} ${y + height * .81}, ${edge} ${nextY}`;
    y = nextY;
  }

  const approach = Math.min(29, (endX - edge) * .38);
  route += ` C ${edge} ${endY - 6}, ${endX - approach} ${endY - 3}, ${endX} ${endY}`;

  threadGuide.setAttribute("d", route);
  threadLine.setAttribute("d", route);
  const length = threadLine.getTotalLength();
  threadBounds = { start: startY, end: endY, length };
  threadLine.setAttribute("stroke-dasharray", `${length} ${length}`);
  updateThreadProgress();
}

function updatePaint() {
  pendingFrame = 0;
  updateThreadProgress();

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
window.addEventListener("resize", () => {
  layoutThread();
  schedulePaint();
});
window.addEventListener("pageshow", () => {
  layoutThread();
  schedulePaint();
});
motionPreference.addEventListener("change", schedulePaint);

layoutThread();
if (threadBounds && "ResizeObserver" in window) {
  const threadResize = new ResizeObserver(layoutThread);
  threadResize.observe(document.body);
  threadResize.observe(document.querySelector(".hero-copy"));
  threadResize.observe(document.querySelector(".contact-intro"));
}
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
