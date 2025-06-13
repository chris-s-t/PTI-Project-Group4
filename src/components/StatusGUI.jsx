import React, { useState, useEffect, useRef } from "react";
import "../styles/statusGUI.css";

import ClockIcon from "/Assets/StatusGUI/Clock.png";
import AvatarBack from "/Assets/StatusGUI/avatarBack.png";
import AvatarFront from "/Assets/StatusGUI/avatarFront.png";
import CoinIcon from "/Assets/StatusGUI/Icon.png";
import HealthIcon from "/Assets/StatusGUI/healthIcon.png";
import FoodIcon from "/Assets/StatusGUI/foodIcon.png";
import StaminaIcon from "/Assets/StatusGUI/staminaIcon.png";
import HappinessIcon from "/Assets/StatusGUI/happyIcon.png";
import HygieneIcon from "/Assets/StatusGUI/hygieneIcon.png";
import nobleManImg from "/Assets/Avatars/MiniNobleManCrop.png";
import nobleWomanImg from "/Assets/Avatars/MiniNobleWomanCrop.png";
import oldManImg from "/Assets/Avatars/MiniOldManCrop.png";
import peasantImg from "/Assets/Avatars/MiniPeasantCrop.png";
import princessImg from "/Assets/Avatars/MiniPrincessCrop.png";
import queenImg from "/Assets/Avatars/MiniQueenCrop.png";

import itemData from "../../public/itemData.js"

const characterAvatars = {
  "Noble Man": nobleManImg,
  "Noble Woman": nobleWomanImg,
  "Old Man": oldManImg,
  Peasant: peasantImg,
  Princess: princessImg,
  Queen: queenImg,
};

function formatTime(hours, minutes) {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

function getDayOfWeek(dayNumber) {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return daysOfWeek[(dayNumber - 1) % 7];
}

function getTitleFromCharacter(characterId) {
    const titles = {
        "Noble Man": "Noble Sir",
        "Noble Woman": "Noble Lady",
        "Old Man": "Elder",
        "Peasant": "Peasant",
        "Princess": "Princess",
        "Queen": "Your Majesty",
    };
    return titles[characterId] || "";
}

function getGreeting(hours, playerName) {
  let greeting;
  if (hours >= 5 && hours < 12) {
    greeting = "Good Morning";
  } else if (hours >= 12 && hours < 17) {
    greeting = "Good Afternoon";
  } else if (hours >= 17 && hours < 21) {
    greeting = "Good Evening";
  } else {
    greeting = "Good Night";
  }
  return `${greeting}, ${playerName}`;
}

function calculateOpacity(hours, minutes) {
  let opacity = 0;
  if (hours >= 12 && hours < 20) {
    const timePassed = (hours - 12) * 60 + minutes;
    opacity = (timePassed / (8 * 60)) * 0.5;
  } else if (hours >= 20 || hours < 4) {
    opacity = 0.5;
  } else if (hours >= 4 && hours < 10) {
    const timePassed = (hours - 4) * 60 + minutes;
    opacity = 0.5 - timePassed / (6 * 60);
  }
  return opacity;
}

function getStatusColor(current, max) {
  const percentage = (current / max) * 100;
  if (percentage > 70) return "#4CAF50";
  if (percentage > 40) return "#FFEB3B";
  return "#F44336";
}

function StatusGUI() {
  const [currentTime, setCurrentTime] = useState("00:00");
  const [currentDay, setCurrentDay] = useState("Day 1");
  const [greeting, setGreeting] = useState("");
  const [playerName, setPlayerName] = useState("Player");
  const [playerMoney, setPlayerMoney] = useState(0);
  const [playerAvatarSrc, setPlayerAvatarSrc] = useState("NobleMan");
  const [playerStats, setPlayerStats] = useState({
    health: { currentStat: 100, max: 100 },
    food: { currentStat: 100, max: 100 },
    stamina: { currentStat: 100, max: 100 },
    happiness: { currentStat: 100, max: 100 },
    hygiene: { currentStat: 100, max: 100 },
    score: { currentStat: 100, max: 100 },
  });
  const [characterId, setCharacterId] = useState("");
  const [inventory, setInventory] = useState([]);
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [clickedItemIndex, setClickedItemIndex] = useState(null);   // What the item image does after diklik
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupImageUrl, setPopupImageUrl] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [shopVisible, setShopVisible] = useState(false);
  const [shopItems, setShopItems] = useState([]);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [previousStats, setPreviousStats] = useState({});
  const [currentHours, setCurrentHours] = useState(15);
  const [currentMinutes, setCurrentMinutes] = useState(0);
  const [currentDayNumber, setCurrentDayNumber] = useState(1);
  const [currentGreeting, setCurrentGreeting] = useState("");

  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState({
    message: "",
    imageUrl: "",
  });
  const popupBoxRef = useRef(null);
  const joystickRef = useRef(null);
  const activeJoystickKeyRef = useRef(null);


  useEffect(() => {
    const savedPlayerName = localStorage.getItem("playerName");
    const savedPlayerMoney = localStorage.getItem("playerMoney");
    const savedPlayerStats = localStorage.getItem("playerStats");
    const savedCharacterId = localStorage.getItem("characterId");

    const savedStatsJson = localStorage.getItem("playerStats");
    const initialStats = savedStatsJson
      ? JSON.parse(savedStatsJson)
      : {
          food: { currentStat: 100, max: 100 },
          stamina: { currentStat: 100, max: 100 },
          hygiene: { currentStat: 100, max: 100 },
          happiness: { currentStat: 100, max: 100 },
          health: { currentStat: 100, max: 100 },
          score: { currentStat: 0, max: 100000},
        };
      
    setPlayerName(savedPlayerName);
    setCharacterId(savedCharacterId);
    setPlayerMoney(savedPlayerMoney);
    setPlayerStats(initialStats);
    setPreviousStats(
      Object.fromEntries(
        Object.entries(initialStats).map(([key, val]) => [
          key,
          Math.max(0, Math.min(val.max, val.currentStat)),
        ])
      )
    );
    let { hours, minutes } = JSON.parse(localStorage.getItem("time"));
    let day = parseInt(localStorage.getItem("day"));
    setCurrentHours(hours);
    setCurrentMinutes(minutes);
    setCurrentDayNumber(day);
    setCurrentTime(formatTime(hours, minutes));

    const title = getTitleFromCharacter(savedCharacterId || "");
    const capitalizedPlayerName =
      savedPlayerName.charAt(0).toUpperCase() + savedPlayerName.slice(1);
    const fullPlayerName = `${title} ${capitalizedPlayerName}`;
    setCurrentGreeting(getGreeting(hours, fullPlayerName));
    setOverlayOpacity(calculateOpacity(hours, minutes));

    const handleUpdateStatus = (event) => {
      const { type, value } = event.detail;
      setPlayerStats((prevStats) => {
        const newStats = { ...prevStats };
        if (newStats[type]) {
          newStats[type].currentStat = Math.max(
            0,
            Math.min(newStats[type].max, value)
          );
        }
        localStorage.setItem("playerStats", JSON.stringify(newStats));
        return newStats;
      });
    };

    const handleUpdateMoney = (event) => {
      const { value } = event.detail;
      setPlayerMoney(value);
      localStorage.setItem("playerMoney", value.toString());
    };

    const handleUpdateClock = (event) => {
      const { time, day, hours, minutes } = event.detail;
      setCurrentTime(time);
      setCurrentDay(day);
      setCurrentDayNumber(parseInt(day.split(" ")[1]) || 1);
      setCurrentHours(hours);
      setCurrentMinutes(minutes);

      const title = getTitleFromCharacter(characterId || "");
      const capitalizedPlayerName = playerName.charAt(0).toUpperCase() + playerName.slice(1);
      const fullPlayerName = `${title} ${capitalizedPlayerName}`;
      setCurrentGreeting(getGreeting(hours, fullPlayerName));
      setOverlayOpacity(calculateOpacity(hours, minutes));
    };

    const handleUpdateGreeting = (event) => {
      const { message } = event.detail;
      setGreeting(message);
      setCurrentGreeting(message);
    };

    const handleUpdatePlayerAvatar = (event) => {
      const { characterId } = event.detail;
      if (characterAvatars[characterId]) {
        setPlayerAvatarSrc(characterAvatars[characterId]);
      }
      const { charId } = event.detail;
      if (characterAvatars[charId]) {
        setCharacterId(charId);
        setPlayerAvatarSrc(characterAvatars[charId]);
      }
    };

    const handleUpdateInventory = (e) => {
      setInventory(e.detail.inventory);
    };

    const handleToggleInventory = (e) => {
      setInventoryVisible(e.detail.visible);
    };

    const handleShowBox = (event) => {
      const { message, imageUrl, imageDuration, title } = event.detail;

      setPopupMessage(message);
      setPopupImageUrl(imageUrl);
      setPopupTitle(title);
      setPopupVisible(true);

      setTimeout(() => {
        setPopupVisible(false);
      }, imageDuration);
    };

    const handleToggleShop = (e) => {
      setShopVisible(e.detail.visible);
      if (e.detail.visible) {
        import("../../public/shopkeeperInventory.js").then(module => {
          setShopItems(module.default);
        });
      }
    };


    const handleShowOverlay = () => {
      setOverlayVisible(true);
      console.log("Overlay ON");
    }
    const handleHideOverlay = () => {
      setOverlayVisible(false);
      console.log("Overlay OFF");
    }

    window.addEventListener("updatePlayerStatus", handleUpdateStatus);
    window.addEventListener("updatePlayerMoney", handleUpdateMoney);
    window.addEventListener("updateClock", handleUpdateClock);
    window.addEventListener("updateGreeting", handleUpdateGreeting);
    window.addEventListener("updatePlayerAvatar", handleUpdatePlayerAvatar);
    window.addEventListener("updateInventory", handleUpdateInventory);
    window.addEventListener("toggleInventory", handleToggleInventory);
    window.addEventListener("showBox", handleShowBox);
     window.addEventListener("toggleShop", handleToggleShop);
    window.addEventListener("showSleepOverlay", handleShowOverlay);
    window.addEventListener("hideSleepOverlay", handleHideOverlay);

    return () => {
      window.removeEventListener("updatePlayerStatus", handleUpdateStatus);
      window.removeEventListener("updatePlayerMoney", handleUpdateMoney);
      window.removeEventListener("updateClock", handleUpdateClock);
      window.removeEventListener("updateGreeting", handleUpdateGreeting);
      window.removeEventListener(
        "updatePlayerAvatar",
        handleUpdatePlayerAvatar
      );
      window.removeEventListener("updateInventory", handleUpdateInventory);
      window.removeEventListener("toggleInventory", handleToggleInventory);
      window.removeEventListener("showBox", handleShowBox);
      window.removeEventListener("toggleShop", handleToggleShop);
      window.removeEventListener("showSleepOverlay", handleShowOverlay);
      window.removeEventListener("hideSleepOverlay", handleHideOverlay);
    };

  }, []);

  useEffect(() => {
    const joystickElement = joystickRef.current;
    if (!joystickElement) {
      console.warn("Joystick element not found for event listeners.");
      return;
    }

    const handleMouseDown = (e) => {
      const btn = e.currentTarget;
      const key = btn.dataset.key;
      if (key) {
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key, bubbles: true })
        );
        activeJoystickKeyRef.current = key;
      }
    };

    const handleGlobalMouseUp = () => {
      if (activeJoystickKeyRef.current) {
        document.dispatchEvent(
          new KeyboardEvent("keyup", {
            key: activeJoystickKeyRef.current,
            bubbles: true,
          })
        );
        activeJoystickKeyRef.current = null;
      }
    };

    const handleMouseLeave = (e) => {
      const key = e.currentTarget.dataset.key;
      if (activeJoystickKeyRef.current === key) {
        document.dispatchEvent(
          new KeyboardEvent("keyup", { key, bubbles: true })
        );
        activeJoystickKeyRef.current = null;
      }
    };

    const arrowButtons = joystickElement.querySelectorAll(".arrow");
    arrowButtons.forEach((btn) => {
      btn.addEventListener("mousedown", handleMouseDown);
      btn.addEventListener("mouseleave", handleMouseLeave);
      btn.addEventListener("dragstart", (e) => e.preventDefault());
    });

    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      arrowButtons.forEach((btn) => {
        btn.removeEventListener("mousedown", handleMouseDown);
        btn.removeEventListener("mouseleave", handleMouseLeave);
        btn.removeEventListener("dragstart", (e) => e.preventDefault());
      });
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  const getStatusColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage > 70) return "#4CAF50";
    if (percentage > 40) return "#FFEB3B";
    return "#F44336";
  };
  const showFloatingText = (containerSelector, text, color) => {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn(`Floating text container not found: ${containerSelector}`);
      return;
    }

    const div = document.createElement("div");
    div.className = "floating-text";
    div.style.color = color || "gold";
    div.textContent = text;
    container.appendChild(div);
    setTimeout(() => div.remove(), 1200);
  };

  const title = getTitleFromCharacter(characterId);
  const capitalizedPlayerName = playerName.charAt(0).toUpperCase() + playerName.slice(1);
  const fullPlayerName = `${title} ${capitalizedPlayerName}`;

  return (
    <>
    {overlayVisible && (
      <div className="sleep-overlay fade-in"></div>
    )}
      <div id="statusGUI" className="status-gui">
        <div className="clock">
          <img src={ClockIcon} alt="Clock" />
          <div className="time">{currentTime}</div>
          <div className="day">{getDayOfWeek(currentDayNumber)} -  {currentDay}</div>
        </div>

        <div className="avatar-section">
          <div className="avatar-stack">
            <img
              src={AvatarBack}
              className="avatar-ring back"
              alt="Avatar Back Ring"
            />
            <div className="avatar-mask">
              <img
                id="playerAvatar"
                src={playerAvatarSrc}
                className="avatar-core"
                alt="Player Avatar"
              />
            </div>
            <img
              src={AvatarFront}
              className="avatar-ring front"
              alt="Avatar Front Ring"
            />
          </div>

          <div className="name-money-container">
            <div id="playerNameDisplay" className="name-box">
              {playerName}
            </div>
            <div className="money-box">
              <img src={CoinIcon} className="coin-icon" alt="Coin Icon" />
              <span id="moneyDisplay" className="money-text">
                {playerMoney.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {Object.entries(playerStats).map(([statName, stat]) => {
          if (statName === "score") {
            return (
              <div className="status-score-display" key={statName}>
                <span className="score-text">{stat.currentStat}</span>{" "}
              </div>
            );
          } else {
            return (
              <div className={`status-bar status-bar-${statName}`}
                key={statName}
              >
                <div className="bar-container">
                  <div className="floating-text-container"></div>
                  <div className="bar-bg"></div>
                  <img
                    src={
                      statName === "health"
                        ? HealthIcon
                        : statName === "food"
                        ? FoodIcon
                        : statName === "stamina"
                        ? StaminaIcon
                        : statName === "happiness"
                        ? HappinessIcon
                        : HygieneIcon
                    }
                    className="status-icon"
                    alt={`${statName} Icon`}
                  />
                  <div
                    className={`bar-fill status-bar-${statName}`}
                    style={{
                      width: `${(stat.currentStat / stat.max) * 80}%`,
                      backgroundColor: getStatusColor(
                        stat.currentStat,
                        stat.max
                      ),
                    }}
                  ></div>
                  <div className="stat-text" id={`${statName}Text`}>
                    {stat.currentStat}
                  </div>
                </div>
              </div>
              );
          }
        })}
      </div>

      <div className="medieval-joystick" ref={joystickRef}>
        <button className="arrow up" data-key="ArrowUp">
          ▲
        </button>
        <div className="middle-row">
          <button className="arrow left" data-key="ArrowLeft">
            ◄
          </button>
          <button className="arrow right" data-key="ArrowRight">
            ►
          </button>
        </div>
        <button className="arrow down" data-key="ArrowDown">
          ▼
        </button>
      </div>

      <div id="greeting" className="greeting">
        {currentGreeting}
      </div>

    <div id="overlay" style={{ display: "none" }}></div>

    {hoveredItem && (
      <div className="item-description-box-outside">
        <h3 className="inventory-title">{hoveredItem.name}</h3>
        <p className="item-description">{hoveredItem.description}</p>
        {hoveredItem.sellPrice != null && (
          <p className="item-description">Sell Price: {hoveredItem.sellPrice}g</p>
        )}
      </div>
    )}

    {inventoryVisible && (
      <>
        <div className="inventory-overlay">
          <div className="inventory-window">
            <h3 className="inventory-title">Inventory</h3>
            <div className="inventory-grid">
              {Array.from({ length: 60 }).map((_, index) => {
                const item = inventory[index];
                return (
                  <div
                    className="inventory-slot"
                    key={index}
                    onMouseEnter={() => {
                      const fullItem = itemData[item.id];
                      setHoveredItem(fullItem || null);
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => {
                      if (item) {
                        setClickedItemIndex(index);
                        window.dispatchEvent(
                          new CustomEvent("useInventoryItem", { detail: { id: item.id } })
                        );
                        setTimeout(() => setClickedItemIndex(null), 300);
                      }
                    }}
                  >
                    {item && (
                      <>
                        <img
                          src={item.image || `/Assets/Items/${item.id}.png`}
                          alt={item.name}
                          className={`inventory-icon ${clickedItemIndex === index ? "clicked" : ""}`}
                        />
                        <span className="inventory-quantity">x{item.quantity}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {hoveredItem && (
          <div className="item-description-box-outside">
            <h3 className="inventory-title">{hoveredItem.name}</h3>
            <p className="item-description">{hoveredItem.description}</p>
          </div>
        )}
      </>
    )}
  
  {shopVisible && (
    <div className="inventory-overlay">
      <div className="inventory-window shopkeeper-section">
        <h3 className="inventory-title">Shop</h3>
        <div className="inventory-grid">
          {shopItems.map((item, index) => {
            const data = itemData[item.id];
            return (
              <div
                key={index}
                className="inventory-slot"
                onClick={() => {
                  if (item) {
                    window.dispatchEvent(
                      new CustomEvent("buyShopItem", { detail: { id: item.id } })
                    );
                  }
                }}
                onMouseEnter={() => setHoveredItem(data || null)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <img src={data.image} className="inventory-icon" />
                <span className="inventory-quantity">x{item.quantity}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="inventory-window player-shop-section">
        <h3 className="inventory-title">Sell Inventory</h3>
        <div className="inventory-grid">
          {inventory.map((item, index) => (
            <div
              key={index}
              className="inventory-slot"
              onClick={() => {
                if (item) {
                  window.dispatchEvent(
                    new CustomEvent("sellInventoryItem", { detail: { id: item.id } })
                  );
                }
              }}
              onMouseEnter={() => {
                const fullItem = itemData[item.id];
                setHoveredItem(fullItem || null);
              }}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <img
                src={`/Assets/Items/${item.id}.png`}
                className="inventory-icon"
              />
              <span className="inventory-quantity">x{item.quantity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

  {popupVisible && (
    <div className="popup-box">
      <h3 className="popup-title">{popupTitle}</h3>
      <div className="popup-content-row">
        <p className="popup-message">{popupMessage}</p>
        <img src={popupImageUrl} alt="Popup Visual" className="popup-image" />
      </div>
    </div>
  )}


  </>
  );
}

export default StatusGUI;