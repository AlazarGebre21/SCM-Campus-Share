import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import { ArrowRight, Share2, Shield, Zap, Globe } from "lucide-react";
import { Link } from "react-router-dom";

// --- UI Components ---

const Button = ({ children, className, variant = "primary" }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300
        ${
          variant === "primary"
            ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-transparent"
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
        }
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

const Spotlight = ({ children, className = "" }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-gray-200 bg-white overflow-hidden rounded-xl shadow-sm transition-all duration-300 hover:border-purple-400/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(168, 85, 247, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

// --- Sections ---

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div className="flex items-center gap-3">
      <img
        src="/Logo.jpg"
        alt="CampusShare Logo"
        className="h-16 w-auto object-contain"
      />
      <span className="font-bold text-xl tracking-tight text-gray-900">
        Campus Share
      </span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
      <a href="#features" className="hover:text-purple-600 transition-colors">
        Features
      </a>
      <a href="#showcase" className="hover:text-purple-600 transition-colors">
        Showcase
      </a>
      <a href="#about" className="hover:text-purple-600 transition-colors">
        About
      </a>
    </div>
    <div className="flex items-center gap-4">
      <Link
        to="/login"
        className="text-sm text-gray-600 hover:text-purple-600 transition-colors hidden sm:block"
      >
        Log in
      </Link>
      <Link to="/register">
        <Button variant="primary" className="px-5 py-2 text-xs">
          Get Started
        </Button>
      </Link>
    </div>
  </nav>
);

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden bg-white">
      {/* Background Elements (Enhanced Purple Bloom) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] bg-purple-500/30 rounded-full blur-[150px] mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-purple-50 border border-purple-100 text-xs font-medium text-purple-600 mb-6 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-shadow cursor-default">
            v1.0 is now live
          </span>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 text-gray-900">
            Knowledge has no <br /> boundaries.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            A decentralized academic resource sharing platform designed for the
            modern university ecosystem. Fast, secure, and open.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
                Start Exploring <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description, className }) => (
  <Spotlight className={`p-8 flex flex-col h-full ${className}`}>
    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-6 text-blue-600 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors duration-300">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-purple-900 transition-colors">
      {title}
    </h3>
    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">
      {description}
    </p>
  </Spotlight>
);

const BentoCard = ({ children, className = "" }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 ${className}`}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -5 }}
    >
      {/* Hover Gradient Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(168, 85, 247, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        {children}
      </div>

      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(#e9d5ff_1px,transparent_1px)] [background-size:16px_16px]" />
    </motion.div>
  );
};

const Features = () => {
  return (
    <section id="features" className="py-32 px-6 relative bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 tracking-tight">
            Everything you need to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              excel academically.
            </span>
          </h2>
          <p className="text-lg text-gray-500">
            We've reimagined how academic resources are shared. No more broken
            links, paywalls, or shady websites. Just pure knowledge.
          </p>
        </div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-6 auto-rows-[minmax(180px,auto)]">
          {/* Card 1: Peer-to-Peer (Large, Spans 4 cols) */}
          <BentoCard className="md:col-span-4 min-h-[300px]">
            <div className="flex flex-col md:flex-row gap-8 h-full">
              <div className="flex-1 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Share2 size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Peer-to-Peer Network
                </h3>
                <p className="text-gray-500">
                  Directly connect with students from your department or across
                  the globe. Share notes, assignments, and insights without a
                  middleman.
                </p>
              </div>
              {/* Decorative Graphic */}
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <div className="grid grid-cols-2 gap-4 opacity-80">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-16 h-16 bg-white rounded-full shadow-sm animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Card 2: Lightning Fast (Tall, Spans 2 cols) */}
          <BentoCard className="md:col-span-2 min-h-[300px]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Instant Access
              </h3>
              <p className="text-gray-500 text-sm">
                Optimized with Edge Caching. Resources load in milliseconds,
                even on slow campus Wi-Fi.
              </p>
              <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-400"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </div>
          </BentoCard>

          {/* Card 3: Verified Content (Spans 2 cols) */}
          <BentoCard className="md:col-span-2 min-h-[280px]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Community Verified
              </h3>
              <p className="text-gray-500 text-sm">
                Upvote system ensures only the best quality notes rise to the
                top.
              </p>
            </div>
          </BentoCard>

          {/* Card 4: Universal Access (Large, Spans 4 cols) */}
          <BentoCard className="md:col-span-4 min-h-[280px]">
            <div className="flex flex-col-reverse md:flex-row gap-8 h-full items-center">
              {/* Decorative Graphic */}
              <div className="flex-1 w-full bg-gradient-to-tr from-purple-50 to-pink-50 rounded-2xl h-32 md:h-auto flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-200/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Globe
                  size={64}
                  className="text-purple-300 group-hover:text-purple-500 transition-colors duration-500 group-hover:rotate-12"
                />
              </div>

              <div className="flex-1 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Globe size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Universal Access
                </h3>
                <p className="text-gray-500">
                  Your library in your pocket. Fully responsive design that
                  works perfectly on mobile, tablet, and desktop devices.
                </p>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
};

const Showcase = () => {
  return (
    <section id="showcase" className="py-32 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            The Dashboard
          </h2>
          <p className="text-gray-600 max-w-md mt-4 md:mt-0">
            A sneak peek into the interface. Clean, intuitive, and data-rich.
          </p>
        </div>

        <div className="group relative rounded-2xl border border-gray-200 shadow-2xl bg-white">
          {/* PURPLE HOVER BLOOM BEHIND DASHBOARD */}
          <div className="absolute -inset-4 bg-purple-500/30 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative rounded-2xl overflow-hidden bg-gray-100 ">
            {/* Actual Dashboard Image Screenshot */}
            {/* object-left-top ensures the sidebar (left) is visible even if cropped */}
            <img
              src="/dashboard.png"
              alt="Application Dashboard Interface"
              className="w-full h-full object-cover object-left-top transition-transform duration-700 group-hover:scale-[1.01]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 px-6 border-t border-gray-200 bg-gray-50">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-gray-500 text-sm">
        © 2025 CampusShare. Open Source.
      </div>
      <div className="flex gap-6">
        <a
          href="https://github.com/Afomia01/Campus-Share"
          className="text-gray-500 hover:text-purple-600 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          href="#"
          className="text-gray-500 hover:text-purple-600 transition-colors"
        >
          Twitter
        </a>
        <a
          href="#"
          className="text-gray-500 hover:text-purple-600 transition-colors"
        >
          Discord
        </a>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900 selection:bg-purple-100 selection:text-purple-900">
      <Navbar />
      <Hero />
      <Features />
      <Showcase />
      <Footer />
    </div>
  );
}
