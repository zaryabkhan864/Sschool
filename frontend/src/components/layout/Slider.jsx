import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import React, { useState } from "react";
import OwlCarousel from "react-owl-carousel";
import { useGetEventsQuery } from "../../redux/api/eventApi";
import Loader from "./Loader";
import { format } from "date-fns";

// Used whenever an event has no uploaded image yet — keeps the card
// layout intact instead of a broken <img>.
const FALLBACK_IMAGE = "/images/trip.jpg";

const Slider = () => {
  const { data, isLoading } = useGetEventsQuery();
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (isLoading) return <Loader />;

  const events = data?.events || [];

  // OwlCarousel clones/duplicates existing slides to pad out to whatever
  // `items` count you ask for, whenever there are FEWER real items than
  // that — cap every breakpoint's item count at the actual number of
  // events, and only enable `loop` once there are genuinely more events
  // than fit on screen at once.
  const maxVisible = 3;
  const effectiveItems = Math.max(1, Math.min(maxVisible, events.length));
  const shouldLoop = events.length > effectiveItems;

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl-custom font-bold text-ink-900 mb-6 text-center">
        Events
      </h1>

      {events.length === 0 ? (
        <p className="text-center text-ink-400 text-sm-custom">
          No events to show yet.
        </p>
      ) : (
        <OwlCarousel
          className="owl-theme lg:py-5 md:py-5"
          loop={shouldLoop}
          margin={10}
          autoplay={shouldLoop}
          items={effectiveItems}
          dots={false}
          center={events.length > 1}
          responsive={{
            0: { items: Math.min(1, events.length) },
            640: { items: Math.min(2, events.length) },
            1024: { items: Math.min(3, events.length) },
            1280: { items: Math.min(3, events.length) },
          }}
        >
          {events.map((event) => (
            <div
              className="animate-fade-in bg-white shadow-card rounded-2xl overflow-hidden border border-surface-200 hover:shadow-premium transform transition-transform hover:scale-105 max-w-sm"
              key={event._id}
            >
              {/* Image Section */}
              <div className="relative">
                <img
                  src={event.image?.url || FALLBACK_IMAGE}
                  alt={event.eventName}
                  className="w-full h-40 object-cover"
                />
                <div
                  className={`absolute top-2 right-2 text-xs-custom font-semibold px-3 py-1 rounded-full shadow-soft ${
                    event.isPaid
                      ? "bg-brand-600 text-white"
                      : "bg-surface-100 text-ink-700"
                  }`}
                >
                  {event.isPaid ? "Paid" : "Unpaid"}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-3 space-y-2">
                {/* Event Name */}
                <h2 className="font-heading text-lg-custom font-bold text-ink-900 truncate">
                  {event.eventName}
                </h2>

                {/* Description */}
                <p className="text-sm-custom text-ink-600 h-[1.5rem] overflow-hidden line-clamp-1">
                  {event.description}
                </p>

                {/* Details */}
                <div className="space-y-1 text-sm-custom">
                  {/* Date */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-ink-900">Date:</span>
                    <span className="text-ink-600">
                      {format(new Date(event.date), "MMM dd, yyyy")}
                    </span>
                  </div>

                  {/* Venue */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-ink-900">Venue:</span>
                    <span className="text-ink-600">{event.venue}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-surface-50 p-2 flex justify-between items-center">
                <button
                  className="bg-brand-600 text-white text-xs-custom font-semibold px-3 py-1 rounded-xl shadow-button hover:bg-brand-700 transition"
                  onClick={() => handleViewDetails(event)}
                >
                  View Details
                </button>
                <span className="text-xs-custom text-ink-400">
                  Last updated: {format(new Date(event.updatedAt), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          ))}
        </OwlCarousel>
      )}

      {/* Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-navy-950/50 flex items-center justify-center z-50">
          <div className="animate-slide-up bg-white rounded-2xl shadow-premium p-6 w-full max-w-md space-y-4">
            <h2 className="font-heading text-xl-custom font-bold text-ink-900">
              {selectedEvent.eventName}
            </h2>
            <img
              src={selectedEvent.image?.url || FALLBACK_IMAGE}
              alt={selectedEvent.eventName}
              className="w-full h-48 object-cover rounded-xl"
            />
            <p className="text-sm-custom text-ink-600">
              {selectedEvent.description}
            </p>
            <div className="space-y-2 text-sm-custom">
              <div>
                <span className="font-semibold text-ink-900">Date: </span>
                <span className="text-ink-600">
                  {format(new Date(selectedEvent.date), "MMM dd, yyyy")}
                </span>
              </div>
              <div>
                <span className="font-semibold text-ink-900">Venue: </span>
                <span className="text-ink-600">{selectedEvent.venue}</span>
              </div>
              <div>
                <span className="font-semibold text-ink-900">Amount: </span>
                <span className="text-ink-600">
                  {selectedEvent.amount} {selectedEvent.currency}
                </span>
              </div>
            </div>
            <button
              className="bg-brand-600 text-white text-sm-custom font-semibold px-4 py-2 rounded-xl shadow-button hover:bg-brand-700 transition"
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