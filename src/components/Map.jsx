import React from "react";
import "../style.css";

const REGIONS = [
  { name: "Север", top: "10%", left: "50%" },
  { name: "Юг", top: "75%", left: "50%" },
  { name: "Запад", top: "45%", left: "20%" },
  { name: "Восток", top: "45%", left: "80%" },
  { name: "Центр", top: "45%", left: "50%" },
  { name: "Северо-Запад", top: "20%", left: "30%" },
  { name: "Северо-Восток", top: "20%", left: "70%" },
  { name: "Юго-Запад", top: "70%", left: "30%" },
  { name: "Юго-Восток", top: "70%", left: "70%" },
];

export default function Map({ onSelect }) {
  return (
      <div className="map">
        <img
            src="/assets/images/Kontyrnaya_karta_Evraziya.jpg"
            alt="Карта Евразии"
            className="map-image"
        />
        {REGIONS.map((region) => (
            <button
                key={region.name}
                className="region-button"
                style={{ top: region.top, left: region.left }}
                onClick={() => onSelect(region.name)}
            >
              {region.name}
            </button>
        ))}
      </div>
  );
}
