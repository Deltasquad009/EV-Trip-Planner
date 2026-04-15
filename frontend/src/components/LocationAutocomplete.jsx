import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function LocationAutocomplete({
  name,
  value,
  onChange,
  onSelect,
  placeholder,
  required,
  style,
  disabled
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    // Close dropdown on outside click
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2 && showDropdown) {
        setLoading(true);
        try {
          const res = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
              q: query,
              format: "json",
              limit: 5,
              addressdetails: 1,
              countrycodes: "IN"
            },
            headers: { "Accept-Language": "en" }
          });
          setSuggestions(res.data);
        } catch (err) {
          console.error("Autocomplete fetch error", err);
        } finally {
          setLoading(false);
        }
      } else if (query.length <= 2) {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, value, showDropdown]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(true);
    // Let parent know the value changed manually (to validate or keep state in sync)
    if (onChange) onChange(e);
  };

  const handleOptionSelect = (suggestion) => {
    const displayName = suggestion.display_name;
    setQuery(displayName);
    setSuggestions([]);
    setShowDropdown(false);

    // Call custom onSelect if provided, otherwise pass mock event to generic handler
    if (onSelect) {
      onSelect(displayName);
    } else if (onChange) {
      onChange({ target: { name, value: displayName } });
    }
  };

  return (
    <div ref={wrapperRef} style={{ ...styles.wrapper, ...(style?.wrapper || {}) }}>
      <input
        type="text"
        name={name}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{ ...styles.input, ...(style?.input || {}) }}
        autoComplete="off"
      />
      {loading && (
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinner} />
        </div>
      )}
      {showDropdown && suggestions.length > 0 && (
        <ul style={styles.dropdown}>
          {suggestions.map((item, index) => (
            <li
              key={index}
              style={styles.dropdownItem}
              onClick={() => handleOptionSelect(item)}
            >
              <div style={styles.dropdownItemPrimary}>{item.display_name.split(',')[0]}</div>
              <div style={styles.dropdownItemSecondary}>{item.display_name.substring(item.display_name.indexOf(',') + 1).trim()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    width: "100%",
  },
  input: {
    width: "100%",
  },
  spinnerWrapper: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center"
  },
  spinner: {
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    width: "100%",
    backgroundColor: "#1A1A1A",
    border: "1px solid #333",
    borderTop: "none",
    borderRadius: "0 0 8px 8px",
    marginTop: 0,
    padding: 0,
    listStyle: "none",
    zIndex: 1000,
    maxHeight: "250px",
    overflowY: "auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  },
  dropdownItem: {
    padding: "10px 14px",
    borderBottom: "1px solid #2A2A2A",
    cursor: "pointer",
    transition: "background 0.2s ease",
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  dropdownItemPrimary: {
    fontSize: "0.9rem",
    color: "#FFFFFF",
    fontWeight: 500
  },
  dropdownItemSecondary: {
    fontSize: "0.75rem",
    color: "#9CA3AF"
  }
};
