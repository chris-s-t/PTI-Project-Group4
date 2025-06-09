import React, { useState, useEffect } from 'react';
import '../statusGUI.css';

import ClockIcon from '/Assets/StatusGUI/Clock.png';
import AvatarBack from '/Assets/StatusGUI/avatarBack.png';
import AvatarFront from '/Assets/StatusGUI/avatarFront.png';
import CoinIcon from '/Assets/StatusGUI/Icon.png';
import HealthIcon from '/Assets/StatusGUI/healthIcon.png';
import FoodIcon from '/Assets/StatusGUI/foodIcon.png';
import StaminaIcon from '/Assets/StatusGUI/staminaIcon.png';
import HappinessIcon from '/Assets/StatusGUI/happyIcon.png';
import HygieneIcon from '/Assets/StatusGUI/hygieneIcon.png';
import nobleManImg from "/Assets/Avatars/MiniNobleManCrop.png";
import nobleWomanImg from "/Assets/Avatars/MiniNobleWomanCrop.png";
import oldManImg from "/Assets/Avatars/MiniOldManCrop.png";
import peasantImg from "/Assets/Avatars/MiniPeasantCrop.png";
import princessImg from "/Assets/Avatars/MiniPrincessCrop.png";
import queenImg from "/Assets/Avatars/MiniQueenCrop.png";

const characterAvatars = {
  "Noble Man": nobleManImg,
  "Noble Woman": nobleWomanImg,
  "Old Man": oldManImg,
  "Peasant": peasantImg,
  "Princess": princessImg,
  "Queen": queenImg,
};

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
    });

    useEffect(() => {
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
                    newStats[type].currentStat = Math.max(0, Math.min(newStats[type].max, value));
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

    const getStatusColor = (current, max) => {
        const percentage = (current / max) * 100;
        if (percentage > 70) return '#4CAF50';
        if (percentage > 40) return '#FFEB3B';
        return '#F44336';
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

                {Object.entries(playerStats).map(([statName, stat]) => (
                    <div className={`status-bar status-bar-${statName}`} key={statName}>
                        <div className="bar-container">
                            <div className="floating-text-container"></div>
                            <div className="bar-bg"></div> 
                            <img
                                src={
                                    statName === 'health' ? HealthIcon :
                                    statName === 'food' ? FoodIcon :
                                    statName === 'stamina' ? StaminaIcon :
                                    statName === 'happiness' ? HappinessIcon :
                                    HygieneIcon
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

            <div className="medieval-joystick">
                <button className="arrow up" data-key="ArrowUp">▲</button>
                <div className="middle-row">
                    <button className="arrow left" data-key="ArrowLeft">◄</button>
                    <button className="arrow right" data-key="ArrowRight">►</button>
                </div>
                <button className="arrow down" data-key="ArrowDown">▼</button>
            </div>

            <div id="popupBox" style={{display: 'none'}}>
                <p id="popupText"></p>
            </div>

            <div id="overlay" style={{display: 'none'}}></div>
        </>
    );
}

export default StatusGUI;