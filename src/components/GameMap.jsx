// src/components/GameMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusGUI from "./StatusGUI"; // Import the React StatusGUI component
import "../App.css"; // Ensure App.css is imported for styling

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

    // Set mapNum attribute for mapScript.js to read
    canvas.setAttribute("mapNum", mapNum);

    // Dynamically load mapScript.js
    const script = document.createElement("script");
    script.src = "/src/mapScript.js"; // Adjust path if mapScript.js is elsewhere
    script.onload = () => {
      // Ensure mapScript.js is loaded and has initialized the game
      console.log(`mapScript.js loaded for map ${mapNum}`);
      // You might need to call an initialization function from mapScript.js here
      // if it doesn't automatically start when loaded.
      // For now, let's assume it initializes on script load.
    };
    document.body.appendChild(script);

    // Clean up script on component unmount
    return () => {
      document.body.removeChild(script);
      // Potentially clean up game state or event listeners from mapScript.js here
    };
  }, [mapNum]);

  // Handle map transitions initiated by mapScript.js
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
    // Before navigating, save the current map to localStorage
    localStorage.setItem("previousMap", `/map${mapNum}.html`); // Save current map before moving
    navigate(`/${dialogTargetMap}`); // Navigate to the next map
  };

  const handleNo = () => {
    setShowDialog(false);
    // If "No", the player stays on the current map.
    // The game logic in mapScript.js should resume here if it was paused.
  };


  return (
    <div id="gameContainer">
      <canvas id="gameCanvas" ref={canvasRef}></canvas>
      <div id="status-container">
        {/* StatusGUI component will render here */}
        <StatusGUI />
      </div>

      {showDialog && (
        <div id="mapTransitionDialog" className={showDialog ? "" : "hidden"}>
          <div className="dialog-content">
            <p>Do you want to move to the next map?</p>
            <button id="yesButton" onClick={handleYes}>Yes</button>
            <button id="noButton" onClick={handleNo}>No</button>
          </div>
        </div>
      )}

      {/* Styles for dialog (can be moved to App.css) */}
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