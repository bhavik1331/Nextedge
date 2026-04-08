import React from "react";
import { ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

import FeaturesSection from "../components/FeaturesSection";
import Clubs from "../components/Clubs";
import UpcomingEvents from "../components/UpcomingEvents";
import Cta from "../components/Cta";
import Footer from "../components/Footer";

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const headlineRefs = useRef([]);
  const descRef = useRef(null);
  const ctaRef = useRef(null);
  const stickerRefs = useRef([]);
  const cardRefs = useRef([]);

  headlineRefs.current = [];
  stickerRefs.current = [];
  cardRefs.current = [];

  const addHeadline = (el) => el && headlineRefs.current.push(el);
  const addSticker = (el) => el && stickerRefs.current.push(el);
  const addCard = (el) => el && cardRefs.current.push(el);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
          duration: 0.6,
        },
      });

      // Initial states
      gsap.set(badgeRef.current, { opacity: 0, y: 20 });
      gsap.set(headlineRefs.current, { y: 120, opacity: 0 });
      gsap.set(stickerRefs.current, { scale: 0.8, opacity: 0 });
      gsap.set(descRef.current, { opacity: 0, y: 20 });
      gsap.set(ctaRef.current, { opacity: 0, y: 20 });
      gsap.set(cardRefs.current, { opacity: 0, y: 40 });

      // Timeline

      tl.addLabel("start")
        .to(
          badgeRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
          },
          "start"
        )

        .to(
          headlineRefs.current,
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.8,
          },
          "start+=0.1"
        )

        // Stickers jump in early, not later
        .to(
          stickerRefs.current,
          {
            opacity: 1,
            scale: 1,
            stagger: 0.12,
            duration: 0.5,
          },
          "start+=0.2"
        )

        // Description overlaps headline tail
        .to(
          descRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          "start+=0.35"
        )

        // CTA should feel eager, not patient
        .to(
          ctaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          "start+=0.45"
        )

        // Cards flow in while CTA finishes
        .to(
          cardRefs.current,
          {
            opacity: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.6,
          },
          "start+=0.55"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="font-body">
      {/* ================= HERO ================= */}
      <section
        className="relative min-h-screen   md:dark:bg-[url('/darkbg.png')] md:bg-[url('/bg1.png')] md:bg-cover overflow-hidden"
        ref={heroRef}
      >
        <div className="relative flex flex-col items-center max-w-7xl mx-auto px-6 pt-22 md:pt-28 pb-24  ">
          {/* Badge */}
          <span
            className="inline-block mb-3 px-2 md:mb-6 md:px-4 md:py-1 rounded-full font-bold bg-blue-100 text-blue-600 text-xs uppercase "
            ref={badgeRef}
          >
            Student Innovation Hub
          </span>

          {/* Headline */}
          <h1 className=" uppercase">
            <span
              className="block font-accent text-6xl md:text-9xl"
              ref={addHeadline}
            >
              Edge of
            </span>
            <span
              className="block font-accent text-6xl tracking-wide md:text-9xl"
              ref={addHeadline}
            >
              Innovation
            </span>
            <span
              className="block font-accent text-6xl tracking-wide md:text-9xl text-blue-600"
              ref={addHeadline}
            >
              Core of Learning
            </span>
          </h1>

          {/* Floating stickers */}
          <div
            className="absolute top-28 right-20 rotate-12 bg-white text-black px-4 py-2 rounded-xl font-bold shadow-xl hidden md:block"
            ref={addSticker}
          >
            Learning
          </div>

          <div
            className="absolute  -left-40 bottom-90 -rotate-30 bg-lime-400 text-black px-4 py-2 rounded-full font-bold shadow-xl hidden md:block"
            ref={addSticker}
          >
            Innovation
          </div>

          {/* Description */}
          <p
            className="mt-8 max-w-xl md:mr-45 text-sm md:text-lg dark:text-blue-100 md:mt-6"
            ref={descRef}
          >
            A dynamic student organization dedicated to promoting
            interdisciplinary learning and innovation through various
            student-led sub-clubs and events.
          </p>

          {/* CTAs */}
          <div
            className="mt-10 md:mt-8 md:w-3xl flex flex-col sm:flex-row gap-4"
            ref={ctaRef}
          >
            <button className="px-8 py-4 bg-black text-white rounded-full font-bold hover:scale-[1.03] transition" onClick={() => navigate("/contact")}>
              Join Us
            </button>

            <button
              onClick={() => navigate("/clubs")}
              className="px-8 py-4 bg-gray-100/50 dark:bg-white text-black shadow-xl rounded-full font-bold flex items-center gap-2 hover:scale-[1.03] transition"
            >
              Explore Clubs →
            </button>
          </div>

          {/* Value Cards */}
          <div className="mt-20 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="bg-card text-foreground rounded-2xl p-6 shadow-xl border border-border transition-all hover:border-indigo-500/30"
              ref={addCard}
            >
              <h3 className="font-bold text-lg mb-2">Learn</h3>
              <p className="text-sm text-muted-foreground">
                Interdisciplinary learning through hands-on collaboration.
              </p>
            </div>

            <div
              className="bg-card text-foreground rounded-2xl p-6 shadow-xl border border-border transition-all hover:border-indigo-500/30"
              ref={addCard}
            >
              <h3 className="font-bold text-lg mb-2">Build</h3>
              <p className="text-sm text-muted-foreground">
                Student-led clubs working on real ideas and projects.
              </p>
            </div>

            <div
              className="bg-card text-foreground rounded-2xl p-6 shadow-xl border border-border transition-all hover:border-indigo-500/30"
              ref={addCard}
            >
              <h3 className="font-bold text-lg mb-2">Innovate</h3>
              <p className="text-sm text-muted-foreground">
                Events and initiatives that push creativity forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-background text-foreground transition-colors duration-500">
        <FeaturesSection />
      </section>

      {/* ================= CLUBS ================= */}
      <section className="bg-background text-foreground transition-colors duration-500">
        <Clubs />
      </section>

      {/* ================= EVENTS ================= */}
      <section className="bg-background text-foreground transition-colors duration-500">
        <UpcomingEvents />
      </section>

      {/* ================= CTA ================= */}
      <section>
        <Cta />
      </section>

      <Footer />
    </div>
  );
};

export default Home;
