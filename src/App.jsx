// src/App.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ---------- Radar Loading Component ----------
const RadarLoading = () => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(10px)'
  }}>
    {/* Radar Container */}
    <div style={{
      position: 'relative',
      width: '150px',
      height: '150px',
      marginBottom: '20px'
    }}>
      {/* Radar Circle */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '140px',
        height: '140px',
        border: '2px solid rgba(102, 126, 234, 0.8)',
        borderRadius: '50%',
        boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)'
      }}></div>
      
      {/* Radar Grid Lines */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100px',
        height: '100px',
        border: '1px solid rgba(102, 126, 234, 0.6)',
        borderRadius: '50%'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50px',
        height: '50px',
        border: '1px solid rgba(102, 126, 234, 0.4)',
        borderRadius: '50%'
      }}></div>
      
      {/* Cross Lines */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '140px',
        height: '1px',
        background: 'rgba(102, 126, 234, 0.4)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(90deg)',
        width: '140px',
        height: '1px',
        background: 'rgba(102, 126, 234, 0.4)'
      }}></div>
      
      {/* Radar Sweep */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '70px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent,rgb(102, 214, 234))',
        transformOrigin: 'left center',
        animation: 'radarSweep 2s linear infinite',
        filter: 'drop-shadow(0 0 8px #667eea)'
      }}></div>
      
      {/* Center Dot */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '10px',
        height: '10px',
        background: '#667eea',
        borderRadius: '50%',
        boxShadow: '0 0 15px #667eea'
      }}></div>
      
      {/* Scanning Dots */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '45%',
        width: '6px',
        height: '6px',
        background: '#43e97b',
        borderRadius: '50%',
        animation: 'pulse 2s ease-in-out infinite',
        boxShadow: '0 0 10px #43e97b'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '75%',
        width: '5px',
        height: '5px',
        background: '#fa709a',
        borderRadius: '50%',
        animation: 'pulse 2s ease-in-out infinite 0.5s',
        boxShadow: '0 0 8px #fa709a'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '25%',
        width: '5px',
        height: '5px',
        background: '#4facfe',
        borderRadius: '50%',
        animation: 'pulse 2s ease-in-out infinite 1s',
        boxShadow: '0 0 8px #4facfe'
      }}></div>
    </div>
    
    {/* Loading Text */}
    <div style={{
      color: 'white',
      fontSize: '16px',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: '8px',
      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
      padding: '0 20px'
    }}>
      Scanning the Area...
    </div>
    
    <div style={{
      color: 'rgba(255,255,255,0.8)',
      fontSize: '12px',
      textAlign: 'center',
      maxWidth: '280px',
      lineHeight: '1.4',
      padding: '0 20px',
      marginBottom: '15px'
    }}>
      AI is analyzing locations and creating your personalized travel itinerary
    </div>
    
    {/* Progress Bar */}
    <div style={{
      width: '200px',
      height: '3px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '2px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, #667eea, #764ba2)',
        borderRadius: '2px',
        animation: 'progressBar 2s ease-in-out infinite'
      }}></div>
    </div>
  </div>
);

// ---------- Mobile Bottom Sheet ----------
const MobileBottomSheet = ({ 
  isOpen, 
  onToggle, 
  children, 
  currentDays, 
  selectedDay, 
  onDaySelect,
  hasData 
}) => {
  const [sheetHeight, setSheetHeight] = useState('40vh');
  
  const toggleSheet = () => {
    if (isOpen) {
      setSheetHeight('40vh');
      setTimeout(() => onToggle(), 300);
    } else {
      onToggle();
      setTimeout(() => setSheetHeight('80vh'), 50);
    }
  };

  if (!isOpen && !hasData) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: isOpen ? sheetHeight : '60px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
      boxShadow: '0 -10px 30px rgba(0,0,0,0.3)',
      zIndex: 1001,
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Drag Handle */}
      <div 
        onClick={toggleSheet}
        style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid rgba(255,255,255,0.1)' : 'none'
        }}
      >
        <div style={{
          width: '40px',
          height: '4px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
          transition: 'all 0.3s ease'
        }}></div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: isOpen ? '16px' : '0',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}>
        {isOpen ? children : (
          <div style={{
            padding: '0 20px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>🌟</span>
            Tap to view itinerary
          </div>
        )}
      </div>

      {/* Day Tabs for Mobile */}
      {isOpen && currentDays.length > 0 && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.05)',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '5px'
          }}>
            {currentDays.map((day, index) => (
              <button
                key={index}
                onClick={() => onDaySelect(index)}
                style={{
                  flex: '0 0 auto',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: selectedDay === index 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'rgba(255,255,255,0.1)',
                  color: selectedDay === index ? 'white' : 'rgba(255,255,255,0.9)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
              >
                {day.day || `Day ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Custom Icon Generator ----------
const createCustomIcon = (dayIndex, activityType = '') => {
  const colors = [
    'linear-gradient(135deg, rgb(45, 128, 211) 0%, rgb(45, 128, 211) 100%)',
    'linear-gradient(135deg, rgb(45, 128, 211) 0%, #f5576c 100%)',
    'linear-gradient(135deg, rgb(45, 128, 211) 0%, rgb(45, 128, 211) 100%)',
    'linear-gradient(135deg, #43e97b 0%, rgb(45, 128, 211) 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  ];
  
  const getActivityEmoji = (type) => {
    if (!type) return '📍';
    const t = type.toLowerCase();
    if (t.includes('food') || t.includes('restaurant') || t.includes('eat')) return '🍽️';
    if (t.includes('hotel') || t.includes('sleep') || t.includes('stay')) return '🏨';
    if (t.includes('culture') || t.includes('museum') || t.includes('historical')) return '🏛️';
    if (t.includes('park') || t.includes('garden') || t.includes('nature')) return '🌳';
    if (t.includes('shop') || t.includes('bazaar') || t.includes('market')) return '🛍️';
    return '📍';
  };

  const color = colors[dayIndex % colors.length];
  const emoji = getActivityEmoji(activityType);

  return L.divIcon({
    html: `<div style="
            background: ${color};
            width: 48px;
            height: 48px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            border: 2px solid white;
            position: relative;
            transition: all 0.3s ease;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 20px;
              filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3))
            ">${emoji}</span>
          </div>`,
    className: 'custom-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
  });
};

// ---------- Enhanced Popup Component ----------
const EnhancedPopup = ({ marker, onGetDirections }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div style={{
      minWidth: '280px',
      borderRadius: '16px',
      overflow: 'hidden',
      background: 'white',
      boxShadow: '0 15px 30px rgba(0,0,0,0.15)'
    }}>
      {/* Image Section */}
      {marker.image_url && !imageError && (
        <div style={{
          height: '120px',
          overflow: 'hidden'
        }}>
          <img 
            src={marker.image_url} 
            alt={marker.activity}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        </div>
      )}
      
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, rgb(45, 128, 211) 100%)',
        padding: '16px',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50px',
          height: '50px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '0 0 0 100%'
        }}></div>
        <h4 style={{ 
          margin: '0 0 6px 0', 
          fontSize: '16px', 
          fontWeight: '700',
          lineHeight: '1.3'
        }}>
          {marker.activity || 'Activity'}
        </h4>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          fontSize: '13px',
          opacity: 0.9,
          flexWrap: 'wrap'
        }}>
          <span>📅 {marker.day}</span>
          <span>•</span>
          <span>📍 {marker.location}</span>
        </div>
      </div>
      
      <div style={{ padding: '16px' }}>
        <div style={{
          marginBottom: '10px',
          fontWeight: '600',
          color: '#2d3436',
          fontSize: '14px'
        }}>
          <span style={{ fontSize: '16px' }}>📝</span> Description
        </div>
        
        {marker.description && (
          <div style={{
            padding: '10px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '8px',
            marginBottom: '12px',
            fontSize: '13px',
            color: '#636e72',
            lineHeight: 1.4
          }}>
            {marker.description}
          </div>
        )}
        
        {marker.source_url && (
          <div style={{
            marginBottom: '12px',
            fontSize: '12px',
            opacity: 0.7
          }}>
            <a 
              href={marker.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: '#667eea',
                textDecoration: 'none'
              }}
            >
              🔗 More information
            </a>
          </div>
        )}
        
        <button 
          onClick={() => onGetDirections(marker)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 15px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '16px' }}>🗺️</span>
          Get Directions
        </button>
      </div>
    </div>
  );
};

// ---------- Day Selection Tabs ----------
const DayTabs = ({ days, selectedDay, onDaySelect }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '6px',
      borderRadius: '14px'
    }}>
      {days.map((day, index) => (
        <button
          key={index}
          onClick={() => onDaySelect(index)}
          style={{
            flex: 1,
            padding: '14px 16px',
            borderRadius: '10px',
            border: 'none',
            background: selectedDay === index 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : 'rgba(255,255,255,0.8)',
            color: selectedDay === index ? 'white' : '#2d3436',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: selectedDay === index 
              ? '0 6px 15px rgba(102, 126, 234, 0.3)' 
              : '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          🌟 {day.day || `Day ${index + 1}`}
        </button>
      ))}
    </div>
  );
};

// ---------- Activity Card ----------
const ActivityCard = ({ activity, markerIndex, onFocusMarker, isSelected, isMobile }) => {
  const [imageError, setImageError] = useState(false);
  
  const getActivityIcon = (type) => {
    if (!type) return '📍';
    const t = type.toLowerCase();
    if (t.includes('food') || t.includes('restaurant')) return '🍽️';
    if (t.includes('hotel') || t.includes('sleep')) return '🏨';
    if (t.includes('culture') || t.includes('museum')) return '🏛️';
    if (t.includes('park') || t.includes('nature')) return '🌳';
    if (t.includes('shop') || t.includes('market')) return '🛍️';
    return '📍';
  };

  return (
    <div
      onClick={() => markerIndex >= 0 && onFocusMarker(markerIndex)}
      style={{
        background: isSelected 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        borderRadius: '14px',
        padding: isMobile ? '16px' : '18px',
        marginBottom: '12px',
        cursor: markerIndex >= 0 ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        border: isSelected ? '2px solid rgba(102, 126, 234, 0.3)' : '2px solid transparent',
        boxShadow: isSelected 
          ? '0 8px 20px rgba(102, 126, 234, 0.2)' 
          : '0 3px 10px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(10px)',
        color: isSelected ? 'white' : '#2d3436'
      }}
      onMouseEnter={(e) => {
        if (markerIndex >= 0 && !isSelected && !isMobile) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (markerIndex >= 0 && !isSelected && !isMobile) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)';
        }
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: isMobile ? '12px' : '14px' 
      }}>
        {/* Activity Icon */}
        <div style={{
          background: isSelected 
            ? 'rgba(255,255,255,0.2)' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '10px',
          padding: isMobile ? '10px' : '12px',
          fontSize: isMobile ? '18px' : '20px',
          minWidth: isMobile ? '44px' : '48px',
          textAlign: 'center',
          color: isSelected ? 'white' : 'white'
        }}>
          {getActivityIcon(activity.activity)}
        </div>
        
        {/* Activity Content */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '6px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <h4 style={{ 
              margin: 0, 
              fontSize: isMobile ? '15px' : '16px',
              color: isSelected ? 'white' : '#2d3436',
              lineHeight: '1.3'
            }}>
              {activity.name || activity.activity}
            </h4>
          </div>
          
          <div style={{
            fontSize: isMobile ? '13px' : '14px',
            marginBottom: '6px',
            opacity: isSelected ? 0.9 : 0.8,
            fontWeight: '500'
          }}>
            📍 {activity.location || activity.name}
          </div>
          
          {/* Activity Image */}
          {activity.image_url && !imageError && (
            <div style={{
              marginTop: '8px',
              borderRadius: '8px',
              overflow: 'hidden',
              height: '80px',
              width: '100%'
            }}>
              <img 
                src={activity.image_url} 
                alt={activity.name || activity.activity}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            </div>
          )}
          
          {activity.description && (
            <div style={{
              fontSize: '12px',
              opacity: isSelected ? 0.8 : 0.7,
              lineHeight: 1.4,
              marginTop: '6px',
              fontStyle: 'italic'
            }}>
              {activity.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Mobile Header ----------
const MobileHeader = ({ onToggleMenu, hasData }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 1000,
    boxShadow: '0 2px 20px rgba(0,0,0,0.3)'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        background: 'linear-gradient(135deg, #00f2fe 0%, #00f2fe 100%)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        🌟
      </div>
      <div>
        <div style={{
          color: 'white',
          fontSize: '16px',
          fontWeight: '700'
        }}>
          AI Travel Planner
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '11px'
        }}>
          Your travel companion
        </div>
      </div>
    </div>

    {hasData && (
      <button
        onClick={onToggleMenu}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          backdropFilter: 'blur(10px)'
        }}
      >
        📋
      </button>
    )}
  </div>
);

// ---------- Main App Component ----------
function App() {
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState(1);
  const [preferences, setPreferences] = useState('');
  const [geminiData, setGeminiData] = useState([]);
  const [error, setError] = useState('');
  const [currentCode, setCurrentCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const pollingInterval = useRef(null);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);

  // List of Iraqi Muhafazat (Provinces)
  const iraqiProvinces = [
    "Baghdad", "Basra", "Nineveh", "Erbil", "Kirkuk", "Sulaymaniyah", 
    "Dohuk", "Wasit", "Najaf", "Karbala", "Babil", "Diyala", 
    "Maysan", "Dhi Qar", "Al-Qadisiyyah", "Muthanna", "Anbar", "Saladin"
  ];

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Transform new API response to old format
  const transformApiResponse = (data) => {
    if (!data) return [];
    
    // If data is already in the old format, return as is
    if (Array.isArray(data) && data[0]?.days) {
      return data;
    }
    
    // Transform new format to old format
    const days = Object.keys(data).map(dayKey => {
      const activities = data[dayKey];
      return {
        day: dayKey,
        rows: activities.map(activity => ({
          activity: activity.name,
          name: activity.name,
          location: activity.name,
          latitude: activity.latitude,
          longitude: activity.longitude,
          image_url: activity.image_url,
          description: activity.description,
          source_url: activity.source_url,
          time: '' // Not provided in new API
        }))
      };
    });
    
    return [{ days }];
  };

  // Fetch existing data
  useEffect(() => {
    const loadPlansAndCoords = async () => {
      try {
        setError('');
        let res = null;
        try {
          res = await api.get('/api/geminidata');
        } catch (e) {
          console.log('Primary API failed, trying fallback...');
          return;
        }

        const plans = res?.data ?? [];
        if (!Array.isArray(plans)) {
          if (plans && typeof plans === 'object') {
            // Transform new API response format
            const transformedData = transformApiResponse(plans);
            setGeminiData(transformedData);
          } else {
            setGeminiData([]);
          }
          return;
        }

        if (plans.length === 0) {
          setGeminiData([]);
          return;
        }

        setGeminiData(plans);
        
      } catch (err) {
        console.error('loadPlansAndCoords error', err);
        setError('Failed to load plans.');
      }
    };

    loadPlansAndCoords();
  }, []);

  const startPolling = (code) => {
    setLoading(true);
    if (pollingInterval.current) clearInterval(pollingInterval.current);

    pollingInterval.current = setInterval(async () => {
      try {
        const res = await api.get(`/api/geminidata/${encodeURIComponent(code)}`);
        const payload = res.data?.data ?? res.data;
        
        if (payload && (Object.keys(payload).length > 0 || payload.days)) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
          setLoading(false);
          
          // Transform the response to the expected format
          const transformedData = transformApiResponse(payload);
          setGeminiData(transformedData);
          setError('');
        }
      } catch (err) {
        console.log('Polling: data not ready yet');
      }
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGeminiData([]);
    setCurrentCode(null);
    setLoading(true);
    setSelectedDay(0);
    if (isMobile) setMobileMenuOpen(false);

    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    try {
      const res = await api.get(`/api/request-travel-plan/${encodeURIComponent(location || '')}/${encodeURIComponent(duration)}`, {
        params: {
          location,
          duration,
          preferences: preferences.split(',').map(p => p.trim())
        }
      });

      const code = res.data?.code_chat ?? res.data?.code ?? null;
      if (!code) {
        setError('No code returned by API.');
        setLoading(false);
        return;
      }
      setCurrentCode(code);
      startPolling(code);
    } catch (err) {
      console.error('request-travel-plan failed', err);
      setError('Failed to send request.');
      setLoading(false);
    }
  };

  const markers = useMemo(() => {
    const list = [];
    markerRefs.current = [];
    if (!geminiData || geminiData.length === 0) return list;

    geminiData.forEach((plan, planIndex) => {
      const pd = plan.data ?? plan;
      const days = pd.days ?? pd;
      if (!Array.isArray(days)) return;
      days.forEach((day, dayIndex) => {
        (day.rows || []).forEach(row => {
          const lat = Number(row.latitude ?? row.lat ?? row.latitutde);
          const lng = Number(row.longitude ?? row.lng ?? row.lon ?? row.long);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
          list.push({
            latitude: lat,
            longitude: lng,
            activity: row.activity ?? row.name ?? row.title ?? '',
            name: row.name ?? row.activity ?? '',
            location: row.location ?? row.name ?? '',
            description: row.description ?? row.notes ?? '',
            image_url: row.image_url,
            source_url: row.source_url,
            time: row.time ?? '',
            day: day.day ?? `Day ${dayIndex + 1}`,
            dayIndex,
            planIndex,
            icon: createCustomIcon(dayIndex, row.activity ?? '')
          });
        });
      });
    });

    return list;
  }, [geminiData]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markers.length === 0) {
      map.setView([36.2, 44.0], 12);
      return;
    }
    const latlngs = markers.map(m => [m.latitude, m.longitude]);
    map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50], maxZoom: 16 });
  }, [markers]);

  const focusMarker = (index) => {
    const map = mapRef.current;
    if (!map || !markers[index]) return;
    const m = markers[index];
    map.setView([m.latitude, m.longitude], 16, { animate: true, duration: 1.5 });
    const layer = markerRefs.current[index];
    if (layer && layer.openPopup) layer.openPopup();
    setSelectedMarker(markers[index]);
    if (isMobile) setMobileMenuOpen(false);
  };

  const handleGetDirections = (marker) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const currentPlan = geminiData[0];
  const currentDays = currentPlan ? (currentPlan.data?.days ?? currentPlan.days ?? []).slice(0, 3) : [];
  const currentDayActivities = currentDays[selectedDay]?.rows || [];
  const hasData = currentDayActivities.length > 0;

  useEffect(() => () => { 
    if (pollingInterval.current) clearInterval(pollingInterval.current); 
  }, []);

  const defaultCenter = [36.2, 44.0];

  // Desktop Sidebar Content
  const DesktopSidebarContent = () => (
    <>
      {/* Header */}
      <div style={{
        padding: '32px 24px 24px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '28px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #00f2fe 0%, #00f2fe 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🌟 AI Travel Planner
        </h1>
        <p style={{
          margin: 0,
          opacity: 0.8,
          fontSize: '0.9em'
        }}>
          Your smart travel companion
        </p>
      </div>

      {/* Form */}
      <div style={{
        padding: '24px',
        background: 'rgba(255,255,255,0.05)',
        margin: '16px',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: location ? 'white' : 'rgba(255,255,255,0.7)',
                fontSize: '0.95em',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: isDropdownOpen ? '2px solid rgba(102, 126, 234, 0.5)' : '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                if (!isDropdownOpen) {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
            >
              <span>
                {location || '📍 Select Muhafaza'}
              </span>
              <span style={{
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                fontSize: '0.8em'
              }}>
                ▼
              </span>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'rgba(26, 26, 46, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                marginTop: '8px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {/* Search Input inside Dropdown */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  position: 'sticky',
                  top: 0,
                  background: 'rgba(26, 26, 46, 0.95)',
                  backdropFilter: 'blur(20px)'
                }}>
                  <input
                    type="text"
                    placeholder="🔍 Search muhafaza..."
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      const filtered = iraqiProvinces.filter(province => 
                        province.toLowerCase().includes(searchTerm)
                      );
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      fontSize: '0.9em'
                    }}
                  />
                </div>

                {/* Province List */}
                <div style={{
                  maxHeight: '250px',
                  overflowY: 'auto'
                }}>
                  {iraqiProvinces.map((province, index) => (
                    <div
                      key={province}
                      onClick={() => {
                        setLocation(province);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: '14px 16px',
                        color: location === province ? '#667eea' : 'rgba(255,255,255,0.9)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        borderBottom: index < iraqiProvinces.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        background: location === province ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontWeight: location === province ? '600' : '400'
                      }}
                      onMouseEnter={(e) => {
                        if (location !== province) {
                          e.target.style.background = 'rgba(255,255,255,0.1)';
                          e.target.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (location !== province) {
                          e.target.style.background = 'transparent';
                          e.target.style.color = 'rgba(255,255,255,0.9)';
                        }
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: location === province 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                          : 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8em',
                        fontWeight: '700'
                      }}>
                        {index + 1}
                      </div>
                      <span>{province}</span>
                      {location === province && (
                        <span style={{ marginLeft: 'auto', fontSize: '1.2em' }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px'
          }}>
            {[1, 2, 3].map((dayCount) => (
              <div
                key={dayCount}
                onClick={() => setDuration(dayCount)}
                style={{
                  flex: 1,
                  padding: '16px 12px',
                  borderRadius: '12px',
                  background: duration === dayCount 
                    ? 'linear-gradient(135deg, rgb(45, 128, 211) 0%, rgb(45, 128, 211) 100%)' 
                    : 'rgba(255,255,255,0.1)',
                  border: duration === dayCount 
                    ? '2px solid rgba(255,255,255,0.3)' 
                    : '2px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  transform: duration === dayCount ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: duration === dayCount 
                    ? '0 8px 20px rgba(102, 126, 234, 0.4)' 
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (duration !== dayCount) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (duration !== dayCount) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }
                }}
              >
                {duration === dayCount && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    animation: 'pulse 2s infinite'
                  }}></div>
                )}
                
                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <div style={{
                    fontSize: '1.4em',
                    fontWeight: '700',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    {dayCount === 1 ? '❶' : dayCount === 2 ? '❷' : '❸'}
                  </div>
                  <div style={{
                    fontSize: '0.9em',
                    fontWeight: '600',
                    opacity: duration === dayCount ? 1 : 0.8
                  }}>
                    {dayCount} {dayCount === 1 ? 'Day' : 'Days'}
                  </div>
                  <div style={{
                    fontSize: '0.75em',
                    opacity: 0.7,
                    fontStyle: 'italic'
                  }}>
                    {dayCount === 1 ? 'Quick trip' : dayCount === 2 ? 'Weekend' : 'Adventure'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            type="submit"
            style={{
              padding: '14px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg,rgb(45, 128, 211) 0%, rgb(45, 128, 211) 100%)',
              color: 'white',
              fontSize: '1em',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px #00f2fe';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚀 Generate Plan
          </button>
        </form>

        {error && (
          <div style={{
            background: 'rgba(229, 62, 62, 0.2)',
            padding: '12px',
            borderRadius: '8px',
            marginTop: '12px',
            fontSize: '0.9em',
            border: '1px solid rgba(229, 62, 62, 0.3)'
          }}>
            ❌ {error}
          </div>
        )}

        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '0.9em'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid transparent',
              borderTop: '2px solid rgb(45, 128, 211)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            ⏳ AI is crafting your perfect travel plan...
          </div>
        )}
      </div>

      {/* Day Tabs */}
      {currentDays.length > 0 && (
        <div style={{ padding: '0 24px', marginTop: '16px' }}>
          <DayTabs 
            days={currentDays} 
            selectedDay={selectedDay} 
            onDaySelect={setSelectedDay} 
          />
        </div>
      )}

      {/* Activities List */}
      <div style={{
        flex: 1,
        padding: '0 24px 24px',
        overflowY: 'auto'
      }}>
        {currentDayActivities.length > 0 ? (
          currentDayActivities.map((activity, index) => {
            const lat = Number(activity.latitude ?? activity.lat ?? 0);
            const lng = Number(activity.longitude ?? activity.lng ?? 0);
            const markerIndex = markers.findIndex(m => 
              m.latitude === lat && 
              m.longitude === lng && 
              m.activity === (activity.activity ?? activity.name ?? '')
            );
            const isSelected = selectedMarker && 
              selectedMarker.latitude === lat && 
              selectedMarker.longitude === lng;

            return (
              <ActivityCard
                key={index}
                activity={activity}
                markerIndex={markerIndex}
                onFocusMarker={focusMarker}
                isSelected={isSelected}
                isMobile={false}
              />
            );
          })
        ) : geminiData.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            <div style={{ fontSize: '3em', marginBottom: '16px' }}>🌴</div>
            <h3 style={{ margin: '0 0 8px 0', color: 'rgba(255,255,255,0.9)' }}>
              No Travel Plans Yet
            </h3>
            <p style={{ margin: 0, fontSize: '0.9em' }}>
              Fill out the form to generate your AI-powered travel itinerary!
            </p>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            No activities planned for this day
          </div>
        )}
      </div>
    </>
  );

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex',
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader 
          onToggleMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          hasData={hasData}
        />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div style={{
          width: sidebarCollapsed ? '80px' : '420px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1000,
          boxShadow: '4px 0 20px rgba(0,0,0,0.2)'
        }}>
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '-20px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2em',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              zIndex: 1001
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>

          {!sidebarCollapsed && <DesktopSidebarContent />}

          {sidebarCollapsed && (
            <div style={{
              padding: '20px 12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2em', marginBottom: '20px' }}>🌟</div>
              <div style={{ fontSize: '2em', marginBottom: '20px' }}>🗺️</div>
              <div style={{ fontSize: '2em', marginBottom: '20px' }}>⏱️</div>
            </div>
          )}
        </div>
      )}

      {/* Map Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        marginTop: isMobile ? '60px' : '0',
        marginBottom: isMobile && hasData ? '60px' : '0',
        height: isMobile ? 'calc(100vh - 60px)' : '100%'
      }}>
        <MapContainer
          center={markers.length > 0 ? [markers[0].latitude, markers[0].longitude] : defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={map => (mapRef.current = map)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {markers.map((m, idx) => (
            <Marker
              key={idx}
              position={[m.latitude, m.longitude]}
              icon={m.icon}
              ref={el => { if (el) markerRefs.current[idx] = el; }}
              eventHandlers={{
                click: () => setSelectedMarker(m)
              }}
            >
              <Popup>
                <EnhancedPopup marker={m} onGetDirections={handleGetDirections} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Radar Loading Overlay */}
        {loading && <RadarLoading />}

        {/* Mobile Form Overlay */}
        {isMobile && !hasData && !loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px',
            overflowY: 'auto'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '12px'
                }}>
                  🌟
                </div>
                <h2 style={{
                  color: 'white',
                  margin: '0 0 8px 0',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  AI Travel Planner
                </h2>
                <p style={{
                  color: 'rgba(255,255,255,0.7)',
                  margin: 0,
                  fontSize: '14px'
                }}>
                  Plan your perfect trip in Iraq
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'rgba(255,255,255,0.1)',
                      color: location ? 'white' : 'rgba(255,255,255,0.7)',
                      fontSize: '16px',
                      backdropFilter: 'blur(10px)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>
                      {location || '📍 Select Muhafaza'}
                    </span>
                    <span style={{
                      transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      fontSize: '14px'
                    }}>
                      ▼
                    </span>
                  </div>

                  {isDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'rgba(26, 26, 46, 0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '12px',
                      marginTop: '8px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {iraqiProvinces.map((province, index) => (
                        <div
                          key={province}
                          onClick={() => {
                            setLocation(province);
                            setIsDropdownOpen(false);
                          }}
                          style={{
                            padding: '14px 16px',
                            color: location === province ? '#667eea' : 'rgba(255,255,255,0.9)',
                            cursor: 'pointer',
                            borderBottom: index < iraqiProvinces.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            background: location === province ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                            fontSize: '14px'
                          }}
                        >
                          {province}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  {[1, 2, 3].map((dayCount) => (
                    <div
                      key={dayCount}
                      onClick={() => setDuration(dayCount)}
                      style={{
                        flex: 1,
                        padding: '16px 8px',
                        borderRadius: '10px',
                        background: duration === dayCount 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                          : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      {dayCount} {dayCount === 1 ? 'Day' : 'Days'}
                    </div>
                  ))}
                </div>

                <button 
                  type="submit"
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🚀 Generate Travel Plan
                </button>
              </form>

              {error && (
                <div style={{
                  background: 'rgba(229, 62, 62, 0.2)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginTop: '16px',
                  fontSize: '14px',
                  border: '1px solid rgba(229, 62, 62, 0.3)',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  ❌ {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Controls Overlay */}
        {selectedMarker && !isMobile && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '20px',
            maxWidth: '300px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#2d3436' }}>
              {selectedMarker.activity}
            </h4>
            <p style={{ margin: '0 0 12px 0', color: '#636e72', fontSize: '0.9em' }}>
              {selectedMarker.day} • {selectedMarker.location}
            </p>
            <button
              onClick={() => handleGetDirections(selectedMarker)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95em',
                fontWeight: '600'
              }}
            >
              🗺️ Get Directions
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      {isMobile && hasData && (
        <MobileBottomSheet
          isOpen={mobileMenuOpen}
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          currentDays={currentDays}
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
          hasData={hasData}
        >
          <div style={{
            padding: '0 8px',
            maxHeight: 'calc(80vh - 140px)',
            overflowY: 'auto'
          }}>
            {currentDayActivities.map((activity, index) => {
              const lat = Number(activity.latitude ?? activity.lat ?? 0);
              const lng = Number(activity.longitude ?? activity.lng ?? 0);
              const markerIndex = markers.findIndex(m => 
                m.latitude === lat && 
                m.longitude === lng && 
                m.activity === (activity.activity ?? activity.name ?? '')
              );
              const isSelected = selectedMarker && 
                selectedMarker.latitude === lat && 
                selectedMarker.longitude === lng;

              return (
                <ActivityCard
                  key={index}
                  activity={activity}
                  markerIndex={markerIndex}
                  onFocusMarker={focusMarker}
                  isSelected={isSelected}
                  isMobile={true}
                />
              );
            })}
          </div>
        </MobileBottomSheet>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(0.8); }
        }
        
        @keyframes progressBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        
        body { margin: 0; overflow: hidden; }
        * { box-sizing: border-box; }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #00f2fe;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #00f2fe;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #00f2fe;
        }
      `}</style>
    </div>
  );
}

export default App;