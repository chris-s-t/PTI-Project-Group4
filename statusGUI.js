const savedStats = JSON.parse(localStorage.getItem("playerStats"));
const playerName = localStorage.getItem("playerName") || "Adventurer";
const characterId = localStorage.getItem("characterId");
const playerMoney = localStorage.getItem("playerMoney") || 0;
const previousStats = {};

const timeElement = document.querySelector(".time");
const overlay = document.getElementById("overlay");  // Reference to the overlay element

function statChange(statName, amount){
  let stats = JSON.parse(localStorage.getItem("playerStats"));
  stats[statName].currentStat += amount;
  localStorage.setItem("playerStats", JSON.stringify(stats));
  const statChangeEvent = new Event("playerStatChanged");
  window.dispatchEvent(statChangeEvent);
}

// Function to format time as HH:MM
function formatTime(hours, minutes) {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Load the saved time from localStorage, or start from 00:00 if nothing is saved
function loadTime() {
  const savedTime = JSON.parse(localStorage.getItem("time"));
  if (savedTime) {
    return savedTime;
  } else {
    // If no time is saved, initialize at 00:00
    return { hours: 15, minutes: 0 };
  }
}
// Function to save the current time to localStorage
function saveTime(hours, minutes) {
  const time = { hours, minutes };
  localStorage.setItem("time", JSON.stringify(time));
}
// Function to calculate opacity based on the current time
function calculateOpacity(hours, minutes) {
  let opacity = 0;  // Default opacity is 1 (fully visible)

  // If the time is between 12:00 and 20:00, darken the overlay
  if (hours >= 12 && hours < 20) {
    // Gradually darken from 12:00 (opacity 1) to 20:00 (opacity 0.5)
    const timePassed = (hours - 12) * 60 + minutes; // Total minutes since 12:00
    opacity = 1 - (timePassed / (8 * 60)); // 8 hours from 12:00 to 20:00
  }
  // If the time is between 20:00 and 4:00, keep the opacity at 0.5
  else if (hours >= 20 || hours < 4) {
    opacity = 0.5;
  }
  // If the time is between 4:00 and 10:00, brighten the overlay
  else if (hours >= 4 && hours < 10) {
    // Gradually brighten from 4:00 (opacity 0.5) to 10:00 (opacity 0)
    const timePassed = (hours - 4) * 60 + minutes; // Total minutes since 4:00
    opacity = 0.5 - (timePassed / (6 * 60)); // 6 hours from 4:00 to 10:00
  }

  return opacity;
}
function trackEvery10Minutes(minutes) {
  // degrade these stats every 10 minutes ingame
  if (minutes % 10 === 0) {
    statChange("food", -3)
    statChange("stamina", -1)
    statChange("hygiene", -2)
    statChange("happiness", -1)
  }
}
// Function to update the clock and the overlay opacity
function updateClock() {
  // Load current time from localStorage
  let { hours, minutes } = loadTime();

  // Increment the minutes
  minutes++;

  if (minutes >= 60) {
    minutes = 0;
    hours++;
    if (hours >= 24) {
      hours = 0; // Reset to 00:00 after 23:59
    }
  }

  // Update the clock display
  timeElement.textContent = formatTime(hours, minutes);

  // Save the updated time to localStorage
  saveTime(hours, minutes);

  // Calculate the opacity based on the current time
  const opacity = calculateOpacity(hours, minutes);

  // Update the opacity of the overlay
  overlay.style.opacity = opacity;

  // Degradation period
  trackEvery10Minutes(minutes)
}

// Update the clock every 1000 milliseconds (1 second)
setInterval(updateClock, 1000);

// Initially update the clock to show the saved time (or 00:00 if not saved)
updateClock();


function updateStatusBar(stat, currentValue, maxValue) {
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

  //checks if its over the max
  if(currentValue > maxValue){
    let changeStats = JSON.parse(localStorage.getItem("playerStats"));
    currentValue = maxValue;
    changeStats[stat].currentStat = maxValue;
    localStorage.setItem("playerStats", JSON.stringify(changeStats));
  } else if(currentValue < 0){
    let changeStats = JSON.parse(localStorage.getItem("playerStats"));
    currentValue = 0;
    changeStats[stat].currentStat = 0;
    localStorage.setItem("playerStats", JSON.stringify(changeStats));
  }

  const percent = Math.max(0, Math.min(80, currentValue));  // Fixed to 100 max
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
    updateStatusBar(stat, stats[stat].currentStat, stats[stat].max);  // Access currentStat correctly
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

//money_face update uang dan stat
function updateMoneyDisplay() {
  const playerMoney = localStorage.getItem("playerMoney");
  document.getElementById("moneyDisplay").textContent = `${playerMoney}`;
}
window.addEventListener("playerMoneyChanged", function () { //money
  updateMoneyDisplay();
});
window.addEventListener("playerStatChanged", function () {  //stat
  const updateStats = JSON.parse(localStorage.getItem("playerStats"));
  updateStatusBars(updateStats);
});

// Listen for the custom event
window.addEventListener('showBox', function(event) {
  const popupBox = document.getElementById('popupBox');
  const popupText = document.getElementById('popupText');

  // Get the data from the event
  const { message, imageUrl } = event.detail;

  // Set the background image and the text
  popupBox.style.backgroundImage = `url(${imageUrl})`;
  popupText.textContent = message;

  // Show the popup box
  popupBox.style.display = 'block';

  // Optional: Hide the box after x seconds
  clearTimeout(null);
  setTimeout(() => {
      popupBox.style.display = 'none';
  }, 1000); //miliseconds
});