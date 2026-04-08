import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ClubCard from "./ClubCard";

const Clubs = () => {
  const navigate = useNavigate();
  const clubs = [
    { logo: "💻", name: "CodeForge", description: "Empowering students with coding skills and technical knowledge through workshops, hackathons, and peer learning.", color: "bg-blue-500" },
    { logo: "🚀", name: "LaunchLab", description: "Fostering innovation through startup challenges, mentorship, and networking.", color: "bg-orange-500" },
    { logo: "📖", name: "ReadLoop", description: "Enhancing communication skills through public speaking and literary discussions.", color: "bg-purple-500" },
    { logo: "🌱", name: "ImpactCore", description: "Making a difference through community service and awareness campaigns.", color: "bg-green-500" },
    { logo: "🛠", name: "SkillQuest", description: "Building essential life skills through workshops, simulations, and hands-on practice.", color: "bg-cyan-500" },
    { logo: "🎨", name: "Craftory", description: "Nurturing creativity through art exhibitions, workshops, and collaborative projects.", color: "bg-pink-500" },
  ];

  const cardVariants = {
    offscreen: { opacity: 0, y: 30 },
    onscreen: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", bounce: 0.2, duration: 0.6 }
    },
  };

  return (
    <section className="py-16 px-[5vw] bg-background text-foreground min-h-screen transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Our Clubs</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Explore student-led clubs designed to grow your skills, network, and interests.
          </p>
        </motion.div>

        {/* Grid of Club Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {clubs.map((club, idx) => (
            <motion.div
              key={idx}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <ClubCard {...club} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Explore All Clubs button */}
      <motion.div
        className="flex justify-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <button
          className="text-foreground border border-border rounded-lg px-6 py-2 hover:bg-muted transition duration-500"
          onClick={() => navigate("/clubs")}
        >
          Explore All Clubs →
        </button>
      </motion.div>
    </section>
  );
};

export default Clubs;
