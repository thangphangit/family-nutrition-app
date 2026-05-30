const STORAGE_KEY = "familyNutritionApp";

const preferenceLabels = {
  balanced: "Cân bằng",
  vietnamese: "Món Việt",
  "high-protein": "Giàu protein",
  light: "Ít calo",
  vegetarian: "Chay",
  "kid-friendly": "Dễ ăn cho trẻ"
};

const foodCatalog = [
  { name: "Yến mạch chuối và sữa chua", meal: "Sáng", calories: 360, protein: 18, carbs: 52, fat: 8, tags: ["balanced", "light", "kid-friendly"] },
  { name: "Bánh mì trứng ốp la và rau", meal: "Sáng", calories: 420, protein: 20, carbs: 45, fat: 16, tags: ["balanced", "vietnamese"] },
  { name: "Phở gà ít béo", meal: "Sáng", calories: 480, protein: 32, carbs: 58, fat: 10, tags: ["vietnamese", "high-protein"] },
  { name: "Sinh tố bơ chuối protein", meal: "Sáng", calories: 430, protein: 28, carbs: 40, fat: 17, tags: ["high-protein", "kid-friendly"] },
  { name: "Cơm gà áp chảo và rau luộc", meal: "Trưa", calories: 620, protein: 42, carbs: 68, fat: 18, tags: ["balanced", "vietnamese", "high-protein"] },
  { name: "Bún thịt nướng nhiều rau", meal: "Trưa", calories: 560, protein: 30, carbs: 72, fat: 16, tags: ["vietnamese", "balanced"] },
  { name: "Đậu hũ sốt cà chua với cơm gạo lứt", meal: "Trưa", calories: 510, protein: 24, carbs: 70, fat: 14, tags: ["vegetarian", "balanced", "vietnamese"] },
  { name: "Salad cá ngừ khoai lang", meal: "Trưa", calories: 470, protein: 38, carbs: 42, fat: 14, tags: ["high-protein", "light"] },
  { name: "Cá hồi áp chảo, cơm và bông cải", meal: "Tối", calories: 590, protein: 40, carbs: 52, fat: 24, tags: ["balanced", "high-protein"] },
  { name: "Canh rau, trứng hấp và cơm nhỏ", meal: "Tối", calories: 430, protein: 24, carbs: 46, fat: 14, tags: ["vietnamese", "light", "kid-friendly"] },
  { name: "Miến gà rau nấm", meal: "Tối", calories: 450, protein: 32, carbs: 50, fat: 10, tags: ["vietnamese", "light", "high-protein"] },
  { name: "Cơm chay nấm, đậu hũ và rau xanh", meal: "Tối", calories: 520, protein: 26, carbs: 66, fat: 16, tags: ["vegetarian", "balanced"] },
  { name: "Sữa chua Hy Lạp và hạt", meal: "Phụ", calories: 220, protein: 18, carbs: 18, fat: 9, tags: ["high-protein", "light"] },
  { name: "Trái cây và sữa tươi", meal: "Phụ", calories: 180, protein: 7, carbs: 28, fat: 4, tags: ["light", "kid-friendly"] },
  { name: "Bắp luộc và trứng", meal: "Phụ", calories: 260, protein: 14, carbs: 34, fat: 8, tags: ["vietnamese", "balanced"] },
  { name: "Đậu nành và chuối", meal: "Phụ", calories: 240, protein: 13, carbs: 35, fat: 5, tags: ["vegetarian", "kid-friendly"] }
];

const defaultData = {
  members: [
    { id: createId(), name: "Bố Minh", goal: 2200, preference: "high-protein" },
    { id: createId(), name: "Mẹ Lan", goal: 1800, preference: "light" },
    { id: createId(), name: "Bé An", goal: 1400, preference: "kid-friendly" }
  ],
  meals: []
};

let data = loadData();

const els = {
  todayLabel: document.querySelector("#todayLabel"),
  memberForm: document.querySelector("#memberForm"),
  memberName: document.querySelector("#memberName"),
  memberGoal: document.querySelector("#memberGoal"),
  memberPreference: document.querySelector("#memberPreference"),
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
  suggestionMemberName: document.querySelector("#suggestionMemberName"),
  suggestionMealType: document.querySelector("#suggestionMealType"),
  generateSuggestion: document.querySelector("#generateSuggestion"),
  calorieAdvice: document.querySelector("#calorieAdvice"),
  suggestionList: document.querySelector("#suggestionList"),
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
  const preference = els.memberPreference.value;
  if (!name || !goal) return;

  data.members.push({ id: createId(), name, goal, preference });
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
els.suggestionMealType.addEventListener("change", renderSuggestions);
els.generateSuggestion.addEventListener("click", renderSuggestions);
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
      members: Array.isArray(parsed.members) ? parsed.members.map(normalizeMember) : defaultData.members,
      meals: Array.isArray(parsed.meals) ? parsed.meals : []
    };
  } catch {
    return defaultData;
  }
}

function normalizeMember(member) {
  return {
    id: member.id || createId(),
    name: member.name || "Thành viên",
    goal: Number(member.goal) || 1800,
    preference: preferenceLabels[member.preference] ? member.preference : "balanced"
  };
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
        <small>Mục tiêu ${member.goal.toLocaleString("vi-VN")} kcal/ngày · ${preferenceLabels[member.preference]}</small>
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
    renderSuggestions();
    drawWeeklyChart(null);
    return;
  }

  const dailyMeals = data.meals.filter((meal) => meal.memberId === member.id && meal.date === todayIso);
  const totals = sumMeals(dailyMeals);
  setTotals(totals, member.goal);
  renderMeals(member, dailyMeals);
  renderSuggestions();
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

function renderSuggestions() {
  const member = data.members.find((item) => item.id === els.summaryMember.value);

  if (!member) {
    els.suggestionMemberName.textContent = "";
    els.calorieAdvice.textContent = "Thêm thành viên để nhận gợi ý thực đơn.";
    els.suggestionList.innerHTML = "";
    els.generateSuggestion.disabled = true;
    return;
  }

  els.generateSuggestion.disabled = false;
  els.suggestionMemberName.textContent = `${member.name} · ${preferenceLabels[member.preference]}`;

  const dailyMeals = data.meals.filter((meal) => meal.memberId === member.id && meal.date === todayIso);
  const totals = sumMeals(dailyMeals);
  const remaining = Math.max(member.goal - totals.calories, 0);
  const mealType = els.suggestionMealType.value;
  const mealBudget = getMealBudget(remaining, mealType, member.goal);
  const suggestions = getSuggestions(member, mealType, mealBudget);

  els.calorieAdvice.innerHTML = `
    Đã dùng <strong>${Math.round(totals.calories).toLocaleString("vi-VN")} kcal</strong>,
    còn khoảng <strong>${Math.round(remaining).toLocaleString("vi-VN")} kcal</strong>.
    Gợi ý cho bữa ${escapeHtml(mealType.toLowerCase())}: khoảng <strong>${Math.round(mealBudget).toLocaleString("vi-VN")} kcal</strong>.
  `;

  if (!suggestions.length) {
    els.suggestionList.innerHTML = `<div class="empty-state">Chưa tìm thấy món phù hợp. Thử đổi loại bữa hoặc tăng mục tiêu calo.</div>`;
    return;
  }

  els.suggestionList.innerHTML = suggestions.map((food, index) => `
    <article class="suggestion-card">
      <div>
        <strong>${escapeHtml(food.name)}</strong>
        <small>${food.calories} kcal · P ${food.protein}g · C ${food.carbs}g · F ${food.fat}g</small>
        <span>${food.tags.map((tag) => preferenceLabels[tag]).filter(Boolean).join(" · ")}</span>
      </div>
      <button type="button" data-use-suggestion="${index}">Dùng món này</button>
    </article>
  `).join("");

  document.querySelectorAll("[data-use-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      const food = suggestions[Number(button.dataset.useSuggestion)];
      fillMealForm(member, mealType, food);
    });
  });
}

function getMealBudget(remaining, mealType, goal) {
  const mealRatios = { "Sáng": 0.25, "Trưa": 0.35, "Tối": 0.3, "Phụ": 0.1 };
  const defaultBudget = goal * (mealRatios[mealType] || 0.25);
  if (remaining <= 0) return Math.min(defaultBudget, 220);
  return Math.min(defaultBudget, remaining);
}

function getSuggestions(member, mealType, budget) {
  return foodCatalog
    .filter((food) => food.meal === mealType)
    .map((food) => ({
      ...food,
      score: Math.abs(food.calories - budget)
        - (food.tags.includes(member.preference) ? 160 : 0)
        - (food.tags.includes("balanced") ? 30 : 0)
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}

function fillMealForm(member, mealType, food) {
  els.mealMember.value = member.id;
  els.mealDate.value = todayIso;
  els.mealType.value = mealType;
  els.foodName.value = food.name;
  els.calories.value = food.calories;
  els.protein.value = food.protein;
  els.carbs.value = food.carbs;
  els.fat.value = food.fat;
  els.foodName.focus();
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
