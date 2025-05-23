import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [clickEnabled, setClickEnabled] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Enable click after delay
  useEffect(() => {
    const timer = setTimeout(() => setClickEnabled(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Handle intro click
  const handleIntroClick = () => {
    if (!clickEnabled) return;

    // Fade out intro
    setShowIntro(false);

    // Delay then show menu
    setTimeout(() => {
      setMenuVisible(true);
    }, 1000);
  };
  return (
    <>
      {showIntro && (
        <div id="intro-screen" style={{ opacity: showIntro ? 1 : 0, transition: "opacity 1s" }}
          onClick={handleIntroClick}>
          <div className="intro-content">
            <h1 className="intro-title">Petualangan Abad Pertengahan</h1>
            <p className="click-to-begin" id="clickToBegin" style={{
                pointerEvents: clickEnabled ? "auto" : "none",
                opacity: clickEnabled ? 1 : 0,
                transition: "opacity 1s",
              }}>
              Click to Begin
            </p>
          </div>
          </div>
      )}
  {menuVisible && (
        <div className="menu" style={{ opacity: showIntro ? 1 : 0, transition: "opacity 1s" }}
          onClick={handleIntroClick}>
          <div className="character-selection">
            <h1>Choose Your Character</h1>
            <br />
            <br />
            <div className="name-input">
              <input
                type="text"
                placeholder="Enter your name..."
                id="playerName"
              />
            </div>
          </div>

          <div id="characterError">
            ⚠ Please choose a character to continue.
          </div>

          <div className="character-grid">
            <div className="character-card" data-character-id="Noble Man">
              <img src="Assets/Avatars/MiniNobleManCrop.png" alt="Noble Man" />
              <div className="character-divider"></div>
              <div className="character-name">Noble Man</div>
            </div>

            <div className="character-card" data-character-id="Noble Woman">
              <img
                src="Assets/Avatars/MiniNobleWomanCrop.png"
                alt="Noble Woman"
              />
              <div className="character-divider"></div>
              <div className="character-name">Noble Woman</div>
            </div>

            <div className="character-card" data-character-id="Old Man">
              <img src="Assets/Avatars/MiniOldManCrop.png" alt="Old Man" />
              <div className="character-divider"></div>
              <div className="character-name">Old Man</div>
            </div>

            <div className="character-card" data-character-id="Peasant">
              <img src="Assets/Avatars/MiniPeasantCrop.png" alt="Peasant" />
              <div className="character-divider"></div>
              <div className="character-name">Peasant</div>
            </div>

            <div className="character-card" data-character-id="Princess">
              <img src="Assets/Avatars/MiniPrincessCrop.png" alt="Princess" />
              <div className="character-divider"></div>
              <div className="character-name">Princess</div>
            </div>

            <div className="character-card" data-character-id="Queen">
              <img src="Assets/Avatars/MiniQueenCrop.png" alt="Queen" />
              <div className="character-divider"></div>
              <div className="character-name">Queen</div>
            </div>
          </div>

          <div className="buttons">
            <img
              src="Assets/GUI/start_Unpress.png"
              className="menu-button-img"
              id="startBtn"
              alt="Start Game"
            />
          </div>
        </div>
      )}
      <script src="mainMenu.js"></script>
    </>
  );
}

export default App;
