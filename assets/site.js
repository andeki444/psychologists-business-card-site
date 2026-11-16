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
const threadInk = document.getElementById("thread-ink");
const splitHeroLayout = window.matchMedia("(min-width: 48rem)");
const wideThreadLayout = window.matchMedia("(min-width: 64rem)");

let activeSection = null;
let pendingFrame = 0;
let layoutPending = false;
let threadLength = 0;
let threadHeights = [];
let sections = [];
let pageHeight = 0;
let lastDashOffset = "";
const threadSampleSpacing = 24;

function updateThreadProgress(viewportTop, viewportHeight, atBottom) {
  if (!threadLength) return;

  let drawn = threadLength;

  if (!motionPreference.matches && !atBottom) {
    const readingPoint = viewportTop + viewportHeight * .76;
    let low = 0;
    let high = threadHeights.length - 1;
    // Locate the tip using samples collected when the path was laid out.
    while (high - low > 1) {
      const middle = Math.floor((low + high) / 2);
      if (threadHeights[middle] < readingPoint) {
        low = middle;
      } else {
        high = middle;
      }
    }

    const start = low * threadSampleSpacing;
    const end = Math.min(high * threadSampleSpacing, threadLength);
    const height = threadHeights[high] - threadHeights[low];
    const fraction = Math.max(0, Math.min(1, (readingPoint - threadHeights[low]) / height));
    drawn = start + fraction * (end - start);
  }

  const dashOffset = (threadLength - drawn).toFixed(2);
  if (dashOffset !== lastDashOffset) {
    threadLine.setAttribute("stroke-dashoffset", dashOffset);
    lastDashOffset = dashOffset;
  }
}

function setThreadInk(stops, startY, endY) {
  threadInk.setAttribute("y1", startY);
  threadInk.setAttribute("y2", endY);
  threadInk.replaceChildren(...stops.map(([y, opacity]) => {
    const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop.setAttribute("offset", (y - startY) / (endY - startY));
    stop.setAttribute("stop-opacity", opacity);
    return stop;
  }));
}

function layoutThread() {
  if (!threadStart || !threadHand || !threadGuide || !threadLine || !threadInk) return;

  const scrollY = window.scrollY;
  const start = threadStart.getBoundingClientRect();
  const hand = threadHand.getBoundingClientRect();
  const startX = start.left + start.width / 2;
  const startY = start.top + start.height / 2 + scrollY;
  const endX = hand.left + hand.width / 2;
  const endY = hand.top + hand.height / 2 + scrollY;
  const wide = wideThreadLayout.matches;
  const inset = threadStart.closest(".wrap").getBoundingClientRect().left * .56;
  const viewportWidth = document.documentElement.clientWidth;
  let lanes = [viewportWidth - inset, inset];
  if (wide) {
    const leftEdge = document.querySelector(".format-intro").getBoundingClientRect().right;
    const gap = document.querySelector(".price-detail").getBoundingClientRect().left - leftEdge;
    lanes = [leftEdge + gap * .55, leftEdge + gap * .21];
  }

  pageHeight = document.documentElement.scrollHeight;
  sections = Array.from(paintedSections, section => {
    const box = section.getBoundingClientRect();
    const style = getComputedStyle(section);
    return {
      top: box.top + scrollY,
      bottom: box.bottom + scrollY,
      paddingTop: parseFloat(style.paddingTop),
      paddingBottom: parseFloat(style.paddingBottom),
      tone: style.getPropertyValue("--section-tone").trim()
    };
  });

  const quiet = wide ? .28 : .11;
  let x = lanes[0];
  if (!wide && splitHeroLayout.matches) {
    const copyEdge = threadStart.closest(".hero-copy").getBoundingClientRect().right;
    const portraitEdge = document.querySelector(".hero-portrait").getBoundingClientRect().left;
    x = (copyEdge + portraitEdge) / 2;
  }
  const entryY = startY + (wide ? 68 : 29);
  const lead = Math.min(34, (x - startX) * .52);
  let route = `M ${startX} ${startY} C ${startX + lead} ${startY + 2}, ${x} ${startY + 6}, ${x} ${entryY}`;
  const stops = [[startY, .82], [entryY, quiet]];

  for (let index = 0; index < sections.length - 1; index += 1) {
    const section = sections[index];
    const next = sections[index + 1];
    const fromY = section.bottom - section.paddingBottom * .72;
    const toY = next.top + next.paddingTop * .58;
    const height = toY - fromY;
    const nextX = lanes[(index + 1) % lanes.length];
    const bend = index % 2 === 0 ? .64 : .46;
    route += ` L ${x} ${fromY} C ${x} ${fromY + height * bend}, ${nextX} ${toY - height * .55}, ${nextX} ${toY}`;
    stops.push([fromY, quiet], [fromY + height * .26, .85], [toY - height * .24, .85], [toY, quiet]);
    x = nextX;
  }

  const footerY = threadHand.closest(".footer-signature").getBoundingClientRect().top + scrollY;
  const turnY = footerY - 13;
  route += ` L ${x} ${turnY} C ${x} ${endY - 10}, ${endX - 31} ${endY - 5}, ${endX} ${endY}`;
  stops.push([turnY, quiet], [turnY + (endY - turnY) * .55, .82], [endY, .82]);

  setThreadInk(stops, startY, endY);
  threadGuide.setAttribute("d", route);
  threadLine.setAttribute("d", route);
  threadLength = threadLine.getTotalLength();
  threadHeights = Array.from(
    { length: Math.ceil(threadLength / threadSampleSpacing) + 1 },
    (_, index) => threadLine.getPointAtLength(Math.min(index * threadSampleSpacing, threadLength)).y
  );
  threadLine.setAttribute("stroke-dasharray", `${threadLength} ${threadLength}`);
  document.body.classList.add("thread-ready");
}

function updatePaint() {
  pendingFrame = 0;
  if (layoutPending) {
    layoutPending = false;
    layoutThread();
  }

  const viewportTop = window.scrollY;
  const viewportHeight = window.innerHeight;
  const atBottom = pageHeight - viewportTop - viewportHeight < 2;
  updateThreadProgress(viewportTop, viewportHeight, atBottom);

  if (motionPreference.matches) {
    if (activeSection) {
      rootStyle.removeProperty("--current-tone");
      activeSection = null;
    }
    return;
  }

  const readingLine = viewportTop + viewportHeight * .55;
  let visibleSection = sections[0];
  for (const section of sections) {
    if (!atBottom && section.top > readingLine) break;
    visibleSection = section;
  }

  if (!visibleSection || activeSection === visibleSection) return;

  activeSection = visibleSection;
  rootStyle.setProperty("--current-tone", activeSection.tone);
}

function schedulePaint() {
  if (pendingFrame === 0) {
    pendingFrame = window.requestAnimationFrame(updatePaint);
  }
}

function scheduleLayout() {
  layoutPending = true;
  schedulePaint();
}

window.addEventListener("scroll", schedulePaint, { passive: true });
window.addEventListener("resize", scheduleLayout);
window.addEventListener("pageshow", scheduleLayout);
motionPreference.addEventListener("change", schedulePaint);

layoutThread();
if (threadLength && "ResizeObserver" in window) {
  const threadResize = new ResizeObserver(scheduleLayout);
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
