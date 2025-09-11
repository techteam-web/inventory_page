import { useState, useRef, useEffect } from "react";
import io from 'socket.io-client';
import FloorInfoCard from "./components/FloorInfoCard";
import FloorPlanModal from "./components/FloorPlanModal";
import Navbar from "./components/Navbar";

export default function BuildingOverlay() {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [updateStatus, setUpdateStatus] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // ... other existing state
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showFloorPlans, setShowFloorPlans] = useState(false);
  const [floorPlanModal, setFloorPlanModal] = useState(null);
  
  const svgRef = useRef(null);
  const socketRef = useRef(null);

  // ⚡ WEBSOCKET CONNECTION & REAL-TIME UPDATES
  useEffect(() => {
    // Initialize WebSocket connection
    const socket = io('https://inventory-page-x73n.onrender.com/', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    
    socketRef.current = socket;

    // Connection status handlers
    socket.on('connect', () => {
      console.log('⚡ Connected to WebSocket server');
      setConnectionStatus('Connected');
    });

    socket.on('disconnect', () => {
      console.log('⚡ Disconnected from WebSocket server');
      setConnectionStatus('Disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('⚡ WebSocket connection error:', error);
      setConnectionStatus('Connection Error');
    });

    // ⚡ REAL-TIME DATA UPDATES
    socket.on('floorsUpdated', (update) => {
      console.log('🔥 Real-time update received:', update);
      
      setFloors(update.data);
      setLastUpdate(new Date().toLocaleTimeString());
      setUpdateStatus(`✅ Updated from ${update.source} (${update.count} floors)`);
      
      // Clear status after 3 seconds
      setTimeout(() => setUpdateStatus(''), 3000);
    });

    // Initial data fetch
    fetchInitialFloors();

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Initial data fetch
  const fetchInitialFloors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("https://inventory-page-x73n.onrender.com/api/floors");
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setFloors(data.data);
        setLastUpdate(new Date().toLocaleTimeString());
        console.log(`✅ Initial load: ${data.count} floors from ${data.source}`);
      } else {
        throw new Error(data.error || 'Failed to load floors');
      }
      
    } catch (err) {
      console.error("Error fetching initial floors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      setUpdateStatus('🔄 Refreshing...');
      
      const response = await fetch("https://inventory-page-x73n.onrender.com/api/floors/refresh", {
        method: "POST"
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUpdateStatus(`✅ Refreshed! Notified ${result.clientsNotified} clients`);
        console.log('Manual refresh completed');
      } else {
        setUpdateStatus('❌ Refresh failed');
      }
      
    } catch (error) {
      console.error("Manual refresh error:", error);
      setUpdateStatus('❌ Refresh failed');
    }
    
    // Clear status after 3 seconds
    setTimeout(() => setUpdateStatus(''), 3000);
  };

  // ... existing handler functions (handleFloorMouseEnter, etc.)
  const handleFloorMouseEnter = (floor, event) => {
    const svgRect = svgRef.current.getBoundingClientRect();
    const bbox = event.target.getBBox();
    setSelectedFloor(floor);
    const x = svgRect.width * 0.8;
    const y = bbox.y + bbox.height / 2;
    setCardPosition({ x, y });
    event.target.style.fill = "rgba(139, 108, 92, 0.5)";
  };

  const handleFloorMouseLeave = (floor, event) => {
    setSelectedFloor(null);
    event.target.style.fill = getFloorFillColor(floor);
  };

  const handleFloorClick = (floor, event) => {
    if (showFloorPlans && floor.info["floor-plan"]) {
      setFloorPlanModal(floor);
    }
  };

  const handleNavbarSelect = (type, value) => {
    if (type === "unit") {
      const newSelectedUnit = value === selectedUnit ? null : value;
      setSelectedUnit(newSelectedUnit);
      setShowFloorPlans(false);
    } else if (type === "floorPlan") {
      setShowFloorPlans(!showFloorPlans);
      setSelectedUnit(null);
    }
    
    if (svgRef.current) {
      const pathElements = svgRef.current.querySelectorAll('path[id^="floor"]');
      pathElements.forEach(path => {
        path.style.fill = '';
      });
    }
  };

  const getFloorFillColor = (floor) => {
    if (showFloorPlans) {
      const hasFloorPlan = floor.info["floor-plan"];
      const isAvailable = floor.info.availability?.toLowerCase() === "true";
      
      if (hasFloorPlan && isAvailable) {
        return "#d0aa2d92";
      } else {
        return "rgba(0, 0, 0, 0.1)";
      }
    }
    
    if (selectedUnit) {
      const matchesUnit = floor.info.bhk === selectedUnit;
      const isAvailable = floor.info.availability?.toLowerCase() === "true";
      
      if (matchesUnit && isAvailable) {
        return "#d0aa2d92";
      } else if (matchesUnit && !isAvailable) {
        return "#ff000064";
      } else {
        return "rgba(0, 0, 0, 0.1)";
      }
    }
    
    return "rgba(0, 0, 0, 0.22)";
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFB284] mx-auto mb-4"></div>
          <p className="text-[#CFB284] text-lg">Loading floor data...</p>
          <p className="text-gray-500 text-sm mt-2">Establishing real-time connection...</p>
          <p className="text-xs text-gray-400 mt-1">Status: {connectionStatus}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Floor Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#CFB284] text-white rounded-lg hover:bg-[#b8a073] transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* ⚡ REAL-TIME STATUS INDICATORS */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Connection Status */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          connectionStatus === 'Connected' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          ⚡ {connectionStatus}
        </div>
        
        {/* Last Update Time */}
        {lastUpdate && (
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            🕒 {lastUpdate}
          </div>
        )}
      </div>

      {/* Manual Refresh Button */}
      <button
        onClick={handleManualRefresh}
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-[#CFB284] text-white rounded-lg hover:bg-[#b8a073] transition-colors duration-200"
      >
        🔄 Refresh Now
      </button>

      {/* Update Status Notification */}
      {updateStatus && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg">
          {updateStatus}
        </div>
      )}

      {/* Existing SVG and components */}
      <svg
        ref={svgRef}
        viewBox="0 0 1920 1080"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto border"
      >
        <image
          href="/building.svg"
          x="0"
          y="0"
          className="w-50% h-50%"
          preserveAspectRatio="xMidYMid slice"
        />

        {floors.length > 0 && floors.map((floor) => (
          <path
            key={floor.id}
            id={floor.id}
            d={floor.d}
            fill={getFloorFillColor(floor)}
            className={`cursor-pointer transition-colors duration-200 ${
              showFloorPlans && floor.info["floor-plan"] && floor.info.availability?.toLowerCase() === "true" 
                ? 'cursor-pointer hover:brightness-110' 
                : ''
            }`}
            onMouseEnter={(event) => handleFloorMouseEnter(floor, event)}
            onMouseLeave={(event) => handleFloorMouseLeave(floor, event)}
            onClick={(event) => handleFloorClick(floor, event)}
          >
            <title>{floor.id}</title>
          </path>
        ))}
      </svg>

      {/* Existing components */}
      {selectedFloor && (
        <div
          className="absolute"
          style={{
            left: cardPosition.x,
            top: cardPosition.y / 2,
            transform: "translateY(-50%)",
          }}
        >
          <FloorInfoCard
            info={selectedFloor.info}
            onClose={() => setSelectedFloor(null)}
          />
        </div>
      )}

      <Navbar 
        onSelect={handleNavbarSelect} 
        selectedUnit={selectedUnit}
        showFloorPlans={showFloorPlans}
      />

      {floorPlanModal && (
        <FloorPlanModal
          floor={floorPlanModal}
          onClose={() => setFloorPlanModal(null)}
        />
      )}
    </div>
  );
}
