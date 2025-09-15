import { useEffect, useRef } from "react";

export default function FloorDetailModal({ floor, onClose }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // Hardcoded flat paths with sold status
  const flats = [
    {
      id: "path1",
      d: "m 1164.207,1741.1591 h 61.8163 77.7387 v -44.9573 h 16.859 l 211.674,0.9366 v 43.5524 l 94.3635,0.2342 h 82.8613 l 0.7312,-119.652 h 10.3027 v 119.8709 l 155.6961,0.9934 1.6557,417.901 -205.308,-0.3311 h -520.555 z",
      sold: true,
      flatNumber: "01"
    },
    {
      id: "path2", 
      d: "m 486.10091,1641.8784 395.24967,-0.9366 -0.93661,528.2484 h -370.8978 l 0.46831,-9.3661 -72.11902,0.4683 -2.08278,-333.0516 h 49.009 z",
      sold: false,
      flatNumber: "02"
    },
    {
      id: "path3",
      d: "m 880.17505,1631.2048 v -276.8346 l -0.69769,-242.6134 -443.01682,1.4049 0.64671,331.2791 h 45.69758 l -0.45037,187.6032 z",
      sold: false,
      flatNumber: "03"
    },
    {
      id: "path4",
      d: "M 870.11126,1102.3907 H 397.35705 l 0.23415,-222.21088 -21.07373,-0.70246 V 589.12807 l 587.10533,0.30443 0.66229,441.7432 -91.39516,-1.3245 z",
      sold: true,
      flatNumber: "04"
    },
    {
      id: "path5",
      d: "m 1048.0673,1103.3273 h 490.7839 V 879.94567 h 21.0738 l -0.7025,-290.58344 -586.99001,0.40142 -0.33114,432.14015 92.05745,-0.9935 -0.3312,9.272 h -26.8224 v 74.8381 z",
      sold: true,
      flatNumber: "05"
    },
    {
      id: "path6",
      d: "m 2042.483,1547.0948 -2.6492,-340.4139 -323.1944,-1.3245 v 40.3357 l -203.0767,0.7025 0.7025,312.8279 364.5757,-1.1708 v -9.8344 z",
      sold: false,
      flatNumber: "06"
    },
    {
      id: "path7",
      d: "m 2055.7286,1548.4193 1.3246,-341.7384 319.2208,1.3246 0.9934,36.5912 205.6391,0.4967 v 320.5453 l -527.0462,-0.094 z",
      sold: true,
      flatNumber: "07"
    },
    {
      id: "path8",
      d: "m 3050.4788,1102.0401 -494.0637,2.6491 3.3115,-225.17643 -24.5045,-0.66228 1.5877,-290.65903 400.8694,1.40492 185.9172,1.40491 -0.9366,430.84091 -92.7245,-0.9366 v 11.2393 h 29.0349 l -0.9366,72.119 z",
      sold: true,
      flatNumber: "08"
    },
    {
      id: "path9",
      d: "m 3215.3842,1092.088 0.9366,-62.7529 -84.3811,0.5161 0.3311,-440.74984 588.4391,0.99343 -1.3246,288.7557 -20.5308,0.66228 v 234.44843 l -114.575,-1.3246 0.6622,-9.9342 -370.8788,2.6491 z",
      sold: true,
      flatNumber: "09"
    },
    {
      id: "path10",
      d: "m 3213.4006,1629.2179 325.1813,3.3115 0.6623,-186.7641 h 46.3598 l -0.6623,-329.155 -372.8657,1.9869 z",
      sold: false,
      flatNumber: "10"
    },
    {
      id: "path11",
      d: "m 3214.0629,1642.4636 316.5716,-1.3246 v 176.1675 l 9.2719,-0.6623 -0.4549,10.6831 45.6598,-0.4683 -0.1696,342.7824 -370.8788,-0.6622 v -61.5924 h 9.9342 v -403.9931 l -9.272,1.9869 z",
      sold: true,
      flatNumber: "11"
    },
    {
      id: "path12",
      d: "m 2869.013,1744.4553 -74.1757,-3.9737 v -43.7107 h -233.1239 l 1.9869,43.7107 h -178.8166 l -165.571,0.6623 -1.3245,418.5633 h 725.2006 l 5.2983,-482.1426 h -14.5703 v 62.917 z",
      sold: false,
      flatNumber: "12"
    }
  ];

  // Calculate statistics
  const totalFlats = flats.length;
  const soldFlats = flats.filter(flat => flat.sold).length;
  const availableFlats = totalFlats - soldFlats;

  const handleClose = () => onClose();
  
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  // Function to get flat fill color
  const getFlatFillColor = (flat) => {
    return flat.sold ? "#dc2626" : "#d4af37"; // Red for sold, Golden for available
  };

  // Function to calculate approximate center of SVG path for circle positioning
  const getPathCenter = (pathData) => {
    // Extract numbers from the path data
    const numbers = pathData.match(/-?\d+\.?\d*/g);
    if (!numbers || numbers.length < 4) return { x: 2000, y: 1200 };
    
    // Get first few coordinates as approximation
    const coords = numbers.slice(0, 8).map(Number);
    const avgX = coords.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0) / 4;
    const avgY = coords.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0) / 4;
    
    return { x: avgX, y: avgY };
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl max-w-7xl max-h-[95vh] w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              BACK
            </button>
            <div className="text-white">
              <h2 className="text-2xl md:text-3xl font-bold">FLOOR PLAN</h2>
              <p className="text-slate-200 text-sm">
                {totalFlats} flats • {availableFlats} available • {soldFlats} sold
              </p>
            </div>
          </div>
        </div>

        {/* Floor Plan Section */}
        <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 overflow-auto" style={{ height: 'calc(95vh - 180px)' }}>
          
          {/* Container for responsive floor plan */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="relative max-w-full max-h-full">
              {/* Floor Plan Background Image */}
              <img
                src="/floor-plans/floor.webp"
                alt="Floor Plan"
                className="w-[4096px] h-[2896px] max-h-[calc(95vh-240px)] object-contain shadow-xl rounded-lg"
                style={{ minWidth: '800px' }}
              />

              {/* SVG Overlay with Flat Paths */}
              <svg
                viewBox="0 0 4000 2400"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Render each flat's SVG path with color coding */}
                {flats.map((flat) => {
                  const center = getPathCenter(flat.d);
                  return (
                    <g key={flat.id}>
                      {/* Flat SVG Path */}
                      <path
                        d={flat.d}
                        fill={getFlatFillColor(flat)}
                        stroke="#374151"
                        strokeWidth="3"
                        opacity="0.7"
                        className="transition-all duration-200 hover:opacity-90"
                      />
                      
                      {/* White Circle with Flat Number */}
                      <circle
                        cx={center.x}
                        cy={center.y}
                        r="40"
                        fill="white"
                        stroke="#374151"
                        strokeWidth="3"
                        className="drop-shadow-lg"
                      />
                      
                      {/* Flat Number Text */}
                      <text
                        x={center.x}
                        y={center.y + 8}
                        textAnchor="middle"
                        fontSize="28"
                        fontWeight="bold"
                        fill="#374151"
                        fontFamily="Arial, sans-serif"
                      >
                        {flat.flatNumber}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <h4 className="text-sm font-semibold mb-3 text-gray-800">Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 border border-gray-400"></div>
                <span className="text-gray-700">Available ({availableFlats})</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-600 border border-gray-400"></div>
                <span className="text-gray-700">Sold ({soldFlats})</span>
              </div>
            </div>
          </div>

          {/* Floor Info */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="text-2xl font-bold text-gray-800">Floor Plan</div>
            <div className="text-sm text-gray-600">{totalFlats} Total Flats</div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-center items-center text-sm space-x-8">
            <span className="text-gray-700">
              <strong className="text-yellow-600">{availableFlats}</strong> Available
            </span>
            <span className="text-gray-700">
              <strong className="text-red-600">{soldFlats}</strong> Sold
            </span>
            <span className="text-gray-700">
              <strong className="text-blue-600">{Math.round((soldFlats / totalFlats) * 100)}%</strong> Occupancy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
