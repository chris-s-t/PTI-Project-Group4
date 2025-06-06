// src/components/StatusGUI.jsx
import React, { useState, useEffect } from 'react';
import '../statusGUI.css';

// Import all necessary images
import ClockIcon from '../Assets/GUI/Clock.png';
import AvatarBack from '../Assets/StatusGUI/avatarBack.png';
import AvatarFront from '../Assets/StatusGUI/avatarFront.png';
import CoinIcon from '../Assets/Minerals/Icon10.png'; // Assuming this is the new money icon
import HealthIcon from '../Assets/StatusGUI/healthIcon.png';
import FoodIcon from '../Assets/StatusGUI/foodIcon.png';
import StaminaIcon from '../Assets/StatusGUI/staminaIcon.png';
import HappinessIcon from '../Assets/StatusGUI/happyIcon.png';
import HygieneIcon from '../Assets/StatusGUI/hygieneIcon.png';

// Character avatar images (you'll need to expand this as you add more)
const characterAvatars = {
    "Noble Man": require("../Assets/Avatars/MiniNobleManCrop.png"),
    "Noble Woman": require("../Assets/Avatars/MiniNobleWomanCrop.png"),
    "Old Man": require("../Assets/Avatars/MiniOldManCrop.png"),
    "Peasant": require("../Assets/Avatars/MiniPeasantCrop.png"),
    "Princess": require("../Assets/Avatars/MiniPrincessCrop.png"),
    "Queen": require("../Assets/Avatars/MiniQueenCrop.png"),
    // Add more character images here if you have them
};

function StatusGUI() {
    const [currentTime, setCurrentTime] = useState("00:00");
    const [currentDay, setCurrentDay] = useState("Day 1");
    const [greeting, setGreeting] = useState("");
    const [playerName, setPlayerName] = useState("Player");
    const [playerMoney, setPlayerMoney] = useState(0);
    const [playerAvatarSrc, setPlayerAvatarSrc] = useState(""); // State for player avatar
    const [playerStats, setPlayerStats] = useState({
        health: { currentStat: 100, max: 100 },
        food: { currentStat: 100, max: 100 },
        stamina: { currentStat: 100, max: 100 },
        happiness: { currentStat: 100, max: 100 },
        hygiene: { currentStat: 100, max: 100 },
    });

    useEffect(() => {
        // Load initial data from localStorage
        const savedPlayerName = localStorage.getItem("playerName");
        const savedPlayerMoney = localStorage.getItem("playerMoney");
        const savedPlayerStats = localStorage.getItem("playerStats");
        const savedCharacterId = localStorage.getItem("characterId");

        if (savedPlayerName) setPlayerName(savedPlayerName);
        if (savedPlayerMoney) setPlayerMoney(parseInt(savedPlayerMoney));
        if (savedPlayerStats) setPlayerStats(JSON.parse(savedPlayerStats));
        if (savedCharacterId && characterAvatars[savedCharacterId]) {
            setPlayerAvatarSrc(characterAvatars[savedCharacterId]);
        }

        // --- Event Listeners for updates from mapScript.js ---
        const handleUpdateStatus = (event) => {
            const { type, value } = event.detail;
            setPlayerStats(prevStats => {
                const newStats = { ...prevStats };
                if (newStats[type]) {
                    // Ensure stat doesn't go below 0 or above max
                    newStats[type].currentStat = Math.max(0, Math.min(newStats[type].max, value));
                }
                localStorage.setItem("playerStats", JSON.stringify(newStats)); // Persist immediately
                return newStats;
            });
        };

        const handleUpdateMoney = (event) => {
            const { value } = event.detail;
            setPlayerMoney(value);
            localStorage.setItem("playerMoney", value.toString()); // Persist immediately
        };

        const handleUpdateClock = (event) => {
            const { time, day } = event.detail;
            setCurrentTime(time);
            setCurrentDay(day);
        };

        const handleUpdateGreeting = (event) => {
            const { message } = event.detail;
            setGreeting(message);
        };

        const handleUpdatePlayerAvatar = (event) => {
            const { characterId } = event.detail;
            if (characterAvatars[characterId]) {
                setPlayerAvatarSrc(characterAvatars[characterId]);
            }
        };

        window.addEventListener("updatePlayerStatus", handleUpdateStatus);
        window.addEventListener("updatePlayerMoney", handleUpdateMoney);
        window.addEventListener("updateClock", handleUpdateClock);
        window.addEventListener("updateGreeting", handleUpdateGreeting);
        window.addEventListener("updatePlayerAvatar", handleUpdatePlayerAvatar);


        return () => {
            window.removeEventListener("updatePlayerStatus", handleUpdateStatus);
            window.removeEventListener("updatePlayerMoney", handleUpdateMoney);
            window.removeEventListener("updateClock", handleUpdateClock);
            window.removeEventListener("updateGreeting", handleUpdateGreeting);
            window.removeEventListener("updatePlayerAvatar", handleUpdatePlayerAvatar);
        };
    }, []);

    // Function to determine the color of the status bar fill
    const getStatusColor = (current, max) => {
        const percentage = (current / max) * 100;
        if (percentage > 70) return '#4CAF50'; // Green
        if (percentage > 40) return '#FFEB3B'; // Yellow
        return '#F44336'; // Red
    };

    return (
        <>
            <div id="statusGUI" className="status-gui">
                <div className="clock">
                    <img src={ClockIcon} alt="Clock" />
                    <div className="time">{currentTime}</div>
                    <div className="day">{currentDay}</div>
                </div>

                <div id="greeting" className="greeting">{greeting}</div>

                <div className="avatar-section">
                    <div className="avatar-stack">
                        <img src={AvatarBack} className="avatar-ring back" alt="Avatar Back Ring" />
                        <div className="avatar-mask">
                            {/* Player avatar will be rendered here dynamically */}
                            <img id="playerAvatar" src={playerAvatarSrc} className="avatar-core" alt="Player Avatar" />
                        </div>
                        <img src={AvatarFront} className="avatar-ring front" alt="Avatar Front Ring" />
                    </div>

                    <div className="name-money-container">
                        <div id="playerNameDisplay" className="name-box">{playerName}</div>
                        <div className="money-box">
                            <img src={CoinIcon} className="coin-icon" alt="Coin Icon" />
                            <span id="moneyDisplay" className="money-text">{playerMoney.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Status Bars */}
                {Object.entries(playerStats).map(([statName, stat]) => (
                    <div className={`status-bar status-bar-${statName}`} key={statName}>
                        <div className="bar-container">
                            <div className="floating-text-container"></div>
                            <div className="bar-bg"></div> {/* This will need a background image in CSS */}
                            <img
                                src={
                                    statName === 'health' ? HealthIcon :
                                    statName === 'food' ? FoodIcon :
                                    statName === 'stamina' ? StaminaIcon :
                                    statName === 'happiness' ? HappinessIcon :
                                    HygieneIcon // Default for hygiene
                                }
                                className="status-icon"
                                alt={`${statName} Icon`}
                            />
                            <div
                                className={`bar-fill status-bar-${statName}`}
                                style={{
                                    width: `${(stat.currentStat / stat.max) * 100}%`,
                                    backgroundColor: getStatusColor(stat.currentStat, stat.max),
                                }}
                            ></div>
                            <div className="stat-text" id={`${statName}Text`}>{stat.currentStat}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Medieval Joystick (if this is part of the persistent UI, otherwise move it to GameMap) */}
            <div className="medieval-joystick">
                <button className="arrow up" data-key="ArrowUp">▲</button>
                <div className="middle-row">
                    <button className="arrow left" data-key="ArrowLeft">◄</button>
                    <button className="arrow right" data-key="ArrowRight">►</button>
                </div>
                <button className="arrow down" data-key="ArrowDown">▼</button>
            </div>

            {/* Popup Box and Overlay (if they are global UI elements) */}
            {/* These might be better handled as separate components or within GameMap for context-specific popups */}
            <div id="popupBox" style={{display: 'none'}}> {/* Initially hidden, control with state */}
                <p id="popupText"></p>
            </div>

            <div id="overlay" style={{display: 'none'}}></div> {/* Initially hidden, control with state */}
        </>
    );
}

export default StatusGUI;