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
            <h1>Events</h1>
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
                    1280: { items: 5 }
                }}
            >
                {data?.events && data?.events.map((events) => (
                    <div className="item" key={events.id}>
                        <div className="max-w-sm mx-auto p-4 my-8 flex flex-col h-full min-h-[400px]">
                            <div className="flex-shrink-0 h-40 overflow-hidden rounded-t-lg">
                                <img
                                    src="/images/trip.jpg"
                                    alt={events.eventName}
                                    className="w-full h-full object-cover rounded"
                                />
                            </div>

                            <div className="p-4 flex flex-col justify-between flex-grow">
                                <h2 className="text-xl font-bold text-gray-800 mb-2 h-[60px] ">
                                    {events.name}
                                </h2>
                                <Link to={events.link} className="text-purple-600 hover:underline flex items-center mt-auto">
                                    Read More <span className="ml-2">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </OwlCarousel>
        </div>

    );
};

export default Slider;
