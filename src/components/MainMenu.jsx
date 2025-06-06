// src/components/MainMenu.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"; // Ensure App.css is imported for styling
import startUnpress from "../Assets/GUI/start_Unpress.png";
import startPress from "../Assets/GUI/start_Press.png";

// Import character images dynamically
const characterImages = {
  "Noble Man": require("../Assets/Avatars/MiniNobleManCrop.png"),
  "Noble Woman": require("../Assets/Avatars/MiniNobleWomanCrop.png"),
  "Old Man": require("../Assets/Avatars/MiniOldManCrop.png"),
  Peasant: require("../Assets/Avatars/MiniPeasantCrop.png"),
  Princess: require("../Assets/Avatars/MiniPrincessCrop.png"),
  Queen: require("../Assets/Avatars/MiniQueenCrop.png"),
};

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

function MainMenu({ playerName, setPlayerName, selectedCharacter, setSelectedCharacter, onStartGame }) {
  const [nameError, setNameError] = useState(false);
  const [characterSelectError, setCharacterSelectError] = useState(false);
  const [startBtnSrc, setStartBtnSrc] = useState(startUnpress);
  const navigate = useNavigate();

  const handleCharacterSelect = (characterId) => {
    setSelectedCharacter(characterId);
    setCharacterSelectError(false); // Clear error when a character is selected
  };

  const handleStartGameClick = () => {
    let valid = true;

    if (!playerName.trim()) {
      setNameError(true);
      valid = false;
    } else {
      setNameError(false);
    }

    if (!selectedCharacter) {
      setCharacterSelectError(true);
      valid = false;
    } else {
      setCharacterSelectError(false);
    }

    if (valid) {
      const characterData = characterStats[selectedCharacter];
      const playerStats = {
        food: {
          currentStat: Math.round(
            (characterData.food.current / characterData.food.max) * 100
          ),
          max: 100,
        },
        stamina: {
          currentStat: Math.round(
            (characterData.stamina.current / characterData.stamina.max) * 100
          ),
          max: 100,
        },
        hygiene: {
          currentStat: Math.round(
            (characterData.hygiene.current / characterData.hygiene.max) * 100
          ),
          max: 100,
        },
        happiness: {
          currentStat: Math.round(
            (characterData.happiness.current / characterData.happiness.max) * 100
          ),
          max: 100,
        },
        health: {
          currentStat: 100,
          max: 100,
        },
      };

      onStartGame(playerName, selectedCharacter, playerStats, characterData.moneyOwned);

      document.body.classList.add("fade-out"); // Apply fade-out to body
      setTimeout(() => {
        navigate("/map1"); // Navigate to the first map
      }, 500); // Match CSS transition duration
    }
  };

  return (
    <div className="menu fade-in">
      <div className="character-selection">
        <h1>Choose Your Character</h1>
        <br />
        <br />
        <div className="name-input">
          <input
            type="text"
            placeholder="Enter your name..."
            id="playerName"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              if (e.target.value.trim()) setNameError(false); // Clear error on input
            }}
            className={nameError ? "input-error" : ""}
          />
        </div>
      </div>

      <div
        id="characterError"
        style={{ display: characterSelectError ? "block" : "none" }}
      >
        ⚠ Please choose a character to continue.
      </div>

      <div className="character-grid">
        {Object.keys(characterStats).map((char) => (
          <div
            className={`character-card ${selectedCharacter === char ? "selected" : ""}`}
            data-character-id={char}
            key={char}
            onClick={() => handleCharacterSelect(char)}
          >
            <img
              src={characterImages[char]}
              alt={char}
            />
            <div className="character-divider"></div>
            <div className="character-name">{char}</div>
          </div>
        ))}
      </div>

      <div className="buttons">
        <img
          src={startBtnSrc}
          className="menu-button-img"
          id="startBtn"
          alt="Start Game"
          onClick={handleStartGameClick}
          onMouseEnter={() => setStartBtnSrc(startPress)}
          onMouseLeave={() => setStartBtnSrc(startUnpress)}
          onMouseDown={() => setStartBtnSrc(startPress)}
          onMouseUp={() => setStartBtnSrc(startPress)}
        />
      </div>
    </div>
  );
}

export default MainMenu;