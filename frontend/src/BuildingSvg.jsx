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

  // Existing state
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showFloorPlans, setShowFloorPlans] = useState(false);
  const [floorPlanModal, setFloorPlanModal] = useState(null); // floor modal data

  // NEW: highlight plan modal data (Option A: reuse FloorPlanModal with highlight prop)
  const [highlightPlanModal, setHighlightPlanModal] = useState(null); // { id, name, planImages: [] }

  // NEW: Highlight state
  const [activeHighlight, setActiveHighlight] = useState(null); // 'wardrobe', 'terrace', 'skyclub', 'floorPlan', 'unit'

  const svgRef = useRef(null);
  const socketRef = useRef(null);

  // NEW: Highlight Areas with plan images
  const HIGHLIGHT_AREAS = {
    wardrobe: {
      name: "Wardrobe Areas",
      color: "#8a5cf6b1",
      d: "m 90.723317,145.66639 12.821743,-1.69155 c 0,0 -1.715,0.13584 0.017,0 1.73197,-0.13584 4.87331,0.0509 4.87331,0.0509 l 1.73197,0.20376 0.71317,0.0849 0.62827,0.1698 0.62826,0.22075 0.44149,0.18678 0.32262,0.1698 0.39054,0.28866 0.22074,0.23773 0.0679,0.1698 0.0679,0.27168 0.017,0.37357 0.017,6.77508 c 0,0 0.47544,-0.0849 -0.66223,-0.40752 -1.13767,-0.32263 -3.15831,-0.57733 -3.15831,-0.57733 l -1.17163,-0.11886 -0.96787,-0.034 -5.04311,0.017 -1.25653,0.0509 -0.98485,0.0679 -11.138989,1.20559 0.0849,-7.02979 z",
      targetFloors: [],
      planImages: [
        "/floor-plans/club1.jpg",
        "/floor-plans/club2.jpg"
      ]
    },
    terrace: {
      name: "Terrace Areas",
      color: "#10b981be",
      d: "m 89.378556,154.11918 -0.240136,32.22622 24.78202,0.19211 0.048,-32.99466 c 0,0 1.36877,0.69639 -0.1681,-0.048 -1.53687,-0.74442 -3.45796,-1.10462 -3.45796,-1.10462 l -3.26584,-0.21612 -4.03429,0.12006 -13.807805,1.29674 z",
      targetFloors: [],
      planImages: [
        "/floor-plans/parking1.jpg",
        "/floor-plans/parking2.jpg",
        "/floor-plans/parking3.jpg",
        "/floor-plans/parking4.jpg",
        "/floor-plans/parking5.jpg",
      ]
    },
    skyclub: {
      name: "Sky Club Area",
      color: "#87ceeb",
      d: "m 89.426583,37.749353 13.159447,-5.859315 c 0,0 -2.20925,0.480272 0,0 2.20925,-0.480271 3.74612,-0.288163 3.74612,-0.288163 0,0 -1.87306,-0.288163 0.14408,0.09605 2.01714,0.384217 3.07374,1.00857 3.07374,1.00857 0,0 -1.34476,-0.864489 0.14408,0.04803 1.48884,0.912516 3.65006,3.794146 3.65006,3.794146 L 113.152,36.020375 c 0,0 -0.76843,1.440815 0,0 0.76844,-1.440815 0.81647,-5.379043 0.81647,-5.379043 0,0 0.33619,1.200679 0,0 -0.3362,-1.200679 -0.96055,-2.737549 -0.96055,-2.737549 0,0 0.38422,-0.144081 -0.91251,-1.68095 -1.29674,-1.536869 -3.1698,-2.641494 -3.1698,-2.641494 l -1.777,-0.768435 -1.44082,-0.144081 -1.15265,0.09605 -0.91252,-0.04803 -0.48027,0.09605 -1.20068,0.528299 -11.862706,5.523124 c 0,0 0.240135,-0.624353 -0.720408,1.056598 -0.960543,1.680951 -0.09605,1.921086 -0.09605,1.921086 0,0 -1.056598,-0.576326 -0.192113,0.33619 0.864489,0.912516 1.536869,0.576326 1.440815,0.912516 -0.09605,0.336191 -0.720407,0.336191 -0.144077,1.440816 0.576326,1.104625 -0.816463,1.728978 -0.816463,1.728978",
      targetFloors: [],
      planImages: [
        "/floor-plans/skyclub.jpg",
      ]
    }
  };

  // WebSocket & data
  useEffect(() => {
    const socket = io('https://inventory-page-x73n.onrender.com', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnectionStatus('Connected'));
    socket.on('disconnect', () => setConnectionStatus('Disconnected'));
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('Connection Error');
    });

    socket.on('floorsUpdated', (update) => {
      setFloors(update.data);
      setLastUpdate(new Date().toLocaleTimeString());
      setUpdateStatus(`Updated from ${update.source} (${update.count} floors)`);
      setTimeout(() => setUpdateStatus(''), 3000);
    });

    fetchInitialFloors();
    return () => { socket.disconnect(); };
  }, []);

  const fetchInitialFloors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("https://inventory-page-x73n.onrender.com/api/floors");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setFloors(data.data);
        setLastUpdate(new Date().toLocaleTimeString());
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

  const handleManualRefresh = async () => {
    try {
      setUpdateStatus('Refreshing...');
      const response = await fetch("https://inventory-page-x73n.onrender.com/api/floors/refresh", { method: "POST" });
      const result = await response.json();
      setUpdateStatus(result.success ? `Refreshed! Notified ${result.clientsNotified} clients` : 'Refresh failed');
    } catch (error) {
      console.error("Manual refresh error:", error);
      setUpdateStatus('Refresh failed');
    }
    setTimeout(() => setUpdateStatus(''), 3000);
  };

  // Handlers
  const handleFloorMouseEnter = (floor, event) => {
    setSelectedFloor(floor);
    setCardPosition({ x: event.clientX + 10, y: event.clientY + 10 });
    event.target.style.fill = "rgba(139, 108, 92, 0.5)";
  };

  const handleFloorMouseLeave = (floor, event) => {
    setSelectedFloor(null);
    event.target.style.fill = getFloorFillColor(floor);
  };

  const handleFloorClick = (floor, event) => {
    if (showFloorPlans && floor.info["has-floor-plan"]) {
      setFloorPlanModal(floor);
    }
  };

  // Navbar selection
  const handleNavbarSelect = (type, value) => {
    if (type === "unit") {
      const newSelectedUnit = value === selectedUnit ? null : value;
      setSelectedUnit(newSelectedUnit);
      setActiveHighlight(newSelectedUnit ? 'unit' : null);
      setShowFloorPlans(false);
    } else if (type === "floorPlan") {
      const newShowFloorPlans = !showFloorPlans;
      setShowFloorPlans(newShowFloorPlans);
      setActiveHighlight(newShowFloorPlans ? 'floorPlan' : null);
      setSelectedUnit(null);
    } else if (type === "floor") {
      if (value === "1") {
        const newHighlight = activeHighlight === 'wardrobe' ? null : 'wardrobe';
        setActiveHighlight(newHighlight);
        setShowFloorPlans(false);
        setSelectedUnit(null);
      } else if (value === "4") {
        const newHighlight = activeHighlight === 'terrace' ? null : 'terrace';
        setActiveHighlight(newHighlight);
        setShowFloorPlans(false);
        setSelectedUnit(null);
      } else if (value === "5") {
        const newHighlight = activeHighlight === 'skyclub' ? null : 'skyclub';
        setActiveHighlight(newHighlight);
        setShowFloorPlans(false);
        setSelectedUnit(null);
      } else {
        setActiveHighlight(null);
        setShowFloorPlans(false);
        setSelectedUnit(null);
      }
    }

    if (svgRef.current) {
      const pathElements = svgRef.current.querySelectorAll('path[id^="floor"]');
      pathElements.forEach(path => { path.style.fill = ''; });
    }
  };

  const getFloorFillColor = (floor) => {
    const isAvailable = floor.info.availability?.toLowerCase() === "true";
    const floorNumber = parseInt(floor.info.floorNumber);

    if (activeHighlight === 'wardrobe') {
      return HIGHLIGHT_AREAS.wardrobe.targetFloors.includes(floorNumber)
        ? (isAvailable ? "#8b5cf6" : "#6d28d9")
        : "rgba(0, 0, 0, 0.1)";
    }

    if (activeHighlight === 'terrace') {
      return HIGHLIGHT_AREAS.terrace.targetFloors.includes(floorNumber)
        ? (isAvailable ? "#10b981" : "#047857")
        : "rgba(0, 0, 0, 0.1)";
    }

    if (activeHighlight === 'floorPlan') {
      const hasFloorPlan = floor.info["has-floor-plan"];
      return hasFloorPlan && isAvailable ? "#d0aa2d92" : "rgba(0, 0, 0, 0.1)";
    }

    if (activeHighlight === 'unit' && selectedUnit) {
      const matchesUnit = floor.info.bhk === selectedUnit;
      if (matchesUnit && isAvailable) return "#d0aa2d92";
      if (matchesUnit && !isAvailable) return "#ff000064";
      return "rgba(0, 0, 0, 0.1)";
    }

    return "rgba(0, 0, 0, 0.22)";
  };

  // Render highlight path and open highlight modal on click
  const renderHighlightAreas = () => {
    if (!activeHighlight || !HIGHLIGHT_AREAS[activeHighlight]) return null;
    const highlight = HIGHLIGHT_AREAS[activeHighlight];

    return (
      <path
        key={`highlight-${activeHighlight}`}
        d={highlight.d}
        fill={highlight.color}
        opacity="0.6"
        stroke={highlight.color}
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300"
        style={{ filter: `drop-shadow(0 0 8px ${highlight.color})` }}
        onClick={(e) => {
          e.stopPropagation();
          setHighlightPlanModal({
            id: activeHighlight,
            name: highlight.name,
            planImages: Array.isArray(highlight.planImages) ? highlight.planImages : []
          });
        }}
      />
    );
  };

  // Loading
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

  // Error
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

  // UI
  return (
    <div className="fixed inset-0 w-auto h-auto overflow-x-hidden bg-gray-100">
      {/* Main Building Container */}
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 383.07562 210.92149"
          xmlns="http://www.w3.org/2000/svg"
          className="max-w-full max-h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background image */}
          <image
            href="/building.svg"
            x="0"
            y="0"
            width="383.07562"
            height="210.92149"
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Highlight Area Overlays */}
          <g transform="translate(86,0)">
            {renderHighlightAreas()}
          </g>

          {/* Floor paths */}
          <g transform="translate(86,0)">
            {floors.map((floor) => (
              <path
                key={floor.id}
                id={floor.id}
                d={floor.d}
                fill={getFloorFillColor(floor)}
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={(event) => handleFloorMouseEnter(floor, event)}
                onMouseLeave={(event) => handleFloorMouseLeave(floor, event)}
                onClick={(event) => handleFloorClick(floor, event)}
                vectorEffect="non-scaling-stroke"
              >
                <title>{floor.id}</title>
              </path>
            ))}
          </g>
        </svg>
      </div>

      {/* Floor Info Card */}
      {selectedFloor && (
        <div
          className="fixed z-20 pointer-events-none"
          style={{ left: cardPosition.x, top: cardPosition.y, transform: "translate(10px, -50%)" }}
        >
          <div className="pointer-events-auto">
            <FloorInfoCard
              info={selectedFloor.info}
              onClose={() => setSelectedFloor(null)}
            />
          </div>
        </div>
      )}

      {/* Navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <Navbar 
          onSelect={handleNavbarSelect} 
          selectedUnit={selectedUnit}
          showFloorPlans={showFloorPlans}
          activeHighlight={activeHighlight}
        />
      </div>

      {/* Floor Plan Modal (floors) */}
      {floorPlanModal && (
        <FloorPlanModal
          floor={floorPlanModal}
          onClose={() => setFloorPlanModal(null)}
        />
      )}

      {/* Highlight Plan Modal (Option A: reuse FloorPlanModal with highlight prop) */}
      {highlightPlanModal && (
        <FloorPlanModal
          highlight={highlightPlanModal}
          onClose={() => setHighlightPlanModal(null)}
        />
      )}
    </div>
  );
}
