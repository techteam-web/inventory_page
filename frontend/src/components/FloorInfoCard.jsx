
function FloorInfoCard({ info, onClose }) {
  if (!info) return null;

  return (
    <div className="absolute top-10 right-10 w-80 bg-[#fffde7] shadow-2xl rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">{info.floorNumber}</h2>
        <span className="text-lg text-gray-600">Floor</span>
      </div>
      <div className="text-gray-700">
        <p className="text-lg font-semibold mt-4">{info.price}</p>
        <p className="text-sm text-gray-500">Area: {info.area}</p>
        <p className="text-sm text-gray-500">BHK: {info.bhk}</p>
        <p className="text-sm text-gray-500">Available : {info.availability}</p>
      </div>
    </div>
  );
}
export default FloorInfoCard;