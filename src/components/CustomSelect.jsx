import React, { useState, useRef, useEffect } from "react";

export default function CustomSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((opt) => opt.value === value);

  return (
      <div className="custom-select" ref={ref}>
        <div
            className="custom-select__control"
            onClick={() => setOpen(!open)}
        >
          {selected ? selected.label : placeholder}
          <span className="custom-select__arrow">▾</span>
        </div>

        {open && (
            <div className="custom-select__menu">
              {options.map((opt) => (
                  <div
                      key={opt.value}
                      className={`custom-select__option ${
                          opt.value === value ? "selected" : ""
                      }`}
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                  >
                    {opt.label}
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}
