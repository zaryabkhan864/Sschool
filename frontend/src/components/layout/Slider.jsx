import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import React, { useState } from "react";
import OwlCarousel from "react-owl-carousel";
import { useGetEventsQuery } from "../../redux/api/eventApi";
import Loader from "./Loader";
import { format } from "date-fns";

const Slider = () => {
  const { data, isLoading } = useGetEventsQuery();
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (isLoading) return <Loader />;

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Events
      </h1>
      <OwlCarousel
        className="owl-theme lg:py-5 md:py-5"
        loop
        margin={10}
        autoplay={true}
        items={5}
        dots={false}
        center={true}
        responsive={{
          0: { items: 1 },
          640: { items: 2 },
          1024: { items: 3 },
          1280: { items: 5 },
        }}
      >
        {data?.events &&
          data?.events.map((event) => (
            <div
              className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transform transition-transform hover:scale-105 max-w-sm"
              key={event.id}
            >
              {/* Image Section */}
              <div className="relative">
                <img
                  src="/images/trip.jpg"
                  alt={event.eventName}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {event.isPaid ? "Paid" : "Unpaid"}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-3 space-y-2">
                {/* Event Name */}
                <h2 className="text-lg font-bold text-gray-900 truncate">
                  {event.eventName}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-700 h-[1.5rem] overflow-hidden line-clamp-1">
                  {event.description}
                </p>

                {/* Details */}
                <div className="space-y-1 text-sm">
                  {/* Date */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Date:</span>
                    <span className="text-gray-600">
                      {format(new Date(event.date), "MMM dd, yyyy")}
                    </span>
                  </div>

                  {/* Venue */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Venue:</span>
                    <span className="text-gray-600">{event.venue}</span>
                  </div>

                  {/* Amount */}
                  {/* <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Amount:</span>
                    <span className="text-gray-600">
                      {event.amount} {event.currency}
                    </span>
                  </div> */}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-2 flex justify-between items-center">
                <button
                  className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                  onClick={() => handleViewDetails(event)}
                >
                  View Details
                </button>
                <span className="text-xs text-gray-500">
                  Last updated: {format(new Date(event.updatedAt), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          ))}
      </OwlCarousel>

      {/* Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-2xl font-bold">{selectedEvent.eventName}</h2>
            <img
              src="/images/trip.jpg"
              alt={selectedEvent.eventName}
              className="w-full h-48 object-cover rounded-md"
            />
            <p>{selectedEvent.description}</p>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Date: </span>
                {format(new Date(selectedEvent.date), "MMM dd, yyyy")}
              </div>
              <div>
                <span className="font-semibold">Venue: </span>
                {selectedEvent.venue}
              </div>
              <div>
                <span className="font-semibold">Amount: </span>
                {selectedEvent.amount} {selectedEvent.currency}
              </div>
            </div>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              onClick={handleCloseModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Slider;
