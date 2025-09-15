function FloorInfoCard({ info, onClose }) {
  if (!info) return null;

  return (
    <div
      className="
        absolute
        right-4 top-4
        sm:right-6 sm:top-6
        md:right-10 md:top-10
        z-20
       
      "
    >
      <div
        className="
          w-[86vw] max-w-sm
          sm:w-80 sm:max-w-none
          bg-[#fffde7]
          shadow-2xl
          rounded-xl
          p-4 sm:p-5 md:p-6
          border border-yellow-100
        "
        style={{ fontFamily: 'Gotham-Office, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-baseline justify-between mb-3 sm:mb-4">
          <h2
            className="font-light text-gray-900"
            style={{
              fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', // ~20px → ~28px
              lineHeight: 1.1,
              fontFamily: 'Gotham-Office, sans-serif'
            }}
          >
           Floor {info.floorNumber}
          </h2>
        
        </div>

        {/* Body */}
        <div className="text-gray-700 space-y-2">
          <p
            className="font-light text-gray-900"
            style={{ 
              fontSize: 'clamp(1rem, 2.2vw, 1.125rem)',
              fontFamily: 'Gotham-Office, sans-serif'
            }} // 16px → 18px
          >
            {info.price}
          </p>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
            <p
              className="text-gray-600"
              style={{ 
                fontSize: 'clamp(0.8125rem, 1.6vw, 0.9375rem)',
                fontFamily: 'Gotham-Office, sans-serif'
              }} // 13px → 15px
            >
              Area: <span className="text-gray-800">{info.area}</span>
            </p>
            <p
              className="text-gray-600"
              style={{ 
                fontSize: 'clamp(0.8125rem, 1.6vw, 0.9375rem)',
                fontFamily: 'Gotham-Office, sans-serif'
              }}
            >
              Type: <span className="text-gray-800">{info.bhk}</span>
            </p>
            <p
              className="text-gray-600 sm:col-span-2"
              style={{ 
                fontSize: 'clamp(0.8125rem, 1.6vw, 0.9375rem)',
                fontFamily: 'Gotham-Office, sans-serif'
              }}
            >
              
              <span
                className={
                  (info.availability?.toString().toLowerCase() === "true"
                    ? "text-green-700"
                    : "text-red-700") + " font-medium"
                }
              >
                {info.availability?.toString().toLowerCase() === "true"
                  ? "For Sale"
                  : "Sold Out"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default FloorInfoCard;
