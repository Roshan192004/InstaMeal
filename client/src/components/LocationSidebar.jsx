import React, { useState } from 'react';
import './LocationSidebar.css';

const LocationSidebar = ({ isOpen, onClose, onSelectAddress }) => {
  const [isFetching, setIsFetching] = useState(false);

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsFetching(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            onSelectAddress({ 
              type: "CURRENT", 
              addr: data.display_name 
            });
          } else {
            // Fallback to coordinates if no address found
            onSelectAddress({ 
              type: "CURRENT", 
              addr: `Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}` 
            });
          }
          onClose();
        } catch (error) {
          console.error("Error fetching address:", error);
          alert("Error fetching accurate address. Please try again.");
        } finally {
          setIsFetching(false);
        }
      }, (error) => {
        setIsFetching(false);
        alert("Unable to retrieve your location. Please check your browser permissions.");
      });
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="location-sidebar-overlay" onClick={onClose}>
      <div className="location-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header">
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#3d4152" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="sidebar-content">
          {/* Search Box */}
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search for area, street name.." 
              className="location-search-input"
            />
          </div>

          {/* Current Location */}
          <div 
            className={`current-location-box ${isFetching ? 'fetching' : ''}`} 
            onClick={!isFetching ? handleGetCurrentLocation : null}
          >
            <div className="gps-icon">
              {isFetching ? (
                <div className="loader-mini"></div>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="22" y1="12" x2="18" y2="12"></line>
                  <line x1="6" y1="12" x2="2" y2="12"></line>
                  <line x1="12" y1="6" x2="12" y2="2"></line>
                  <line x1="12" y1="22" x2="12" y2="18"></line>
                </svg>
              )}
            </div>
            <div className="current-location-text">
              <div className="cl-title">{isFetching ? 'Fetching accurate address...' : 'Get current location'}</div>
              <div className="cl-subtitle">Using GPS</div>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="saved-addresses-section">
            <div className="section-title">SAVED ADDRESSES</div>
            
            <div 
              className="address-item" 
              onClick={() => {
                onSelectAddress({ type: "HOME", addr: "near embassy apartment, Khajurla, Punjab 144411, India" });
                onClose();
              }}
            >
              <div className="addr-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#282c3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div className="addr-details">
                <div className="addr-name">Home</div>
                <div className="addr-full">near embassy apartment, Khajurla, Punjab 144411, India</div>
              </div>
            </div>

            <div className="addr-separator"></div>

            <div 
              className="address-item"
              onClick={() => {
                onSelectAddress({ type: "FRIENDS", addr: "148, Raju Enclave, Sector 15 Dwarka, Kakrola, Delhi, India" });
                onClose();
              }}
            >
              <div className="addr-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#282c3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className="addr-details">
                <div className="addr-name">Friends And Family</div>
                <div className="addr-full">148, Raju Enclave, Sector 15 Dwarka, Kakrola, Delhi, India</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSidebar;
