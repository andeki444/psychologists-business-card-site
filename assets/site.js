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
const threadStart = document.getElementById("thread-start");
const threadHand = document.getElementById("thread-hand");
const threadGuide = document.getElementById("thread-guide");
const threadLine = document.getElementById("thread-line");
const threadInk = document.getElementById("thread-ink");
const splitHeroLayout = window.matchMedia("(min-width: 48rem)");
const wideThreadLayout = window.matchMedia("(min-width: 64rem)");

let pendingFrame = 0;
let layoutPending = false;
let threadParts = [];
let sections = [];
let pageHeight = 0;
const threadSampleSpacing = 24;
const svgNamespace = "http://www.w3.org/2000/svg";
const paintTones = new WeakMap();

function updateThreadProgress(viewportTop, viewportHeight, atBottom) {
  const readingPoint = motionPreference.matches || atBottom ? Infinity : viewportTop + viewportHeight * .76;

  for (const part of threadParts) {
    const { path, length, heights } = part;
    let dashOffset = "0";

    if (readingPoint <= heights[0]) {
      dashOffset = null;
    } else if (readingPoint < heights[heights.length - 1]) {
      let low = 0;
      let high = heights.length - 1;
      // Only the section containing the tip needs a partial stroke.
      while (high - low > 1) {
        const middle = Math.floor((low + high) / 2);
        if (heights[middle] < readingPoint) {
          low = middle;
        } else {
          high = middle;
        }
      }
      const start = low * threadSampleSpacing;
      const end = Math.min(high * threadSampleSpacing, length);
      const fraction = (readingPoint - heights[low]) / (heights[high] - heights[low]);
      dashOffset = (length - start - fraction * (end - start)).toFixed(2);
    }

    if (dashOffset === part.dashOffset) continue;
    if (dashOffset === null || part.dashOffset === null) {
      path.setAttribute("visibility", dashOffset === null ? "hidden" : "visible");
    }
    if (dashOffset !== null) path.setAttribute("stroke-dashoffset", dashOffset);
    part.dashOffset = dashOffset;
  }
}

function setThreadInk(stops, startY, endY) {
  threadInk.setAttribute("y1", startY);
  threadInk.setAttribute("y2", endY);
  threadInk.replaceChildren(...stops.map(([y, opacity]) => {
    const stop = document.createElementNS(svgNamespace, "stop");
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
      element: section,
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
  let partStart = route;
  const routes = [];
  const stops = [[startY, .82], [entryY, quiet]];

  for (let index = 0; index < sections.length - 1; index += 1) {
    const section = sections[index];
    const next = sections[index + 1];
    const fromY = section.bottom - section.paddingBottom * .72;
    const toY = next.top + next.paddingTop * .58;
    const height = toY - fromY;
    const nextX = lanes[(index + 1) % lanes.length];
    const bend = index % 2 === 0 ? .64 : .46;
    const bendRoute = ` L ${x} ${fromY} C ${x} ${fromY + height * bend}, ${nextX} ${toY - height * .55}, ${nextX} ${toY}`;
    route += bendRoute;
    routes.push(partStart + bendRoute);
    partStart = `M ${nextX} ${toY}`;
    stops.push([fromY, quiet], [fromY + height * .26, .85], [toY - height * .24, .85], [toY, quiet]);
    x = nextX;
  }

  const footerY = threadHand.closest(".footer-signature").getBoundingClientRect().top + scrollY;
  const turnY = footerY - 13;
  const finalRoute = ` L ${x} ${turnY} C ${x} ${endY - 10}, ${endX - 31} ${endY - 5}, ${endX} ${endY}`;
  route += finalRoute;
  routes.push(partStart + finalRoute);
  stops.push([turnY, quiet], [turnY + (endY - turnY) * .55, .82], [endY, .82]);

  setThreadInk(stops, startY, endY);
  threadGuide.setAttribute("d", route);
  const paths = routes.map(partRoute => {
    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("d", partRoute);
    path.setAttribute("visibility", "hidden");
    return path;
  });
  threadLine.replaceChildren(...paths);
  threadParts = paths.map(path => {
    const length = path.getTotalLength();
    const heights = Array.from(
      { length: Math.ceil(length / threadSampleSpacing) + 1 },
      (_, index) => path.getPointAtLength(Math.min(index * threadSampleSpacing, length)).y
    );
    return { path, length, heights, dashOffset: null };
  });
  for (const { path, length } of threadParts) {
    path.setAttribute("stroke-dasharray", `${length} ${length}`);
  }
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

  const readingLine = viewportTop + viewportHeight * .55;
  let visibleSection = sections[0];
  for (const section of sections) {
    if (!atBottom && section.top > readingLine) break;
    visibleSection = section;
  }

  const tone = motionPreference.matches ? "" : visibleSection?.tone;
  const margin = viewportHeight * .5;
  for (const { element, top, bottom } of sections) {
    if (element.classList.contains("bookend") || paintTones.get(element) === tone) continue;
    if (tone && (bottom < viewportTop - margin || top > viewportTop + viewportHeight + margin)) continue;
    if (tone) element.style.setProperty("--current-tone", tone);
    else element.style.removeProperty("--current-tone");
    paintTones.set(element, tone);
  }
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

window.addEventListener("scroll", () => {
  if (!motionPreference.matches) schedulePaint();
}, { passive: true });
window.addEventListener("resize", scheduleLayout);
window.addEventListener("pageshow", scheduleLayout);
motionPreference.addEventListener("change", schedulePaint);

layoutThread();
if (threadParts.length && "ResizeObserver" in window) {
  const threadResize = new ResizeObserver(scheduleLayout);
  threadResize.observe(document.body);
  threadResize.observe(document.querySelector(".hero-copy"));
  threadResize.observe(document.querySelector(".contact-intro"));
}
updatePaint();
