const fs = require('fs');
const floorsData = [
   {
      "id":"floor1",
      "d":"m 919.13325,797.35964 108.27955,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02594,38.42173 z",
      "info":{
         "floorNumber":1,
         "price":"From 18,000,000 ₹",
         "area":"28–45 m²",
         "bhk":"1",
         "availability":"true",
         "floor-plan":"/floor-plans/floor.jpg"
      }
   },
   {
      "id":"floor2",
      "d":"m 917.98965,780.86158 108.27955,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02594,38.42173 z",
      "info":{
         "floorNumber":2,
         "price":"From 18,500,000 ₹",
         "area":"30–50 m²",
         "bhk":"1",
         "availability":"false"
      }
   },
   {
      "id":"floor3",
      "d":"m 920.27684,764.43079 108.27956,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02595,38.42173 z",
      "info":{
         "floorNumber":3,
         "price":"From 19,000,000 ₹",
         "area":"32–55 m²",
         "bhk":"1",
         "availability":"true"
      }
   },
   {
      "id":"floor4",
      "d":"m 918.04269,746.98577 108.27951,-41.56533 84.5278,27.94308 v 13.27296 L 1027.7193,721.837 917.6934,760.25873 Z",
      "info":{
         "floorNumber":4,
         "price":"From 19,500,000 ₹",
         "area":"35–55 m²",
         "bhk":"1",
         "availability":"true"
      }
   },
   {
      "id":"floor5",
      "d":"m 918.80337,728.87581 108.27953,-41.56533 84.5278,27.94308 v 13.27296 L 1028.48,703.72704 918.45408,742.14877 Z",
      "info":{
         "floorNumber":5,
         "price":"From 20,000,000 ₹",
         "area":"36–57 m²",
         "bhk":"1",
         "availability":"false"
      }
   },
   {
      "id":"floor6",
      "d":"m 917.31048,711.06727 108.27952,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02591,38.42173 z",
      "info":{
         "floorNumber":6,
         "price":"From 20,500,000 ₹",
         "area":"38–58 m²",
         "bhk":"1",
         "availability":"true",
         "floor-plan":"/floor-plans/floor.jpg"
      }
   },
   {
      "id":"floor7",
      "d":"m 917.87064,693.60802 108.27946,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02585,38.42173 z",
      "info":{
         "floorNumber":7,
         "price":"From 21,000,000 ₹",
         "area":"40–60 m²",
         "bhk":"1",
         "availability":"false"
      }
   },
   {
      "id":"floor8",
      "d":"m 917.54981,676.38293 108.27949,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02588,38.42173 z",
      "info":{
         "floorNumber":8,
         "price":"From 21,500,000 ₹",
         "area":"42–62 m²",
         "bhk":"1",
         "availability":"true"
      }
   },
   {
      "id":"floor9",
      "d":"m 918.54981,658.12937 108.27949,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02588,38.42173 z",
      "info":{
         "floorNumber":9,
         "price":"From 22,000,000 ₹",
         "area":"45–65 m²",
         "bhk":"1",
         "availability":"true"
      }
   },
   {
      "id":"floor10",
      "d":"m 918.27943,639.89651 108.27947,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02586,38.42173 z",
      "info":{
         "floorNumber":10,
         "price":"From 22,500,000 ₹",
         "area":"46–66 m²",
         "bhk":"1",
         "availability":"false"
      }
   },
   {
      "id":"floor11",
      "d":"m 918.10358,621.45669 108.27949,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02588,38.42173 z",
      "info":{
         "floorNumber":11,
         "price":"From 23,000,000 ₹",
         "area":"48–68 m²",
         "bhk":"2",
         "availability":"true",
         "floor-plan":"/floor-plans/floor.jpg"
      }
   },
   {
      "id":"floor12",
      "d":"m 918.99128,603.10491 108.27952,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.0259,38.42173 z",
      "info":{
         "floorNumber":12,
         "price":"From 23,500,000 ₹",
         "area":"50–70 m²",
         "bhk":"2",
         "availability":"false"
      }
   },
   {
      "id":"floor13",
      "d":"m 918.17994,585.09022 108.27956,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02596,38.42173 z",
      "info":{
         "floorNumber":13,
         "price":"From 24,000,000 ₹",
         "area":"52–72 m²",
         "bhk":"2",
         "availability":"true"
      }
   },
   {
      "id":"floor14",
      "d":"m 918.89438,566.82772 108.2795,-41.56533 84.52782,27.94308 v 13.27296 l -83.13072,-24.79948 -110.02588,38.42173 z",
      "info":{
         "floorNumber":14,
         "price":"From 24,500,000 ₹",
         "area":"53–74 m²",
         "bhk":"2",
         "availability":"true"
      }
   },
   {
      "id":"floor15",
      "d":"m 917.78103,549.37384 108.27953,-41.56533 84.52781,27.94308 v 13.27296 l -83.13071,-24.79948 -110.0259,38.42173 z",
      "info":{
         "floorNumber":15,
         "price":"From 25,000,000 ₹",
         "area":"55–75 m²",
         "bhk":"2",
         "availability":"false"
      }
   },
   {
      "id":"floor16",
      "d":"m 917.91363,530.86751 108.27956,-41.56533 84.52781,27.94308 v 13.27296 l -83.13071,-24.79948 -110.02596,38.42173 z",
      "info":{
         "floorNumber":16,
         "price":"From 25,500,000 ₹",
         "area":"56–76 m²",
         "bhk":"2",
         "availability":"true"
      }
   },
   {
      "id":"floor17",
      "d":"m 918.15542,513.05606 108.27956,-41.56533 84.52782,27.94308 v 13.27296 l -83.13072,-24.79948 -110.02596,38.42173 z",
      "info":{
         "floorNumber":17,
         "price":"From 26,000,000 ₹",
         "area":"58–78 m²",
         "bhk":"2",
         "availability":"false"
      }
   },
   {
      "id":"floor18",
      "d":"m 918.58548,495.32361 108.27953,-41.56533 84.52781,27.94308 v 13.27296 l -83.13071,-24.79948 -110.0259,38.42173 z",
      "info":{
         "floorNumber":18,
         "price":"From 26,500,000 ₹",
         "area":"60–80 m²",
         "bhk":"2",
         "availability":"true"
      }
   },
   {
      "id":"floor19",
      "d":"m 918.01705,476.92237 108.27955,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02595,38.42173 z",
      "info":{
         "floorNumber":19,
         "price":"From 27,000,000 ₹",
         "area":"62–82 m²",
         "bhk":"2",
         "availability":"true"
      }
   },
   {
      "id":"floor20",
      "d":"m 918.54193,459.00443 108.27953,-41.56533 84.52781,27.94308 v 13.27296 l -83.13071,-24.79948 -110.0259,38.42173 z",
      "info":{
         "floorNumber":20,
         "price":"From 27,500,000 ₹",
         "area":"64–84 m²",
         "bhk":"2",
         "availability":"false"
      }
   },
   {
      "id":"floor21",
      "d":"m 918.27896,440.97256 108.27955,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02595,38.42173 z",
      "info":{
         "floorNumber":21,
         "price":"From 28,000,000 ₹",
         "area":"65–85 m²",
         "bhk":"3",
         "availability":"true",
         "floor-plan":"/floor-plans/floor.jpg"
      }
   },
   {
      "id":"floor22",
      "d":"m 917.84185,422.87752 108.27956,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02596,38.42173 z",
      "info":{
         "floorNumber":22,
         "price":"From 28,500,000 ₹",
         "area":"66–86 m²",
         "bhk":"3",
         "availability":"true"
      }
   },
   {
      "id":"floor23",
      "d":"m 918.03161,405.10927 108.27954,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02594,38.42173 z",
      "info":{
         "floorNumber":23,
         "price":"From 29,000,000 ₹",
         "area":"67–88 m²",
         "bhk":"3",
         "availability":"false"
      }
   },
   {
      "id":"floor24",
      "d":"m 918.63342,386.87573 108.27956,-41.56533 84.52781,27.94308 v 13.27296 l -83.13071,-24.79948 -110.02596,38.42173 z",
      "info":{
         "floorNumber":24,
         "price":"From 29,500,000 ₹",
         "area":"68–90 m²",
         "bhk":"3",
         "availability":"true"
      }
   },
   {
      "id":"floor25",
      "d":"m 918.2473,368.51509 108.27952,-41.56533 84.52781,27.94308 v 13.27296 l -83.13071,-24.79948 -110.0259,38.42173 z",
      "info":{
         "floorNumber":25,
         "price":"From 30,000,000 ₹",
         "area":"70–92 m²",
         "bhk":"3",
         "availability":"false"
      }
   },
   {
      "id":"floor26",
      "d":"m 918.63889,350.51198 108.27956,-41.56533 84.52781,27.94308 v 13.27296 l -83.13071,-24.79948 -110.02596,38.42173 z",
      "info":{
         "floorNumber":26,
         "price":"From 30,500,000 ₹",
         "area":"72–94 m²",
         "bhk":"3",
         "availability":"true"
      }
   },
   {
      "id":"floor27",
      "d":"m 917.95266,332.14457 108.27952,-41.56533 84.52781,27.94308 v 13.27296 l -83.13071,-24.79948 -110.0259,38.42173 z",
      "info":{
         "floorNumber":27,
         "price":"From 31,000,000 ₹",
         "area":"73–96 m²",
         "bhk":"3",
         "availability":"true"
      }
   },
   {
      "id":"floor28",
      "d":"m 918.40129,313.6092 108.27953,-41.56533 84.52781,27.94308 v 13.27296 l -83.13071,-24.79948 -110.02591,38.42173 z",
      "info":{
         "floorNumber":28,
         "price":"From 31,500,000 ₹",
         "area":"74–98 m²",
         "bhk":"3",
         "availability":"false"
      }
   },
   {
      "id":"floor29",
      "d":"m 918.22516,295.35713 108.27955,-41.56533 84.5278,27.94308 v 13.27296 l -83.1307,-24.79948 -110.02595,38.42173 z",
      "info":{
         "floorNumber":29,
         "price":"From 32,000,000 ₹",
         "area":"75–100 m²",
         "bhk":"Studio",
         "availability":"true"
      }
   },
   {
      "id":"floor30",
      "d":"m 918.47997,277.13434 108.27953,-41.56533 84.52781,27.94308 v 13.27296 l -83.13071,-24.79948 -110.02591,38.42173 z",
      "info":{
         "floorNumber":30,
         "price":"From 32,500,000 ₹",
         "area":"76–105 m²",
         "bhk":"Studio",
         "availability":"true"
      }
   }
];
const csvHeader = 'id,d,floorNumber,price,area,bhk,availability,floor-plan\n';
const csvRows = floorsData.map(floor => {
  const info = floor.info;
  return `"${floor.id}","${floor.d}",${info.floorNumber},"${info.price}","${info.area}","${info.bhk}","${info.availability}","${info['floor-plan'] || ''}"`;
}).join('\n');

const csvContent = csvHeader + csvRows;
fs.writeFileSync('floors-data.csv', csvContent);
console.log('CSV file created successfully!');