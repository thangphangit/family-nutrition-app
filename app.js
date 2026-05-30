const STORAGE_KEY = "familyNutritionApp";

const defaultData = {
  members: [
    { id: createId(), name: "Bố Minh", goal: 2200 },
    { id: createId(), name: "Mẹ Lan", goal: 1800 },
    { id: createId(), name: "Bé An", goal: 1400 }
  ],
  meals: []
};

let data = loadData();

const els = {
  todayLabel: document.querySelector("#todayLabel"),
  memberForm: document.querySelector("#memberForm"),
  memberName: document.querySelector("#memberName"),
  memberGoal: document.querySelector("#memberGoal"),
  memberCount: document.querySelector("#memberCount"),
  memberList: document.querySelector("#memberList"),
  mealForm: document.querySelector("#mealForm"),
  mealMember: document.querySelector("#mealMember"),
  mealDate: document.querySelector("#mealDate"),
  mealType: document.querySelector("#mealType"),
  foodName: document.querySelector("#foodName"),
  calories: document.querySelector("#calories"),
  protein: document.querySelector("#protein"),
  carbs: document.querySelector("#carbs"),
  fat: document.querySelector("#fat"),
  summaryMember: document.querySelector("#summaryMember"),
  totalCalories: document.querySelector("#totalCalories"),
  totalProtein: document.querySelector("#totalProtein"),
  totalCarbs: document.querySelector("#totalCarbs"),
  totalFat: document.querySelector("#totalFat"),
  goalProgress: document.querySelector("#goalProgress"),
  calorieProgress: document.querySelector("#calorieProgress"),
  mealList: document.querySelector("#mealList"),
  clearMeals: document.querySelector("#clearMeals"),
  chartMemberName: document.querySelector("#chartMemberName"),
  weeklyChart: document.querySelector("#weeklyChart")
};

const today = new Date();
const todayIso = toIsoDate(today);

els.todayLabel.textContent = today.toLocaleDateString("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit"
});
els.mealDate.value = todayIso;

els.memberForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = els.memberName.value.trim();
  const goal = Number(els.memberGoal.value);
  if (!name || !goal) return;

  data.members.push({ id: createId(), name, goal });
  els.memberForm.reset();
  saveAndRender();
});

els.mealForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!data.members.length) return;

  data.meals.push({
    id: createId(),
    memberId: els.mealMember.value,
    date: els.mealDate.value,
    type: els.mealType.value,
    food: els.foodName.value.trim(),
    calories: Number(els.calories.value) || 0,
    protein: Number(els.protein.value) || 0,
    carbs: Number(els.carbs.value) || 0,
    fat: Number(els.fat.value) || 0
  });

  els.mealForm.reset();
  els.mealDate.value = todayIso;
  if (data.members[0]) els.mealMember.value = data.members[0].id;
  saveAndRender();
});

els.summaryMember.addEventListener("change", renderSummary);
els.clearMeals.addEventListener("click", () => {
  if (!data.meals.length) return;
  data.meals = [];
  saveAndRender();
});

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultData;

  try {
    const parsed = JSON.parse(saved);
    return {
      members: Array.isArray(parsed.members) ? parsed.members : defaultData.members,
      meals: Array.isArray(parsed.meals) ? parsed.meals : []
    };
  } catch {
    return defaultData;
  }
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  render();
}

function render() {
  renderMembers();
  renderSelects();
  renderSummary();
}

function renderMembers() {
  els.memberCount.textContent = `${data.members.length} người`;

  if (!data.members.length) {
    els.memberList.innerHTML = `<div class="empty-state">Chưa có thành viên nào.</div>`;
    return;
  }

  els.memberList.innerHTML = data.members.map((member) => `
    <article class="member-card">
      <div>
        <strong>${escapeHtml(member.name)}</strong>
        <small>Mục tiêu ${member.goal.toLocaleString("vi-VN")} kcal/ngày</small>
      </div>
      <button class="delete-btn" type="button" aria-label="Xóa ${escapeHtml(member.name)}" data-delete-member="${member.id}">x</button>
    </article>
  `).join("");

  document.querySelectorAll("[data-delete-member]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.deleteMember;
      data.members = data.members.filter((member) => member.id !== id);
      data.meals = data.meals.filter((meal) => meal.memberId !== id);
      saveAndRender();
    });
  });
}

function renderSelects() {
  const memberOptions = data.members.map((member) => (
    `<option value="${member.id}">${escapeHtml(member.name)}</option>`
  )).join("");

  const selectedSummary = els.summaryMember.value;
  const selectedMeal = els.mealMember.value;
  els.mealMember.innerHTML = memberOptions;
  els.summaryMember.innerHTML = memberOptions;

  els.mealMember.value = data.members.some((member) => member.id === selectedMeal)
    ? selectedMeal
    : data.members[0]?.id || "";
  els.summaryMember.value = data.members.some((member) => member.id === selectedSummary)
    ? selectedSummary
    : data.members[0]?.id || "";

  els.mealForm.querySelector("button").disabled = data.members.length === 0;
}

function renderSummary() {
  const member = data.members.find((item) => item.id === els.summaryMember.value);

  if (!member) {
    setTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 }, 0);
    els.mealList.innerHTML = `<div class="empty-state">Thêm thành viên để bắt đầu ghi bữa ăn.</div>`;
    drawWeeklyChart(null);
    return;
  }

  const dailyMeals = data.meals.filter((meal) => meal.memberId === member.id && meal.date === todayIso);
  const totals = sumMeals(dailyMeals);
  setTotals(totals, member.goal);
  renderMeals(member, dailyMeals);
  drawWeeklyChart(member);
}

function setTotals(totals, goal) {
  const progress = goal ? Math.round((totals.calories / goal) * 100) : 0;
  els.totalCalories.textContent = Math.round(totals.calories).toLocaleString("vi-VN");
  els.totalProtein.textContent = `${roundOne(totals.protein)}g`;
  els.totalCarbs.textContent = `${roundOne(totals.carbs)}g`;
  els.totalFat.textContent = `${roundOne(totals.fat)}g`;
  els.goalProgress.textContent = `${progress}% mục tiêu`;
  els.calorieProgress.style.width = `${Math.min(progress, 100)}%`;
}

function renderMeals(member, meals) {
  if (!meals.length) {
    els.mealList.innerHTML = `<div class="empty-state">${escapeHtml(member.name)} chưa có bữa ăn hôm nay.</div>`;
    return;
  }

  els.mealList.innerHTML = meals.map((meal) => `
    <article class="meal-item">
      <div>
        <strong>${escapeHtml(meal.type)} - ${escapeHtml(meal.food)}</strong>
        <small>${meal.calories} kcal · P ${roundOne(meal.protein)}g · C ${roundOne(meal.carbs)}g · F ${roundOne(meal.fat)}g</small>
      </div>
      <button class="delete-btn" type="button" aria-label="Xóa bữa ăn" data-delete-meal="${meal.id}">x</button>
    </article>
  `).join("");

  document.querySelectorAll("[data-delete-meal]").forEach((button) => {
    button.addEventListener("click", () => {
      data.meals = data.meals.filter((meal) => meal.id !== button.dataset.deleteMeal);
      saveAndRender();
    });
  });
}

function drawWeeklyChart(member) {
  const canvas = els.weeklyChart;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  if (!member) {
    els.chartMemberName.textContent = "";
    return;
  }

  els.chartMemberName.textContent = member.name;
  const days = getWeekDays();
  const values = days.map((day) => {
    const meals = data.meals.filter((meal) => meal.memberId === member.id && meal.date === day.iso);
    return sumMeals(meals).calories;
  });
  const maxValue = Math.max(member.goal, ...values, 100);

  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#667085";

  const chartTop = 28;
  const chartBottom = height - 48;
  const chartLeft = 44;
  const chartRight = width - 22;
  const chartHeight = chartBottom - chartTop;
  const barWidth = Math.min(54, (chartRight - chartLeft) / days.length - 20);

  ctx.strokeStyle = "#e5e0d6";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = chartTop + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(chartLeft, y);
    ctx.lineTo(chartRight, y);
    ctx.stroke();
  }

  const goalY = chartBottom - (member.goal / maxValue) * chartHeight;
  ctx.strokeStyle = "#dc5f45";
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  ctx.moveTo(chartLeft, goalY);
  ctx.lineTo(chartRight, goalY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#dc5f45";
  ctx.textAlign = "left";
  ctx.fillText("Mục tiêu", chartLeft, Math.max(14, goalY - 8));

  days.forEach((day, index) => {
    const slot = (chartRight - chartLeft) / days.length;
    const x = chartLeft + slot * index + slot / 2;
    const barHeight = (values[index] / maxValue) * chartHeight;
    const y = chartBottom - barHeight;

    ctx.fillStyle = values[index] > member.goal ? "#dc5f45" : "#1d8a6b";
    roundRect(ctx, x - barWidth / 2, y, barWidth, barHeight, 7);
    ctx.fill();

    ctx.fillStyle = "#1f2933";
    ctx.textAlign = "center";
    ctx.fillText(Math.round(values[index]), x, Math.max(16, y - 8));
    ctx.fillStyle = "#667085";
    ctx.fillText(day.label, x, height - 18);
  });
}

function getWeekDays() {
  const current = new Date(today);
  const mondayOffset = (current.getDay() + 6) % 7;
  current.setDate(current.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(current);
    day.setDate(current.getDate() + index);
    return {
      iso: toIsoDate(day),
      label: day.toLocaleDateString("vi-VN", { weekday: "short" })
    };
  });
}

function sumMeals(meals) {
  return meals.reduce((total, meal) => ({
    calories: total.calories + Number(meal.calories || 0),
    protein: total.protein + Number(meal.protein || 0),
    carbs: total.carbs + Number(meal.carbs || 0),
    fat: total.fat + Number(meal.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function toIsoDate(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

function roundRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, Math.max(height, 0) / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
