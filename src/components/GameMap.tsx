import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusGUI from "./StatusGUI";
import "../styles/App.css";
import "../styles/gameCanvas.css";

declare global {
  interface Window {
    initGameMap: (
      canvas: HTMLCanvasElement,
      mapNum: string,
      playerStats: any,
      characterId: string,
      previousMap: string
    ) => Promise<void>;
    cleanupGameMap?: () => void;
  }
}

function GameMap({ mapNum }) {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogTargetMap, setDialogTargetMap] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas element not found in DOM.");
      return;
    }

    console.log("Canvas found. Attempting to load mapScript.js.");

    const script = document.createElement("script");
    script.src = "/mapScript.js";
    script.type = "module";
    script.async = true;

    const waitForInitGameMap = () => {
      if (window.initGameMap) {
        const playerStats = JSON.parse(localStorage.getItem("playerStats") || "{}");
        const characterId = localStorage.getItem("characterId") || "Noble Man";
        const previousMap = localStorage.getItem("previousMap") || "map1.html";

        window
          .initGameMap(canvas, String(mapNum), playerStats, characterId, previousMap)
          .then(() => console.log("✅ initGameMap finished successfully."))
          .catch((error) =>
            console.error("❌ initGameMap encountered an error:", error)
          );
      } else {
        console.log("⏳ Waiting for initGameMap to be defined...");
        setTimeout(waitForInitGameMap, 50); // check again after 50ms
      }
    };

    script.onload = () => {
      console.log("✅ mapScript.js loaded.");
      waitForInitGameMap();
    };

    script.onerror = (e) => {
      console.error("❌ Failed to load mapScript.js:", e);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (window.cleanupGameMap) {
        window.cleanupGameMap();
      }
    };
  }, [mapNum, navigate]);

  useEffect(() => {
    const handleMapTransitionRequest = (event) => {
      const { nextMap } = event.detail;
      setDialogTargetMap(nextMap);
      setShowDialog(true);
    };

    window.addEventListener("showMapTransitionDialog", handleMapTransitionRequest);

    return () => {
      window.removeEventListener("showMapTransitionDialog", handleMapTransitionRequest);
    };
  }, []);

  const handleYes = () => {
    setShowDialog(false);
    localStorage.setItem("previousMap", `/map${mapNum}.html`);
    navigate(`/${dialogTargetMap}`);
  };

  const handleNo = () => {
    setShowDialog(false);
  };

  return (
    <div id="gameContainer">
      <canvas id="gameCanvas" ref={canvasRef} width="800" height="736"></canvas>
      <div id="status-container">
        <StatusGUI />
      </div>

      {showDialog && (
        <div id="mapTransitionDialog" className={showDialog ? "" : "hidden"}>
          <div className="dialog-content">
            <p>Do you want to move to the next map?</p>
            <button id="yesButton" onClick={handleYes}>
              Yes
            </button>
            <button id="noButton" onClick={handleNo}>
              No
            </button>
          </div>
        </div>
      )}

      <style>{`
        #mapTransitionDialog {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        #mapTransitionDialog.hidden {
          display: none;
        }

        .dialog-content {
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          color: black;
        }

        .dialog-content button {
          margin: 10px;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        #yesButton {
          background-color: green;
          color: white;
        }

        #noButton {
          background-color: red;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default GameMap;