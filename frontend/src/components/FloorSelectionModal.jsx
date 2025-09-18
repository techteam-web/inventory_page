// FloorSelectionModal.jsx
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function FloorSelectionModal({ show, onClose, floors, selectedFloorsForCompare, onFloorSelect, preSelectedFloor=null }) {
  // Smart selection state - max 2 apartment types
  const [selectedFloorsByType, setSelectedFloorsByType] = useState({});
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [hoverHighlight, setHoverHighlight] = useState(null);
  const [hoveredFloor, setHoveredFloor] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({}); // ✅ Added for carousel
  
  const svgRef = useRef(null);
   useEffect(() => {
    if (show && preSelectedFloor) {
      setSelectedFloorsByType({
        [preSelectedFloor.info.bhk]: preSelectedFloor
      });
    } else if (show && !preSelectedFloor) {
      // Clear selections if no pre-selected floor
      setSelectedFloorsByType({});
    }
  }, [show, preSelectedFloor]);

  // Your existing highlight areas
  const HIGHLIGHT_AREAS = {
    wardrobe: {
      name: "Wardrobe Areas",
      activeFill: "rgba(139, 92, 246, 0.60)",
      hoverFill: "rgba(139, 92, 246, 0.50)",
      d: "m 90.723317,145.66639 12.821743,-1.69155 c 0,0 -1.715,0.13584 0.017,0 1.73197,-0.13584 4.87331,0.0509 4.87331,0.0509 l 1.73197,0.20376 0.71317,0.0849 0.62827,0.1698 0.62826,0.22075 0.44149,0.18678 0.32262,0.1698 0.39054,0.28866 0.22074,0.23773 0.0679,0.1698 0.0679,0.27168 0.017,0.37357 0.017,6.77508 c 0,0 0.47544,-0.0849 -0.66223,-0.40752 -1.13767,-0.32263 -3.15831,-0.57733 -3.15831,-0.57733 l -1.17163,-0.11886 -0.96787,-0.034 -5.04311,0.017 -1.25653,0.0509 -0.98485,0.0679 -11.138989,1.20559 0.0849,-7.02979 z"
    },
    terrace: {
      name: "Parking / Terrace",
      activeFill: "rgba(16, 185, 129, 0.60)",
      hoverFill: "rgba(16, 185, 129, 0.50)",
      d: "m 89.378556,154.11918 -0.240136,32.22622 24.78202,0.19211 0.048,-32.99466 c 0,0 1.36877,0.69639 -0.1681,-0.048 -1.53687,-0.74442 -3.45796,-1.10462 -3.45796,-1.10462 l -3.26584,-0.21612 -4.03429,0.12006 -13.807805,1.29674 z"
    },
    skyclub: {
      name: "Sky Club",
      activeFill: "rgba(135, 206, 235, 0.60)",
      hoverFill: "rgba(135, 206, 235, 0.50)",
      d: "m 89.426583,37.749353 13.159447,-5.859315 c 0,0 -2.20925,0.480272 0,0 2.20925,-0.480271 3.74612,-0.288163 3.74612,-0.288163 0,0 -1.87306,-0.288163 0.14408,0.09605 2.01714,0.384217 3.07374,1.00857 3.07374,1.00857 0,0 -1.34476,-0.864489 0.14408,0.04803 1.48884,0.912516 3.65006,3.794146 3.65006,3.794146 L 113.152,36.020375 c 0,0 -0.76843,1.440815 0,0 0.76844,-1.440815 0.81647,-5.379043 0.81647,-5.379043 0,0 0.33619,1.200679 0,0 -0.3362,-1.200679 -0.96055,-2.737549 -0.96055,-2.737549 0,0 0.38422,-0.144081 -0.91251,-1.68095 -1.29674,-1.536869 -3.1698,-2.641494 -3.1698,-2.641494 l -1.777,-0.768435 -1.44082,-0.144081 -1.15265,0.09605 -0.91252,-0.04803 -0.48027,0.09605 -1.20068,0.528299 -11.862706,5.523124 c 0,0 0.240135,-0.624353 -0.720408,1.056598 -0.960543,1.680951 -0.09605,1.921086 -0.09605,1.921086 0,0 -1.056598,-0.576326 -0.192113,0.33619 0.864489,0.912516 1.536869,0.576326 1.440815,0.912516 -0.09605,0.336191 -0.720407,0.336191 -0.144077,1.440816 0.576326,1.104625 -0.816463,1.728978 -0.816463,1.728978"
    }
  };

  // Smart floor selection - max 2 types, update existing type when same type selected
  const handleFloorToggle = (floor) => {
    const apartmentType = floor.info.bhk;
    
    setSelectedFloorsByType(prev => {
      const newState = { ...prev };
      
      // ✅ Check if clicking the SAME floor again (toggle off)
      if (newState[apartmentType]?.id === floor.id) {
        // Remove the apartment type completely
        delete newState[apartmentType];
        return newState;
      }
      
      // ✅ Check if apartment type exists but different floor (update)
      if (newState[apartmentType]) {
        // Update existing apartment type with new floor
        newState[apartmentType] = floor;
      } else {
        // ✅ Add new apartment type (max 2 types total)
        const currentTypes = Object.keys(newState);
        if (currentTypes.length < 2) {
          newState[apartmentType] = floor;
        }
      }
      
      return newState;
    });
    
    // Haptic feedback on mobile
    if ('vibrate' in navigator) navigator.vibrate(30);
  };

  // Remove specific apartment type
  const removeApartmentType = (apartmentType) => {
    setSelectedFloorsByType(prev => {
      const newState = { ...prev };
      delete newState[apartmentType];
      return newState;
    });
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedFloorsByType({});
  };

  // Get selected floors array for SVG highlighting
  const selectedFloorsArray = Object.values(selectedFloorsByType);

  // Get floor fill color for SVG
  const getFloorFillColor = (floor) => {
    const isSelected = selectedFloorsArray.some(f => f.id === floor.id);
    const isCompareSelected = selectedFloorsForCompare.some(f => f.id === floor.id);
    const isHovered = hoveredFloor === floor.id;
    const apartmentType = floor.info.bhk;
    
    // Get base color based on apartment type
    const getTypeColor = (type, opacity = 0.4) => {
      if (type === 'Duplex') {
        return `rgba(102,153,204, ${opacity})`;  // Duplex bluergb(102,153,204)
      }
      if (type === 'Duplex-R') {
        return `rgba(245,245,245, ${opacity})`;  // Duplex-R lighter blue
      }
      return `rgba(0, 0, 0, 0.22)`; // Default
    };
    
    // Hover effect (highest priority)
    if (isHovered && !isSelected) {
      return getTypeColor(apartmentType, 0.3); // Lighter on hover
    }
    
    // Selected floors
    if (isSelected) {
      return getTypeColor(apartmentType, 0.7); // Darker when selected
    }
    
    // Compare selection
    if (isCompareSelected) {
      return "rgba(59, 130, 246, 0.6)"; // Blue for compare selection
    }
    
    // Default state - show apartment type color
    return getTypeColor(apartmentType, 0.4);
  };

  // Render category overlays
  const renderCategoryOverlays = () => {
    const keys = ['wardrobe', 'terrace', 'skyclub'];
    return keys.map(key => {
      const area = HIGHLIGHT_AREAS[key];
      if (!area) return null;

      let fill = "rgba(0,0,0,0.10)";
      if (activeHighlight === key) fill = area.activeFill;
      else if (hoverHighlight === key) fill = area.hoverFill;

      return (
        <path
          key={`cat-${key}`}
          d={area.d}
          fill={fill}
          className="cursor-pointer transition-all duration-200"
          onMouseEnter={() => setHoverHighlight(key)}
          onMouseLeave={() => setHoverHighlight(null)}
          onClick={() => setActiveHighlight(activeHighlight === key ? null : key)}
        />
      );
    });
  };

  // ✅ Updated to return multiple images per apartment type
  const getFloorPlanImages = (apartmentType) => {
    const floorPlans = {
      'Duplex': ['/floor-plans/Duplex1.webp', '/floor-plans/Duplex2.webp'],
      'Duplex-R': ['/floor-plans/DuplexR1.webp', '/floor-plans/DuplexR2.webp']
    };
    return floorPlans[apartmentType] || ['/floor-plans/default-plan.webp'];
  };

  if (!show) return null;

  const selectedTypes = Object.keys(selectedFloorsByType);
  const hasSelections = selectedTypes.length > 0;

  return createPortal(
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-10 flex items-center justify-center z-50" style={{ fontFamily: 'Spectra, sans-serif' }}>
      <div className="bg-[#d9d4c7] w-full h-full overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center hover:opacity-75 transition-opacity cursor-pointer"
        >
          <svg 
            className="w-6 h-6"
            viewBox="0 0 62 61" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_1461_82)">
              <mask id="mask0_1461_82" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="62" height="61">
                <path d="M62 0H0V61H62V0Z" fill="white"/>
              </mask>
              <g mask="url(#mask0_1461_82)">
                <mask id="mask1_1461_82" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="62" height="61">
                  <path d="M62 0H0V61H62V0Z" fill="white"/>
                </mask>
                <g mask="url(#mask1_1461_82)">
                  <path d="M4.41868 13.4353C7.17126 10.3908 17.3193 0.483957 31.5349 1.02102C35.2784 1.16397 45.6829 1.26864 53.6347 11.6194C55.5004 14.0497 61.5193 21.8968 60.9994 32.0428C60.1981 47.6404 44.2546 59.1542 31.0024 59.9539C21.6345 60.518 10.5111 55.9164 4.63583 45.3647C3.3513 43.0465 0.867865 38.3599 1.00549 32.0428C1.19511 23.2413 6.41277 14.9847 14.3555 10.3676" stroke="#030201" strokeWidth="0.831797" strokeMiterlimit="10"/>
                </g>
              </g>
              <path d="M17.0973 16.0673L17.43 16.2742L17.4968 16.3391L18.1604 16.9249L19.2386 17.9315L19.5791 18.2794L19.9117 18.627L20.5783 19.2988L20.9275 19.6314L21.2762 19.9718L21.9875 20.6843L22.3197 21.0397L22.6602 21.3876L23.2847 21.972L24.0325 22.592L24.8145 23.2991L25.1554 23.6392L25.5041 23.9796L26.201 24.6681L26.8828 25.3483L27.5651 26.0207L28.2625 26.7015C28.4999 26.9332 28.7356 27.1673 28.9664 27.4059L29.3064 27.7616L29.6391 28.1092L30.2996 28.7496L30.6488 29.0822L31.0057 29.415L31.7118 30.0804L32.0688 30.4133L32.4179 30.7458C32.643 30.9583 32.8763 31.1687 33.1105 31.3717L33.8418 32.0067C34.108 32.2374 34.3626 32.4834 34.6069 32.7367L34.9473 33.0846L35.28 33.4323L35.9605 34.1359L36.2931 34.4835L36.6336 34.8314L37.2794 35.4556L37.6372 35.7729L38.0024 36.0982L38.7523 36.8198L39.0928 37.1677L39.4254 37.5154L40.0925 38.1794L40.4416 38.512L40.7903 38.8524L41.4678 39.4699L42.1991 40.1049L42.9576 40.8112L43.3063 41.1516L43.6472 41.4917L44.3364 42.18L44.6851 42.5203L45.026 42.8604C45.2506 43.0839 45.4352 43.2669 45.5825 43.4034L45.8206 43.6227L46.2226 43.9884L46.2374 44.0045L46.3115 44.0774L46.5284 44.3976C46.6788 44.754 46.6097 45.1831 46.3192 45.4845C46.0273 45.7861 45.5966 45.8737 45.2334 45.7359L44.9007 45.529L44.8491 45.4725L44.4475 45.099L44.4397 45.0987L44.2016 44.8794C44.0326 44.7228 43.8325 44.5266 43.6005 44.2958L43.2522 43.9477L42.9113 43.6076L42.2217 42.9271L41.8808 42.587L41.5321 42.2466L40.8702 41.6296L40.5046 41.3121L40.1394 40.9868L39.38 40.2961L39.0308 39.9635L38.6821 39.6232L37.9782 38.9187L37.6377 38.5708L37.3051 38.2232L36.6515 37.5987L36.2859 37.2812L35.9285 36.9561L35.1708 36.2342L34.8381 35.8866L34.4981 35.5309L33.825 34.8354L33.4923 34.4877L33.1518 34.1398C32.9479 33.9282 32.7353 33.7242 32.513 33.5315L31.7817 32.8964C31.5268 32.6755 31.2747 32.4451 31.0297 32.2138L30.6727 31.881L30.3236 31.5484L29.6175 30.883L29.2679 30.5582L28.911 30.2254L28.184 29.5123L27.8514 29.1647L27.5114 28.809C27.2937 28.5839 27.0683 28.3635 26.8443 28.1449L26.5034 27.8048L26.1547 27.4645L25.4577 26.7759L25.109 26.4356L24.0863 25.4153L23.7376 25.0749L23.3967 24.7348L22.7336 24.1412L21.9858 23.5212L21.1978 22.7826L20.8573 22.4347L20.5251 22.0793L19.8658 21.4155L19.5167 21.083L19.168 20.7426L18.4641 20.0382L18.1236 19.6903L17.7909 19.3426L16.809 18.4332L16.1233 17.8232L16.0938 17.7909L16.0192 17.7258L15.8024 17.4056C15.6509 17.0483 15.7199 16.6128 16.012 16.3109C16.304 16.0105 16.7347 15.9295 17.0973 16.0673Z" fill="black"/>
              <path d="M46.2416 18.1678L46.0184 18.4818L45.9784 18.5252L45.3352 19.1584L44.2877 20.1561L43.9298 20.4687L43.5706 20.7736L42.8768 21.3887L42.5203 21.709L42.1715 22.0284L41.4286 22.6801L41.0617 22.9858L40.7025 23.2907L40.0902 23.8735L39.77 24.2213L39.442 24.5699C39.2083 24.8205 38.9656 25.0618 38.711 25.2908L38.3544 25.6111L38.0043 25.9229L37.2835 26.5643L36.9333 26.8761L36.5768 27.1964L35.8766 27.8199L35.52 28.1402L35.1712 28.4597L34.4348 29.1028L34.0769 29.4154L33.71 29.7211C33.4807 29.9166 33.2567 30.1193 33.0382 30.326L32.6907 30.6531L32.351 30.9795L30.9611 32.2882L30.3102 32.9222L29.6516 33.604C29.4107 33.8509 29.1578 34.0883 28.8946 34.312L28.5276 34.6177L28.1685 34.9226L27.4436 35.541L27.0767 35.8467L26.7188 36.1593L26.069 36.7539L25.3922 37.422C25.1525 37.6611 24.9056 37.8924 24.6482 38.113L24.2825 38.4264L23.9247 38.739L23.2374 39.3455L22.8808 39.6658L22.532 39.9853L21.8875 40.6107L21.5582 40.9517L21.2211 41.2934L20.4939 41.9904L20.1374 42.3107L19.7795 42.6233L19.0651 43.2562L18.7163 43.5757L18.3584 43.8883L17.9334 44.2708L17.8469 44.3662L17.7061 44.5145L17.6648 44.5503L17.5898 44.621C17.1953 44.981 16.5588 44.9392 16.1662 44.5298C15.7737 44.1202 15.7729 43.4969 16.1649 43.1342L16.2398 43.0635L16.2476 43.0626L16.3406 42.9586L16.347 42.9501L16.3548 42.9493L16.4555 42.8444C16.5482 42.7518 16.7224 42.5894 16.9541 42.3835L17.312 42.0709L17.6686 41.7506L18.3752 41.1186L18.7331 40.806L19.0819 40.4865L19.729 39.8764L20.0583 39.5355L20.3954 39.1938L21.1148 38.4976L21.8124 37.8587L22.5475 37.2079L22.9054 36.8953L23.2724 36.5895L23.9208 35.9872L24.2514 35.654L24.5898 35.3199L25.3417 34.6281L25.7073 34.3147L26.0665 34.0098L26.7913 33.3915L27.1583 33.0858L27.5162 32.7732C27.7359 32.5864 27.9506 32.394 28.1517 32.1879L28.481 31.8469L28.8181 31.5052L29.522 30.8107L29.8695 30.4835L30.2183 30.164L30.9054 29.5105L31.2529 29.1833L31.5926 28.857C31.8341 28.6286 32.0873 28.4052 32.3406 28.1892L32.6998 27.8843L33.0577 27.5717L33.7528 26.9643L34.1093 26.644L34.4581 26.3246L35.1712 25.684L35.887 25.0588L36.5936 24.4267L36.9424 24.1072L37.3003 23.7946C37.5155 23.6011 37.7173 23.3922 37.915 23.1802L38.571 22.4829L39.3409 21.7579L39.6988 21.4453L40.0657 21.1395L40.7543 20.5408L41.1031 20.2213L41.4597 19.901L42.187 19.251L42.5449 18.9384L42.9119 18.6327L43.8574 17.7321L44.4915 17.092L44.5044 17.075L44.5264 17.0648L44.5948 17.0026L44.9245 16.8028C45.289 16.6784 45.7212 16.7786 46.0171 17.0862C46.3113 17.393 46.3879 17.8201 46.2416 18.1678Z" fill="black"/>
            </g>
            <defs>
              <clipPath id="clip0_1461_82">
                <rect width="62" height="61" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </button>

        {/* Main Content - Fullscreen */}
        <div className="flex h-full bg-[#d9d4c7]">
          
          {/* Left Panel - Floor Plan Comparison */}
          <div className="w-2/3 bg-gray-50 border-black overflow-y-auto">
            <div className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Floor Plan Comparison</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {selectedTypes.length}/2 apartment types
                  </span>
                  {hasSelections && (
                    <button
                      onClick={clearAllSelections}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {hasSelections ? (
                <div className="min-h-0">
                  {/* Floor Plans Grid - ✅ Responsive: vertical on small screens */}
                  <div className={`grid gap-6 h-full ${selectedTypes.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {selectedTypes.map(apartmentType => {
                      const floor = selectedFloorsByType[apartmentType];
                      const images = getFloorPlanImages(apartmentType);
                      const currentIndex = currentImageIndex[apartmentType] || 0;
                      
                      return (
                        <div key={apartmentType} className="bg-[#d9d4c7] shadow-sm relative overflow-hidden flex flex-col"> {/* ✅ Added flex flex-col */}
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeApartmentType(apartmentType)}
                            className="absolute top-2 right-2 w-6 h-6 hover:opacity-75 transition-opacity cursor-pointer z-10"
                            aria-label={`Remove ${apartmentType}`}
                          >
                            <svg 
                              className="w-full h-full"
                              viewBox="0 0 62 61" 
                              fill="none" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g clipPath="url(#clip0_1461_82)">
                                <path d="M17.0973 16.0673L17.43 16.2742L17.4968 16.3391L18.1604 16.9249L19.2386 17.9315L19.5791 18.2794L19.9117 18.627L20.5783 19.2988L20.9275 19.6314L21.2762 19.9718L21.9875 20.6843L22.3197 21.0397L22.6602 21.3876L23.2847 21.972L24.0325 22.592L24.8145 23.2991L25.1554 23.6392L25.5041 23.9796L26.201 24.6681L26.8828 25.3483L27.5651 26.0207L28.2625 26.7015C28.4999 26.9332 28.7356 27.1673 28.9664 27.4059L29.3064 27.7616L29.6391 28.1092L30.2996 28.7496L30.6488 29.0822L31.0057 29.415L31.7118 30.0804L32.0688 30.4133L32.4179 30.7458C32.643 30.9583 32.8763 31.1687 33.1105 31.3717L33.8418 32.0067C34.108 32.2374 34.3626 32.4834 34.6069 32.7367L34.9473 33.0846L35.28 33.4323L35.9605 34.1359L36.2931 34.4835L36.6336 34.8314L37.2794 35.4556L37.6372 35.7729L38.0024 36.0982L38.7523 36.8198L39.0928 37.1677L39.4254 37.5154L40.0925 38.1794L40.4416 38.512L40.7903 38.8524L41.4678 39.4699L42.1991 40.1049L42.9576 40.8112L43.3063 41.1516L43.6472 41.4917L44.3364 42.18L44.6851 42.5203L45.026 42.8604C45.2506 43.0839 45.4352 43.2669 45.5825 43.4034L45.8206 43.6227L46.2226 43.9884L46.2374 44.0045L46.3115 44.0774L46.5284 44.3976C46.6788 44.754 46.6097 45.1831 46.3192 45.4845C46.0273 47.7861 45.5966 45.8737 45.2334 45.7359L44.9007 45.529L44.8491 45.4725L44.4475 45.099L44.4397 45.0987L44.2016 44.8794C44.0326 44.7228 43.8325 44.5266 43.6005 44.2958L43.2522 43.9477L42.9113 43.6076L42.2217 42.9271L41.8808 42.587L41.5321 42.2466L40.8702 41.6296L40.5046 41.3121L40.1394 40.9868L39.38 40.2961L39.0308 39.9635L38.6821 39.6232L37.9782 38.9187L37.6377 38.5708L37.3051 38.2232L36.6515 37.5987L36.2859 37.2812L35.9285 36.9561L35.1708 36.2342L34.8381 35.8866L34.4981 35.5309L33.825 34.8354L33.4923 34.4877L33.1518 34.1398C32.9479 33.9282 32.7353 33.7242 32.513 33.5315L31.7817 32.8964C31.5268 32.6755 31.2747 32.4451 31.0297 32.2138L30.6727 31.881L30.3236 31.5484L29.6175 30.883L29.2679 30.5582L28.911 30.2254L28.184 29.5123L27.8514 29.1647L27.5114 28.809C27.2937 28.5839 27.0683 28.3635 26.8443 28.1449L26.5034 27.8048L26.1547 27.4645L25.4577 26.7759L25.109 26.4356L24.0863 25.4153L23.7376 25.0749L23.3967 24.7348L22.7336 24.1412L21.9858 23.5212L21.1978 22.7826L20.8573 22.4347L20.5251 22.0793L19.8658 21.4155L19.5167 21.083L19.168 20.7426L18.4641 20.0382L18.1236 19.6903L17.7909 19.3426L16.809 18.4332L16.1233 17.8232L16.0938 17.7909L16.0192 17.7258L15.8024 17.4056C15.6509 17.0483 15.7199 16.6128 16.012 16.3109C16.304 16.0105 16.7347 15.9295 17.0973 16.0673Z" fill="black"/>
                              </g>
                            </svg>
                          </button>

                          {/* Floor Plan Header */}
                          <div className="p-4 border-b border-gray-200 flex-shrink-0">
                            <h4 className="font-bold text-[#d0aa2d] text-xl uppercase tracking-wide">{apartmentType}</h4>
                            <p className="text-sm text-gray-600 mt-1">Floor {floor.info.floorNumber}</p>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                              <span>{floor.info.price}</span>
                              <span>{floor.info.area}</span>
                              <span className={`px-2 py-1 rounded-full ${
                                floor.info.availability?.toLowerCase() === "true"
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {floor.info.availability?.toLowerCase() === "true" ? 'Available' : 'Sold'}
                              </span>
                            </div>
                          </div>

                          {/* Floor Plan Image Carousel - ✅ Fixed spacing, full container fit */}
                          <div className="relative bg-gray-100 flex-1 min-h-0">
                            <img
                              src={images[currentIndex]}
                              alt={`${apartmentType} Floor Plan - Image ${currentIndex + 1}`}
                              className="w-full h-full object-contain" // ✅ Removed padding for full fit
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = '/floor-plans/placeholder-plan.webp';
                              }}
                            />
                            
                            {/* Carousel Controls - Only show if multiple images */}
                            {images.length > 1 && (
                              <>
                                {/* Previous Button */}
                                <button
                                  onClick={() => setCurrentImageIndex(prev => ({
                                    ...prev,
                                    [apartmentType]: currentIndex > 0 ? currentIndex - 1 : images.length - 1
                                  }))}
                                  className="absolute left-2 top-1/2 transform -translate-y-1/2 backdrop-blur-md bg-opacity-50 text-[#d0aa2d] w-8 h-8 rounded-full flex items-center justify-center hover:bg-opacity-75 transition-opacity cursor-pointer"
                                >
                                  <span className="text-lg">‹</span>
                                </button>
                                
                                {/* Next Button */}
                                <button
                                  onClick={() => setCurrentImageIndex(prev => ({
                                    ...prev,
                                    [apartmentType]: currentIndex < images.length - 1 ? currentIndex + 1 : 0
                                  }))}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 backdrop-blur-md bg-opacity-50 text-[#d0aa2d] w-8 h-8 rounded-full flex items-center justify-center hover:bg-opacity-75 transition-opacity cursor-pointer"
                                >
                                  <span className="text-lg">›</span>
                                </button>
                                
                                {/* Dot Indicators */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                  {images.map((_, index) => (
                                    <button
                                      key={index}
                                      onClick={() => setCurrentImageIndex(prev => ({
                                        ...prev,
                                        [apartmentType]: index
                                      }))}
                                      className={`w-3 h-3 rounded-full transition-colors ${
                                        index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">Select Apartment Types to Compare</h4>
                  <p className="text-gray-500 max-w-md">
                    Click on floors in the building to view their apartment types. 
                    You can compare up to 2 different apartment types (Duplex vs Duplex-R).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Building Visualization */}
          <div className="w-1/3 flex flex-col">
            <div className="h-full p-4">
              <div className="h-full flex flex-col">
                
                {/* Building SVG */}
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <svg
                    ref={svgRef}
                    viewBox="0 0 377 210.92149"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    {/* Background image */}
                    <image
                      href="/building.svg"
                      x="0" y="0"
                      width="381.7"
                      height="210.92149"
                      preserveAspectRatio="xMidYMid slice"
                    />

                    {/* Category overlays */}
                    <g transform="translate(86,0)">
                      {renderCategoryOverlays()}
                    </g>

                    {/* Floor paths */}
                    <g transform="translate(85,0)">
                      {floors.map((floor) => (
                        <path
                          key={floor.id}
                          id={floor.id}
                          d={floor.d}
                          fill={getFloorFillColor(floor)}
                          className="cursor-pointer transition-colors duration-200"
                          onMouseEnter={() => {
                            const isMobile = window.matchMedia('(hover:none)').matches;
                            if (!isMobile) setHoveredFloor(floor.id);
                          }}
                          onMouseLeave={() => {
                            const isMobile = window.matchMedia('(hover:none)').matches;
                            if (!isMobile) setHoveredFloor(null);
                          }}
                          onClick={() => handleFloorToggle(floor)}
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
