const characterStats = {
  "Noble Man": {
    food: { current: 70, max: 90 },
    stamina: { current: 70, max: 80 },
    hygiene: { current: 60, max: 100 },
    happiness: { current: 50, max: 100 },
    moneyOwned: 45000,
  },
  "Noble Woman": {
    food: { current: 70, max: 90 },
    stamina: { current: 70, max: 80 },
    hygiene: { current: 60, max: 100 },
    happiness: { current: 50, max: 100 },
    moneyOwned: 45000,
  },
  "Old Man": {
    food: { current: 70, max: 100 },
    stamina: { current: 50, max: 70 },
    hygiene: { current: 70, max: 100 },
    happiness: { current: 70, max: 100 },
    moneyOwned: 30000,
  },
  Peasant: {
    food: { current: 50, max: 100 },
    stamina: { current: 50, max: 100 },
    hygiene: { current: 30, max: 100 },
    happiness: { current: 50, max: 100 },
    moneyOwned: 5000,
  },
  Princess: {
    food: { current: 70, max: 70 },
    stamina: { current: 40, max: 60 },
    hygiene: { current: 80, max: 100 },
    happiness: { current: 50, max: 100 },
    moneyOwned: 50000,
  },
  Queen: {
    food: { current: 60, max: 80 },
    stamina: { current: 40, max: 70 },
    hygiene: { current: 70, max: 100 },
    happiness: { current: 50, max: 100 },
    moneyOwned: 60000,
  },
};

const characterCards = document.querySelectorAll(".character-card");
const nameField = document.getElementById("playerName");
const startButton = document.getElementById("startBtn");
const characterError = document.getElementById("characterError");

startButton.addEventListener("click", function () {
  const playerName = nameField.value.trim();
  const selectedCharacter = document.querySelector(".character-card.selected");
  let valid = true;

  if (!playerName) {
    nameField.classList.add("input-error");
    valid = false;
  } else {
    nameField.classList.remove("input-error");
  }

  if (!selectedCharacter) {
    characterError.style.display = "block";
    valid = false;
  } else {
    characterError.style.display = "none";
  }

  if (valid) {
    console.log("Starting game with:", playerName);
    const characterId = selectedCharacter.getAttribute("data-character-id");
    const characterData = characterStats[characterId];

    const playerStats = {
      food: {
        currentStat: Math.round(
          (characterData.food.current / characterData.food.max) * 100
        ),
        max: 100 // or you can set this to a specific max value, depending on your game logic
      },
      stamina: {
        currentStat: Math.round(
          (characterData.stamina.current / characterData.stamina.max) * 100
        ),
        max: 100 // or the max value for stamina
      },
      hygiene: {
        currentStat: Math.round(
          (characterData.hygiene.current / characterData.hygiene.max) * 100
        ),
        max: 100 // max value for hygiene
      },
      happiness: {
        currentStat: Math.round(
          (characterData.happiness.current / characterData.happiness.max) * 100
        ),
        max: 100 // max value for happiness
      },
      health: {
        currentStat: 100, // or calculate the health percentage if needed
        max: 100
      }
    };
    

    localStorage.setItem("playerStats", JSON.stringify(playerStats));
    localStorage.setItem("playerName", playerName);
    localStorage.setItem("characterId", characterId);
    localStorage.setItem("playerMoney", characterData.moneyOwned);
    localStorage.setItem("previousMap", "map3.html");

    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "map1.html";
    }, 500);
  }
});

nameField.addEventListener("input", () => {
  if (nameField.value.trim()) {
    nameField.classList.remove("input-error");
  }
});
characterCards.forEach((card) => {
  card.addEventListener("click", () => {
    characterCards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
  });
});

function setupButton(buttonId, defaultSrc, hoverSrc, activeSrc) {
  const btn = document.getElementById(buttonId);

  btn.addEventListener("mouseover", () => {
    btn.src = hoverSrc;
  });

  btn.addEventListener("mouseout", () => {
    btn.src = defaultSrc;
  });

  btn.addEventListener("mousedown", () => {
    btn.src = activeSrc;
  });

  btn.addEventListener("mouseup", () => {
    btn.src = hoverSrc;
  });
}

setupButton(
  "startBtn",
  "Assets/GUI/start_Unpress.png",
  "Assets/GUI/start_Press.png",
  "Assets/GUI/start_Press.png"
);

document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro-screen");
  const menu = document.querySelector(".menu");
  const clickText = document.getElementById("clickToBegin");

  menu.style.display = "none";

  setTimeout(() => {
    clickText.style.pointerEvents = "auto";
  }, 3500); 

  intro.addEventListener("click", () => {
    intro.style.opacity = "0";
    setTimeout(() => {
      intro.style.display = "none";
      menu.style.display = "block";
      menu.style.opacity = "0";
      setTimeout(() => {
        menu.style.opacity = "1";
      }, 50);
    }, 1000);
  });
});