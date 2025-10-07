// src/App.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ---------- Custom Icon Generator ----------
const createCustomIcon = (dayIndex, activityType = '') => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
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
            width: 52px;
            height: 52px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            border: 3px solid white;
            position: relative;
            transition: all 0.3s ease;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 22px;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3))
            ">${emoji}</span>
          </div>`,
    className: 'custom-marker',
    iconSize: [52, 52],
    iconAnchor: [26, 52],
    popupAnchor: [0, -52]
  });
};

// ---------- Enhanced Popup Component ----------
const EnhancedPopup = ({ marker, onGetDirections }) => (
  <div style={{
    minWidth: 280,
    borderRadius: 16,
    overflow: 'hidden',
    background: 'white',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  }}>
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      color: 'white',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60px',
        height: '60px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '0 0 0 100%'
      }}></div>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2em', fontWeight: '700' }}>
        {marker.activity || 'Activity'}
      </h4>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontSize: '0.9em',
        opacity: 0.9
      }}>
        <span>📅 {marker.day}</span>
        <span>•</span>
        <span>🕒 {marker.time}</span>
      </div>
    </div>
    
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        fontWeight: '600',
        color: '#2d3436'
      }}>
        <span style={{ fontSize: '1.2em' }}>📍</span>
        {marker.location}
      </div>
      
      {marker.notes && (
        <div style={{
          padding: '12px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '0.9em',
          color: '#636e72',
          lineHeight: 1.5
        }}>
          {marker.notes}
        </div>
      )}
      
      <button 
        onClick={() => onGetDirections(marker)}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.95em',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <span style={{ fontSize: '1.1em' }}>🗺️</span>
        Get Directions via Google Maps
      </button>
    </div>
  </div>
);

// ---------- Day Selection Tabs ----------
const DayTabs = ({ days, selectedDay, onDaySelect }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '8px',
      borderRadius: '16px'
    }}>
      {days.map((day, index) => (
        <button
          key={index}
          onClick={() => onDaySelect(index)}
          style={{
            flex: 1,
            padding: '16px 20px',
            borderRadius: '12px',
            border: 'none',
            background: selectedDay === index 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : 'rgba(255,255,255,0.8)',
            color: selectedDay === index ? 'white' : '#2d3436',
            cursor: 'pointer',
            fontSize: '1em',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: selectedDay === index 
              ? '0 8px 20px rgba(102, 126, 234, 0.3)' 
              : '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          🌟 {day.day || `Day ${index + 1}`}
        </button>
      ))}
    </div>
  );
};

// ---------- Activity Card ----------
const ActivityCard = ({ activity, markerIndex, onFocusMarker, isSelected }) => {
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
          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        cursor: markerIndex >= 0 ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        border: isSelected ? '2px solid rgba(102, 126, 234, 0.3)' : '2px solid transparent',
        boxShadow: isSelected 
          ? '0 12px 30px rgba(102, 126, 234, 0.2)' 
          : '0 4px 15px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(10px)',
        color: isSelected ? 'white' : '#2d3436'
      }}
      onMouseEnter={(e) => {
        if (markerIndex >= 0 && !isSelected) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (markerIndex >= 0 && !isSelected) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          background: isSelected 
            ? 'rgba(255,255,255,0.2)' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '1.4em',
          minWidth: '50px',
          textAlign: 'center',
          color: isSelected ? 'white' : 'white'
        }}>
          {getActivityIcon(activity.activity)}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px'
          }}>
            <h4 style={{ 
              margin: 0, 
              fontSize: '1.1em',
              color: isSelected ? 'white' : '#2d3436'
            }}>
              {activity.activity}
            </h4>
            <span style={{
              background: isSelected 
                ? 'rgba(255,255,255,0.2)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.85em',
              fontWeight: '600'
            }}>
              {activity.time}
            </span>
          </div>
          
          <div style={{
            fontSize: '0.95em',
            marginBottom: '8px',
            opacity: isSelected ? 0.9 : 0.8,
            fontWeight: '500'
          }}>
            📍 {activity.location}
          </div>
          
          {activity.notes && (
            <div style={{
              fontSize: '0.9em',
              opacity: isSelected ? 0.8 : 0.7,
              lineHeight: 1.5,
              fontStyle: 'italic'
            }}>
              {activity.notes}
            </div>
          )}
          
          {activity.latitude && activity.longitude && (
            <div style={{
              fontSize: '0.8em',
              opacity: 0.6,
              marginTop: '8px',
              fontFamily: 'monospace'
            }}>
              {activity.latitude.toFixed(4)}, {activity.longitude.toFixed(4)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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

  const pollingInterval = useRef(null);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
const [isDropdownOpen, setIsDropdownOpen] = useState(false);

// List of Iraqi Muhafazat (Provinces)
const iraqiProvinces = [
  "Baghdad", "Basra", "Nineveh", "Erbil", "Kirkuk", "Sulaymaniyah", 
  "Dohuk", "Wasit", "Najaf", "Karbala", "Babil", "Diyala", 
  "Maysan", "Dhi Qar", "Al-Qadisiyyah", "Muthanna", "Anbar", "Saladin"
];
  // Fetch existing data
  useEffect(() => {
    const loadPlansAndCoords = async () => {
      try {
        setError('');
        let res = null;
        try {
          res = await api.get('/api/geminidata');
        } catch (e) {
          res = await api.get('/api/sami-park-osm');
        }

        let plans = res?.data ?? [];
        if (!Array.isArray(plans)) {
          if (plans && typeof plans === 'object' && (plans.days || plans.data)) {
            plans = [plans];
          } else {
            setGeminiData([]);
            return;
          }
        }

        if (plans.length === 0) {
          setGeminiData([]);
          return;
        }

        setGeminiData(plans);
        const codeFromPlan = plans[0]?.code_chat ?? plans[0]?.code ?? null;
        const codeToUse = codeFromPlan ?? 'EXAMPLE_CODE';
        const locations = await fetchLocationsForCode(codeToUse);
        
      } catch (err) {
        console.error('loadPlansAndCoords error', err);
        setError('Failed to load plans or locations.');
      }
    };

    loadPlansAndCoords();
  }, []);

  const fetchLocationsForCode = async (code) => {
    if (!code) return null;
    try {
      const res = await api.get(`/api/get-location/${encodeURIComponent(code)}`);
      if (!res?.data?.locations) return null;
      return res.data.locations;
    } catch (err) {
      console.error('fetchLocationsForCode failed', err);
      return null;
    }
  };

  const startPolling = (code) => {
    setLoading(true);
    if (pollingInterval.current) clearInterval(pollingInterval.current);

    pollingInterval.current = setInterval(async () => {
      try {
        const res = await api.get(`/api/geminidata/${encodeURIComponent(code)}`);
        const payload = res.data?.data ?? res.data;
        if (payload && (payload.days || (payload.data && payload.data.days))) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
          setLoading(false);
          
          const planObj = res.data || payload;
          const locations = await fetchLocationsForCode(code);
          const lookup = {};
          (locations || []).forEach(l => {
            lookup[(l.location || '').trim().toLowerCase()] = { lat: l.latitude, lon: l.longitude, found: !!l.found };
          });

          const copy = JSON.parse(JSON.stringify(planObj));
          const days = copy.data?.days ?? copy.days ?? [];
          days.forEach(day => {
            (day.rows || []).forEach(row => {
              const key = (row.location || '').trim().toLowerCase();
              if (lookup[key]) {
                row.latitude = lookup[key].lat;
                row.longitude = lookup[key].lon;
              } else {
                row.latitude = row.latitude ?? row.lat ?? null;
                row.longitude = row.longitude ?? row.lon ?? null;
              }
            });
          });
          if (copy.data && copy.data.days) copy.data.days = days; else copy.days = days;
          setGeminiData([copy]);
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
            activity: row.activity ?? row.title ?? '',
            time: row.time ?? '',
            location: row.location ?? '',
            notes: row.notes ?? '',
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
  };

  const handleGetDirections = (marker) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const currentPlan = geminiData[0];
  const currentDays = currentPlan ? (currentPlan.data?.days ?? currentPlan.days ?? []).slice(0, 3) : [];
  const currentDayActivities = currentDays[selectedDay]?.rows || [];

  useEffect(() => () => { 
    if (pollingInterval.current) clearInterval(pollingInterval.current); 
  }, []);

  const defaultCenter = [36.2, 44.0];

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex',
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
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

        {!sidebarCollapsed && (
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                <input 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  placeholder="�️ Destination" 
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '0.95em',
                    backdropFilter: 'blur(10px)'
                  }}
                />
            
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
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
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
      {/* Animated background effect for selected state */}
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '1em',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
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
                    borderTop: '2px solid #667eea',
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
                    m.activity === (activity.activity ?? '')
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
        )}

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

      {/* Full Screen Map */}
      <div style={{
        flex: 1,
        position: 'relative'
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

        {/* Map Controls Overlay */}
        {selectedMarker && (
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
              {selectedMarker.day} • {selectedMarker.time}
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

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        body { margin: 0; overflow: hidden; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

export default App;