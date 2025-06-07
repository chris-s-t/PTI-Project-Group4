import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusGUI from "./StatusGUI"; // Import the React StatusGUI component
import "../App.css"; // Ensure App.css is imported for styling

declare global {
  interface Window {
    initGameMap: (
      canvas: HTMLCanvasElement,
      mapNum: string,
      playerStats: any,
      characterId: string,
      previousMap: string
    ) => void;
    cleanupGameMap?: () => void;
  }
}

function GameMap({ mapNum }) {
  const canvasRef = useRef(null);
  const statusContainerRef = useRef(null);
  const mapTransitionDialogRef = useRef(null);
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogTargetMap, setDialogTargetMap] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const script = document.createElement("script");
    script.src = "/src/mapScript.js";
    script.onload = () => {
      console.log(`mapScript.js loaded for map ${mapNum}`);

      if (window.initGameMap) {
        const playerStats = JSON.parse(
          localStorage.getItem("playerStats") || "{}"
        );
        const characterId = localStorage.getItem("characterId") || "";
        const previousMap = localStorage.getItem("previousMap") || "map1.html";

        window.initGameMap(
          canvas,
          String(mapNum),
          playerStats,
          characterId,
          previousMap
        );
      } else {
        console.warn(
          "initGameMap function not found in mapScript.js after loading."
        );
      }
    };
    script.onerror = (e) => {
      console.error("Failed to load mapScript.js:", e);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (window.cleanupGameMap) {
        window.cleanupGameMap();
      }
    };
  }, [mapNum]);

  // Handle map transitions initiated by mapScript.js
  useEffect(() => {
    const handleMapTransitionRequest = (event) => {
      const { nextMap } = event.detail;
      setDialogTargetMap(nextMap);
      setShowDialog(true);
    };

    window.addEventListener(
      "showMapTransitionDialog",
      handleMapTransitionRequest
    );

    return () => {
      window.removeEventListener(
        "showMapTransitionDialog",
        handleMapTransitionRequest
      );
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
      <canvas id="gameCanvas" ref={canvasRef}></canvas>
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
          color: black; /* Ensure text is visible against white background */
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
