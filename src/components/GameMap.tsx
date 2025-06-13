import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
      previousMap: string,
      options?: { spawnX?: number; spawnY?: number }
    ) => Promise<void>;
    cleanupGameMap?: () => void;
  }
}

function GameMap({ mapNum }) {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogTargetMap, setDialogTargetMap] = useState("");
  const [spawnX, setSpawnX] = useState<number | null>(null);
  const [spawnY, setSpawnY] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas element not found in DOM.");
      return;
    }

    // Baca koordinat manual dari URL
    const query = new URLSearchParams(location.search);
    const xParam = query.get("x");
    const yParam = query.get("y");
    const spawnX = xParam !== null ? parseInt(xParam) : null;
    const spawnY = yParam !== null ? parseInt(yParam) : null;
    const script = document.createElement("script");
    script.src = "/mapScript.js";
    script.type = "module";
    script.async = true;

    const waitForInitGameMap = () => {
      if (window.initGameMap) {
        const playerStats = JSON.parse(localStorage.getItem("playerStats") || "{}");
        const characterId = localStorage.getItem("characterId") || "Noble Man";
        const previousMap = localStorage.getItem("previousMap") || `map${mapNum}`;

        window
          .initGameMap(canvas, String(mapNum), playerStats, characterId, previousMap, {
            spawnX: spawnX ?? undefined,
            spawnY: spawnY ?? undefined
          })
          .then(() => console.log("✅ initGameMap finished successfully."))
          .catch((error) =>
            console.error("❌ initGameMap encountered an error:", error)
          );
      } else {
        setTimeout(waitForInitGameMap, 50);
      }
    };

    script.onload = waitForInitGameMap;
    script.onerror = (e) => console.error("❌ Failed to load mapScript.js:", e);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (window.cleanupGameMap) {
        window.cleanupGameMap();
      }
    };
  }, [mapNum, location]);

  useEffect(() => {
    const handleMapTransitionRequest = (event) => {
      const { nextMap, spawnX, spawnY } = event.detail;
      setDialogTargetMap(nextMap);
      setSpawnX(spawnX ?? null);
      setSpawnY(spawnY ?? null);
      setShowDialog(true);
    };

    window.addEventListener("showMapTransitionDialog", handleMapTransitionRequest);

    return () => {
      window.removeEventListener("showMapTransitionDialog", handleMapTransitionRequest);
    };
  }, []);

  const handleYes = () => {
    setShowDialog(false);
    if (dialogTargetMap && spawnX !== null && spawnY !== null) {
      navigate(`/map${dialogTargetMap}?x=${spawnX}&y=${spawnY}`);
    }
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
        <div id="mapTransitionDialog">
          <div className="dialog-content" style={{
            backgroundImage: `url("/Assets/GUI/UI_board_Medium_parchment.png")`,
            backgroundSize: "cover",
            backgroundColor: 'transparent'
          }}>
            <p>Mau pindah ke map berikutnya?</p>
            <button id="yesButton" onClick={handleYes}>Ya</button>
            <button id="noButton" onClick={handleNo}>Tidak</button>
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

        .dialog-content {
          width: 300px;
          height: 200px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          text-align: center;
          border-radius: 10px;
          color: black;
        }

        .dialog-content p {
          font-size: 20px;
          margin-bottom: 20px;
        }

        .dialog-content button {
          margin: 10px;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
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