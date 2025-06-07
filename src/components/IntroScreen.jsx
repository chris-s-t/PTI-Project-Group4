import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"; // Ensure App.css is imported for styling

function IntroScreen({ setShowIntro }) {
  const [clickEnabled, setClickEnabled] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const navigate = useNavigate();

  // Enable click after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setClickEnabled(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleIntroClick = () => {
    if (!clickEnabled) return;

    setIsFadingOut(true); // Start fade-out animation

    setTimeout(() => {
      setShowIntro(false); // This prop might not be strictly needed if using router, but good for clarity
      navigate("/menu"); // Navigate to the main menu
    }, 1000); // Same as CSS transition duration
  };

  return (
    <div
      id="intro-screen"
      className={`intro ${isFadingOut ? "fade-out" : "fade-in"}`}
      onClick={handleIntroClick}
    >
      <div className="intro-content">
        <h1 className="intro-title">Petualangan Abad Pertengahan</h1>
        <p
          className="click-to-begin"
          id="clickToBegin"
          style={{
            pointerEvents: clickEnabled ? "auto" : "none",
            opacity: clickEnabled ? 1 : 0,
            transition: "opacity 1s",
          }}
        >
          Click to Begin
        </p>
      </div>
    </div>
  );
}

export default IntroScreen;