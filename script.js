const monthLabel = document.getElementById("monthLabel");
const calendarDays = document.getElementById("calendarDays");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");
const todayButton = document.getElementById("todayButton");
const monthlyReviewButton = document.getElementById("monthlyReviewButton");
const monthlyReviewPanel = document.getElementById("monthlyReviewPanel");
const reviewTitle = document.getElementById("reviewTitle");
const reviewList = document.getElementById("reviewList");
const monthMoodTotalLabel = document.getElementById("monthMoodTotalLabel");

const entryModal = document.getElementById("entryModal");
const entryDateLabel = document.getElementById("entryDateLabel");
const praiseInput = document.getElementById("praiseInput");
const moodInput = document.getElementById("moodInput");
const closeModalButton = document.getElementById("closeModalButton");
const saveEntryButton = document.getElementById("saveEntryButton");
const deleteEntryButton = document.getElementById("deleteEntryButton");

const today = new Date();
let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDateKey = "";

const storageKey = "calendarSelfEsteemEntries";
const praiseText = "참잘했어요";

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function loadEntries() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}

function saveEntries(entries) {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

function openEntryModal(date) {
  const entries = loadEntries();
  selectedDateKey = formatDateKey(date);
  const entry = entries[selectedDateKey] || { praise: "", mood: 3 };

  entryDateLabel.textContent = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  praiseInput.value = entry.praise || "";
  moodInput.value = String(entry.mood || 3);
  entryModal.classList.remove("hidden");
}

function closeEntryModal() {
  entryModal.classList.add("hidden");
  selectedDateKey = "";
}

function saveCurrentEntry() {
  if (!selectedDateKey) {
    return;
  }

  const entries = loadEntries();
  const praise = praiseInput.value.trim();
  const mood = Number(moodInput.value);

  entries[selectedDateKey] = {
    praise,
    mood,
    sticker: true
  };
  saveEntries(entries);
  closeEntryModal();
  renderCalendar();
}

function deleteCurrentEntry() {
  if (!selectedDateKey) {
    return;
  }

  const entries = loadEntries();
  delete entries[selectedDateKey];
  saveEntries(entries);
  closeEntryModal();
  renderCalendar();
}

function createDayCell(date, inCurrentMonth) {
  const cell = document.createElement("div");
  cell.className = "day-cell";
  const dateKey = formatDateKey(date);
  const entries = loadEntries();
  const entry = entries[dateKey];

  if (!inCurrentMonth) {
    cell.classList.add("other-month");
  }

  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    cell.classList.add("today");
  }

  const dayNumber = document.createElement("span");
  dayNumber.className = "day-number";
  dayNumber.textContent = date.getDate();
  cell.appendChild(dayNumber);

  if (entry && entry.sticker) {
    const sticker = document.createElement("span");
    sticker.className = "praise-sticker";
    sticker.textContent = praiseText;
    cell.appendChild(sticker);
  }

  if (entry && typeof entry.mood === "number") {
    const moodBadge = document.createElement("span");
    moodBadge.className = `mood-badge mood-${entry.mood}`;
    moodBadge.textContent = `기분 ${entry.mood}점`;
    cell.appendChild(moodBadge);
  }

  cell.addEventListener("click", () => {
    openEntryModal(date);
  });

  return cell;
}

function renderMonthlyReview() {
  const entries = loadEntries();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const targetPrefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  const monthKeys = Object.keys(entries)
    .filter((key) => key.startsWith(targetPrefix))
    .sort();

  reviewTitle.textContent = `${year}년 ${month + 1}월 칭찬 모아보기`;
  reviewList.innerHTML = "";

  if (monthKeys.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "아직 기록이 없어요. 하루 한 줄부터 시작해봐요.";
    reviewList.appendChild(emptyItem);
    return;
  }

  monthKeys.forEach((key) => {
    const entry = entries[key];
    const date = parseDateKey(key);
    const item = document.createElement("li");
    const praise = entry.praise ? entry.praise : "오늘도 기록을 남긴 나, 잘했어요.";
    item.textContent = `${date.getDate()}일 | 기분 ${entry.mood || 3}점 | ${praise}`;
    reviewList.appendChild(item);
  });
}

function renderMonthMoodTotal() {
  const entries = loadEntries();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const targetPrefix = `${year}-${String(month + 1).padStart(2, "0")}-`;

  const totalMood = Object.keys(entries)
    .filter((key) => key.startsWith(targetPrefix))
    .reduce((sum, key) => {
      const mood = Number(entries[key].mood);
      return Number.isFinite(mood) ? sum + mood : sum;
    }, 0);

  monthMoodTotalLabel.textContent = `이달 기분점수 총합: ${totalMood}점`;
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthLabel.textContent = `${year}년 ${month + 1}월`;
  calendarDays.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstWeekday = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    const day = new Date(year, month - 1, prevMonthLastDay - i);
    calendarDays.appendChild(createDayCell(day, false));
  }

  for (let day = 1; day <= totalDays; day += 1) {
    calendarDays.appendChild(createDayCell(new Date(year, month, day), true));
  }

  const cellsToFill = (7 - (calendarDays.children.length % 7)) % 7;
  for (let day = 1; day <= cellsToFill; day += 1) {
    const nextMonthDate = new Date(year, month + 1, day);
    calendarDays.appendChild(createDayCell(nextMonthDate, false));
  }

  if (!monthlyReviewPanel.classList.contains("hidden")) {
    renderMonthlyReview();
  }
  renderMonthMoodTotal();
}

prevMonthButton.addEventListener("click", () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  renderCalendar();
});

nextMonthButton.addEventListener("click", () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  renderCalendar();
});

todayButton.addEventListener("click", () => {
  currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  renderCalendar();
});

monthlyReviewButton.addEventListener("click", () => {
  monthlyReviewPanel.classList.toggle("hidden");
  if (!monthlyReviewPanel.classList.contains("hidden")) {
    renderMonthlyReview();
  }
});

closeModalButton.addEventListener("click", closeEntryModal);
saveEntryButton.addEventListener("click", saveCurrentEntry);
deleteEntryButton.addEventListener("click", deleteCurrentEntry);
entryModal.addEventListener("click", (event) => {
  if (event.target === entryModal) {
    closeEntryModal();
  }
});

renderCalendar();
