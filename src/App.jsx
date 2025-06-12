import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./styles/App.css";
import IntroScreen from "./components/IntroScreen";
import MainMenu from "./components/MainMenu";
import GameMap from "./components/GameMap";
import StatusGUI from "./components/StatusGUI"; // Still imports its own statusGUI.css

function App() {
  const [playerName, setPlayerName] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [playerStats, setPlayerStats] = useState(() => {
    const savedStats = localStorage.getItem("playerStats");
    return savedStats ? JSON.parse(savedStats) : null;
  });
  const [playerMoney, setPlayerMoney] = useState(() => {
    const savedMoney = localStorage.getItem("playerMoney");
    return savedMoney ? parseInt(savedMoney) : 0;
  });

  useEffect(() => {
    const savedPlayerName = localStorage.getItem("playerName");
    const savedCharacterId = localStorage.getItem("characterId");
    if (savedPlayerName) setPlayerName(savedPlayerName);
    if (savedCharacterId) setSelectedCharacter(savedCharacterId);
  }, []);


  const handleStartGame = (name, characterId, stats, money) => {
    setPlayerName(name);
    setSelectedCharacter(characterId);
    setPlayerStats(stats);
    setPlayerMoney(money);
    localStorage.setItem("playerName", name);
    localStorage.setItem("characterId", characterId);
    localStorage.setItem("playerStats", JSON.stringify(stats));
    localStorage.setItem("playerMoney", money.toString());
    localStorage.setItem("playerInventory", JSON.stringify([]));
  };


  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntroScreen />} />
        <Route
          path="/menu"
          element={
            <MainMenu
              playerName={playerName}
              setPlayerName={setPlayerName}
              selectedCharacter={selectedCharacter}
              setSelectedCharacter={setSelectedCharacter}
              onStartGame={handleStartGame}
            />
          }
        />
        <Route path="/map1" element={<GameMap key="map1" mapNum={1} />} />
        <Route path="/map2" element={<GameMap key="map2" mapNum={2} />} />
        <Route path="/map3" element={<GameMap key="map3" mapNum={3} />} />
        <Route path="/map4" element={<GameMap key="map4" mapNum={4} />} />
        <Route path="/map5" element={<GameMap key="map5" mapNum={5} />} />
        {/* Add more map routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;