import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import "../App.css";

export default function Navbar({ onSelect, selectedUnit, showFloorPlans }) {
  const [unitsExpanded, setUnitsExpanded] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const [currentFloor, setCurrentFloor] = useState("1");
  const [animationState, setAnimationState] = useState('idle');
  
  const unitsBtnRef = useRef(null);
  const itemRefs = useRef([]);
  const unitRefs = useRef([]);

  const floors = [
    { id: "1", label: "Wardrobe" },
    { id: "2", label: "Floor-Plan" },
    { id: "3", label: "Units" },
    { id: "4", label: "Terrace" },
  ];
  
  const unitNumbers = [1, 2, 3, "Studio"];

  // Simplified, smoother hover animations
  const handleMouseEnter = (e) => {
    if (animationState !== 'idle') return;
    
    const target = e.currentTarget;
    gsap.to(target, {
      scale: 1.05,
      y: -1,
      duration: 0.25,
      ease: "power2.out" // Simpler, smoother easing
    });
  };

  const handleMouseLeave = (e) => {
    const target = e.currentTarget;
    gsap.to(target, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  // Enhanced click handlers
  const handleUnitsExpand = (e) => {
    e.preventDefault();
    if (animationState !== 'idle') return;
    
    setAnimationState('expanding');
    setUnitsExpanded(true);
    setTimeout(() => setAnimationState('idle'), 800);
  };

  const handleUnitsCollapse = (e) => {
    e.preventDefault();
    if (animationState !== 'idle') return;
    
    setAnimationState('collapsing');
    setCollapsing(true);
  };

  // Updated floor selection handler
  const handleFloorSelect = (floorId, e) => {
    e.preventDefault();
    if (animationState !== 'idle') return;
    
    setCurrentFloor(floorId);
    
    // Handle Floor-Plan selection
    if (floorId === "2") {
      onSelect("floorPlan", true);
    }
    // Handle other floor selections - you can extend this as needed
    else {
      // Reset floor plan mode when other items are selected
      if (showFloorPlans) {
        onSelect("floorPlan", false);
      }
    }
  };

  const handleUnitSelect = (unitNum, e) => {
    e.preventDefault();
    if (animationState !== 'idle') return;
    
    onSelect("unit", unitNum.toString());
  };

  // Keyboard navigation
  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action(e);
    }
  };

  useEffect(() => {
    // SMOOTHER initial state animation
    if (!unitsExpanded && !collapsing && animationState === 'idle') {
      itemRefs.current.forEach((ref, idx) => {
        if (ref) {
          gsap.fromTo(ref,
            { 
              opacity: 0, 
              y: 20, 
              scale: 0.9
            },
            {
              y: 0,
              scale: 1,
              opacity: 1,
              duration: 0.6,
              pointerEvents: "auto",
              ease: "power3.out", // Smoother easing
              delay: idx * 0.08
            }
          );
        }
      });
    } 
    // SMOOTHER expanding animation
    else if (unitsExpanded && !collapsing) {
      const tl = gsap.timeline();
      
      // Phase 1: Hide other items smoothly
      itemRefs.current.forEach((ref, idx) => {
        if (ref && ref !== unitsBtnRef.current) {
          tl.to(ref, {
            opacity: 0,
            scale: 0.9,
            y: -10,
            duration: 0.3,
            pointerEvents: "none",
            ease: "power2.inOut"
          }, idx * 0.02);
        }
      });
      
      // Phase 2: Move Units button smoothly
      if (unitsBtnRef.current) {
        tl.to(unitsBtnRef.current, {
          x: 120,
          scale: 1.08,
          boxShadow: "0 8px 25px rgba(207,178,132,0.3)",
          duration: 0.5,
          ease: "power3.out" // Smooth, natural easing
        }, 0.2);
      }
      
      // Phase 3: Show unit numbers with smooth stagger
      tl.add(() => {
        unitRefs.current.forEach((ref, idx) => {
          if (ref) {
            gsap.fromTo(ref,
              { 
                y: 25, 
                opacity: 0, 
                scale: 0.8
              },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "power3.out",
                delay: idx * 0.08
              }
            );
          }
        });
      }, "-=0.2");
    } 
    // SMOOTHER collapsing animation
    else if (collapsing) {
      const tl = gsap.timeline({
        onComplete: () => {
          setUnitsExpanded(false);
          setCollapsing(false);
          setAnimationState('idle');
          
          // Clean reset
          if (unitsBtnRef.current) {
            gsap.set(unitsBtnRef.current, { 
              x: 0, 
              scale: 1, 
              boxShadow: "none"
            });
          }
          unitRefs.current.forEach(ref => {
            if (ref) gsap.set(ref, { 
              y: 0, 
              opacity: 1, 
              scale: 1
            });
          });
        }
      });

      // Phase 1: Hide unit numbers smoothly
      unitRefs.current.forEach((ref, idx) => {
        if (ref) {
          tl.to(ref, {
            y: 30,
            opacity: 0,
            scale: 0.7,
            duration: 0.4,
            ease: "power2.in"
          }, idx * 0.05);
        }
      });

      // Phase 2: Move Units button back smoothly
      if (unitsBtnRef.current) {
        tl.to(unitsBtnRef.current, {
          x: 0,
          scale: 1,
          boxShadow: "none",
          duration: 0.6,
          ease: "power3.out" // Consistent smooth easing
        }, 0.3);
      }

      // Phase 3: Show other items smoothly
      itemRefs.current.forEach((ref, idx) => {
        if (ref && ref !== unitsBtnRef.current) {
          tl.fromTo(ref,
            { 
              opacity: 0, 
              y: -10, 
              scale: 0.9
            },
            {
              y: 0,
              scale: 1,
              opacity: 1,
              duration: 0.5,
              pointerEvents: "auto",
              ease: "power3.out"
            }, 0.4 + (idx * 0.06)
          );
        }
      });
    }
  }, [unitsExpanded, collapsing, animationState]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[70%] h-[50px] bg-black/50 backdrop-blur-sm rounded-lg shadow-lg border border-white/10">
        <div className="flex justify-between items-end h-full">
          
          {/* Floor Items or Units Expanded */}
          {!unitsExpanded ? (
            floors.map((floor, idx) => (
              <div
                key={floor.id}
                ref={floor.id === "3" ? unitsBtnRef : el => itemRefs.current[idx] = el}
                className={`flex-1 flex flex-col items-center justify-end text-center cursor-pointer transition-all duration-300 ${
                  // Highlight Floor-Plan when in floor-plan mode OR when it's the current floor
                  (currentFloor === floor.id) || (floor.id === "2" && showFloorPlans)
                    ? "font-bold text-[#CFB284] drop-shadow-[0_0_12px_rgba(207,178,132,0.4)]" 
                    : "text-[#DFCAA0] hover:text-[#E8D4B0]"
                } ${animationState !== 'idle' ? 'pointer-events-none' : ''}`}
                data-id={floor.id}
                role="button"
                tabIndex={0}
                aria-label={`Navigate to ${floor.label}`}
                aria-pressed={(currentFloor === floor.id) || (floor.id === "2" && showFloorPlans)}
                style={{ 
                  flexBasis: "150%",
                  filter: (currentFloor === floor.id) || (floor.id === "2" && showFloorPlans) ? 'brightness(1.15)' : 'brightness(1)',
                  willChange: 'transform, opacity' // Hardware acceleration
                }}
                onClick={floor.id === "3" ? handleUnitsExpand : (e) => handleFloorSelect(floor.id, e)}
                onKeyDown={(e) => handleKeyDown(e, floor.id === "3" ? handleUnitsExpand : (e) => handleFloorSelect(floor.id, e))}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <a 
                  href={floor.id === "3" ? "#" : "/ui"} 
                  className="m-1 text-[clamp(14px,2vw,22px)] font-[Gotham-Office] relative"
                  onClick={e => e.preventDefault()}
                >
                  {floor.label}
                  {/* Show active indicator for current floor OR when Floor-Plan is active */}
                  {((currentFloor === floor.id) || (floor.id === "2" && showFloorPlans)) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#CFB284] rounded-full shadow-[0_0_8px_rgba(207,178,132,0.6)] animate-pulse" />
                  )}
                </a>
              </div>
            ))
          ) : (
            <>
              {/* Units button in expanded state */}
              <div
                className={`flex-1 flex flex-col items-center justify-end text-center cursor-pointer font-bold text-[#CFB284] transition-all duration-200 ${
                  animationState !== 'idle' ? 'pointer-events-none' : ''
                }`}
                ref={unitsBtnRef}
                data-id="3"
                role="button"
                tabIndex={0}
                aria-label="Collapse units menu"
                style={{ 
                  flexBasis: "80%", 
                  marginRight: "40px",
                  filter: 'brightness(1.15) drop-shadow(0 0 12px rgba(207,178,132,0.4))',
                  willChange: 'transform, opacity'
                }}
                onClick={handleUnitsCollapse}
                onKeyDown={(e) => handleKeyDown(e, handleUnitsCollapse)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <a
                  href="#"
                  className="m-1 text-[clamp(14px,2vw,22px)] font-[Gotham-Office] relative"
                  onClick={e => e.preventDefault()}
                >
                  Units
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#CFB284] rounded-full shadow-[0_0_8px_rgba(207,178,132,0.6)] animate-pulse" />
                </a>
              </div>
              
              {/* Unit numbers */}
              {unitNumbers.map((num, idx) => (
                <div
                  key={num}
                  ref={el => unitRefs.current[idx] = el}
                  className={`flex-1 flex flex-col items-center justify-end text-center cursor-pointer transition-all duration-200 ${
                    selectedUnit === num.toString() 
                      ? "font-bold text-[#CFB284] drop-shadow-[0_0_8px_rgba(207,178,132,0.3)]" 
                      : "text-[#DFCAA0] hover:text-[#E8D4B0]"
                  } ${animationState !== 'idle' ? 'pointer-events-none' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select unit ${num}`}
                  aria-pressed={selectedUnit === num.toString()}
                  style={{ 
                    flexBasis: "80%", 
                    marginLeft: idx === 0 ? "25px" : "5px",
                    filter: selectedUnit === num.toString() ? 'brightness(1.1)' : 'brightness(1)',
                    willChange: 'transform, opacity'
                  }}
                  onClick={(e) => handleUnitSelect(num, e)}
                  onKeyDown={(e) => handleKeyDown(e, (e) => handleUnitSelect(num, e))}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <a
                    href="#"
                    className="m-1 text-[clamp(14px,2vw,22px)] font-[Gotham-Office] relative"
                    onClick={e => e.preventDefault()}
                  >
                    {num}
                    {selectedUnit === num.toString() && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#CFB284] rounded-full shadow-[0_0_8px_rgba(207,178,132,0.6)] animate-pulse" />
                    )}
                  </a>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
