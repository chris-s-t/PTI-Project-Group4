const savedStats = JSON.parse(localStorage.getItem("playerStats"));
const playerName = localStorage.getItem("playerName") || "Adventurer";
const characterId = localStorage.getItem("characterId");
const playerMoney = localStorage.getItem("playerMoney") || 0;
const previousStats = {};

function updateStatusBar(stat, value) {
  const fill = document.querySelector(`.status-bar-${stat} .bar-fill`);
  const text = document.getElementById(`${stat}Text`);

  if (!fill) {
    console.warn(`Missing bar for stat: ${stat}`);
    return;
  }
  if (!text) {
    console.warn(`Missing text for stat: ${stat}`);
    return;
  }

  const percent = Math.max(0, Math.min(80, value));
  const prevValue = previousStats[stat] || 0;
  const diff = percent - prevValue;

  fill.style.width = `${percent}%`;
  text.textContent = `${percent}`;

  if (diff !== 0) {
    const sign = diff > 0 ? "+" : "";
    const color = diff > 0 ? "lime" : "red";
    showFloatingText(
      `.status-bar-${stat} .floating-text-container`,
      `${sign}${diff}`,
      color
    );
    previousStats[stat] = percent;
    fill.style.animation = diff > 0 ? "flashGreen 0.3s" : "flashRed 0.3s";
    setTimeout(() => (fill.style.animation = ""), 300);
  }
}
function updateStatusBars(stats) {
  for (const stat in stats) {
    updateStatusBar(stat, stats[stat]);
  }
}
function showFloatingText(containerSelector, text, color) {
  const container = document.querySelector(containerSelector);
  const div = document.createElement("div");
  div.className = "floating-text";
  div.style.color = color || "gold";
  div.textContent = text;
  container.appendChild(div);
  setTimeout(() => div.remove(), 1200);
}

if (savedStats) {
  console.log("Saved Stats", savedStats);
  updateStatusBars(savedStats);
} else {
  updateStatusBars(defaultStatus);
}
document.getElementById(
  "playerAvatar"
).src = `Assets/Avatars/Mini${characterId.replaceAll(" ", "")}Crop.png`;
document.getElementById("playerNameDisplay").textContent = playerName;
document.getElementById("moneyDisplay").textContent = `${playerMoney}`;
document.addEventListener("DOMContentLoaded", () => {
  updateStatusBars(defaultStatus);
});

//money_face update uang
function updateMoneyDisplay() {
  const playerMoney = localStorage.getItem("playerMoney");
  document.getElementById("moneyDisplay").textContent = `${playerMoney}`;
}

let previousMoney = localStorage.getItem("playerMoney");

setInterval(() => {
  const playerMoney = localStorage.getItem("playerMoney");

  if (playerMoney !== previousMoney) {
    updateMoneyDisplay();
    previousMoney = playerMoney;
  }
}, 500); //miliseconds