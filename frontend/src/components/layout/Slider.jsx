import React from 'react';
import { useGetEventsQuery } from '../../redux/api/eventApi';
import { Link } from 'react-router-dom';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import Loader from './Loader';

const Slider = () => {
  const { data, isLoading, error } = useGetEventsQuery();

  if (isLoading) return <Loader />;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Events</h1>
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
          data?.events.map((events) => (
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-transform hover:scale-105"
              key={events.id}
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={events.image}
                  alt={events.eventName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 flex flex-col justify-between h-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 h-[3rem] overflow-hidden text-ellipsis">
                  {events.eventName}
                </h2>
                <Link
                  to={events.link}
                  className="text-purple-600 hover:text-purple-800 font-medium mt-auto flex items-center"
                >
                  Read More <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          ))}
      </OwlCarousel>
    </div>
  );
};

export default Slider;
