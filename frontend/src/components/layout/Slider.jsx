import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import React from "react";
import OwlCarousel from "react-owl-carousel";
import { useGetEventsQuery } from "../../redux/api/eventApi";
import Loader from "./Loader";

const Slider = () => {
  const { data, isLoading } = useGetEventsQuery();

  if (isLoading) return <Loader />;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Events
      </h1>
      <OwlCarousel
        className="owl-theme"
        loop
        margin={20}
        autoplay={true}
        items={3}
        dots={true}
        responsive={{
          0: { items: 1 },
          640: { items: 2 },
          1024: { items: 3 },
        }}
      >
        {data?.events &&
          data?.events.map((event) => (
            <div
              className="bg-white shadow-lg rounded-sm overflow-hidden border hover:shadow-xl transform transition-transform hover:scale-105"
              key={event.id}
            >
              <div className="relative">
                <img
                  src="/images/trip.jpg"
                  alt={event.eventName}
                  className="w-full h-56 object-cover rounded-t-sm"
                />
              </div>

              <div className="p-4">
                <h2 className="text-2xl font-Bold font-serif text-gray-900 mb-2">
                  {event.eventName}
                </h2>
                <p className="text-lg font-SemiBold font-serif text-gray-700 mb-4 h-[3rem] overflow-hidden">
                  {event.description}
                </p>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-800">Date:</span>
                  <span className="text-gray-600">{event.date}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="font-semibold text-gray-800">Venue:</span>
                  <span className="text-gray-600">{event.venue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-800">Amount:</span>
                  <span className="text-gray-600">{event.amount}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="font-semibold text-gray-800">paid:</span>
                  <span className="text-gray-600">
                    {event.isPaid ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </OwlCarousel>
    </div>
  );
};

export default Slider;
