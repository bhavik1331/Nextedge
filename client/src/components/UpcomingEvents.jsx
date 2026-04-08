import { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Thumbs, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";

const UpcomingEvents = () => {
  const thumbsSwiperRef = useRef(null);

  // State for events fetched from backend
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Track which event is active
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch upcoming events from backend
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "/api/events/upcoming",
        );

        if (
          response.data.success &&
          response.data.events &&
          response.data.events.length > 0
        ) {
          // Transform backend data to match UI structure
          const transformedEvents = response.data.events.map((event) => ({
            title: event.title,
            date: new Date(event.date).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            dateObj: new Date(event.date), // Keep original date object for countdown
            location: event.location || "Location TBA",
            description: event.description || "No description available",
            image: event.coverImage?.url
              ? event.coverImage.url
              : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            badge: "Upcoming Event",
          }));

          setEvents(transformedEvents);
        } else {
          // No events available - set fallback
          setEvents([
            {
              title: "No Events Available",
              date: "TBA",
              dateObj: new Date(),
              location: "TBA",
              description: "Check back soon for upcoming events!",
              image:
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              badge: "Coming Soon",
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching upcoming events:", err);
        // Set fallback events in case of error
        setEvents([
          {
            title: "No Events Available",
            date: "TBA",
            dateObj: new Date(),
            location: "TBA",
            description: "Check back soon for upcoming events!",
            image:
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            badge: "Coming Soon",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  useEffect(() => {
    if (events.length === 0 || !events[activeIndex]?.dateObj) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const targetDate = events[activeIndex].dateObj.getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const distance = targetDate - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / 1000 / 60) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    };

    updateCountdown(); // Run immediately once
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [activeIndex, events]); // Re-run when active event changes or events load

  // Show loading state
  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-[5vw] bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Upcoming Events
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-[5vw] bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Events</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Join us at our upcoming events and be part of the NextEdge experience.
        </p>

        {/* Countdown Timer */}
        <div className="inline-flex gap-6 bg-blue-100 dark:bg-blue-900 rounded-xl px-6 py-3 text-blue-800 dark:text-blue-300 font-semibold text-lg select-none justify-center w-full max-w-md mx-auto mb-12 shadow-md">
          <div className="flex flex-col items-center">
            <span>{timeLeft.days}</span>
            <small className="text-xs">Days</small>
          </div>
          <div className="flex flex-col items-center">
            <span>{timeLeft.hours.toString().padStart(2, "0")}</span>
            <small className="text-xs">Hours</small>
          </div>
          <div className="flex flex-col items-center">
            <span>{timeLeft.minutes.toString().padStart(2, "0")}</span>
            <small className="text-xs">Minutes</small>
          </div>
          <div className="flex flex-col items-center">
            <span>{timeLeft.seconds.toString().padStart(2, "0")}</span>
            <small className="text-xs">Seconds</small>
          </div>
        </div>
      </div>

      {/* Main Swiper */}
      <div className="max-w-5xl mx-auto mb-12">
        <Swiper
          modules={[EffectFade, Autoplay, Pagination, Thumbs]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={events.length > 1}
          pagination={{ clickable: true }}
          thumbs={{ swiper: thumbsSwiperRef.current }}
          onSwiper={(swiper) => {
            setTimeout(() => {
              if (swiper?.thumbs && thumbsSwiperRef.current) {
                swiper.thumbs.swiper = thumbsSwiperRef.current;
              }
            }, 0);
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)} // 🔥 Update active event
          className="rounded-xl overflow-hidden"
        >
          {events.map((event, index) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col md:flex-row bg-white dark:bg-white/5 shadow-md rounded-xl overflow-hidden transition-colors duration-300 min-h-[300px] md:min-h-0">
                <div className="md:w-1/2 h-60 md:h-auto">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white text-xs font-medium px-3 py-1 rounded-full mb-3 w-fit">
                    {event.badge}
                  </span>
                  <h3 className="text-2xl font-semibold mb-3">{event.title}</h3>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <FaCalendarAlt className="mr-2" /> {event.date}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <FaMapMarkerAlt className="mr-2" /> {event.location}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                    {event.description}
                  </p>

                  <a
                    href="#"
                    className="inline-block bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-600 w-fit"
                  >
                    Learn More →
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* See All Events Button */}
      <div className="flex justify-center mt-10">
        <a
          href="/events"
          className="inline-block px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          See All Events →
        </a>
      </div>
    </section>
  );
};

export default UpcomingEvents;
