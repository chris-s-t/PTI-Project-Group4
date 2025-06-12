import React from "react";
import "./../styles/TeleportPopup.css"; // ⬅️ CSS untuk styling board

export default function TeleportPopup({ visible, onConfirm, onCancel }) {
  if (!visible) return null;

  return (
    <div className="popup">
      <div className="popup-board" style={{ backgroundImage: `url("/Assets/GUI/UI_board_Medium_parchment.png")` }}>
        <p className="popup-text">Mau pindah?</p>
        <div className="popup-buttons">
          <button onClick={onConfirm}>Ya</button>
          <button onClick={onCancel}>Tidak</button>
        </div>
      </div>
    </div>
  );
}