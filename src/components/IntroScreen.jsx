import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/intro.css";

function IntroScreen() {
  const [clickEnabled, setClickEnabled] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setClickEnabled(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleIntroClick = () => {
    if (!clickEnabled) return;

    setIsFadingOut(true);

    setTimeout(() => {
      navigate("/menu");
    }, 1000);
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