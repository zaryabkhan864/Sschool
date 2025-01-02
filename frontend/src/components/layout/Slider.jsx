// import "owl.carousel/dist/assets/owl.carousel.min.css"; 
// import React, { useEffect } from "react";
// import OwlCarousel from "react-owl-carousel";
// import { Link } from "react-router-dom"; 
// import { ResourcesData } from "../../constants/constants";

// const Slider = () => {
//   useEffect(() => {
//     const $ = window.$; 

//     $(".owl-carousel").owlCarousel({
//       items: 1,
//       loop: true,
//       margin: 10,
//       autoplay: true,
//       nav: true,
//       dots: false,
//       center: true,
//       responsive: {
//         0: { item: 1 },
//         640: { item: 2 },
//         1024: { item: 3 },
//         1280: { item: 5 },
//       },
//     });

//     return () => {
//       $(".owl-carousel").trigger("destroy.owl.carousel");
//     };
//   }, []);

//   return (
//     <div className="slider-container mx-auto px-4 py-6 max-w-7xl">
//       <OwlCarousel className="owl-theme owl-carousel">
//         {ResourcesData.map((item) => (
//           <div key={item.id} className="slider-item relative group">
//             <img
//               src={item.image}
//               alt={item.title}
//               className="w-full h-auto object-cover rounded-lg"
//             />
//             <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
//               <Link
//                 to={item.link}
//                 className="text-white text-xl font-semibold hover:text-gray-300"
//               >
//                 {item.title}
//               </Link>
//             </div>
//           </div>
//         ))}
//       </OwlCarousel>
//     </div>
//   );
// };

// export default Slider;
