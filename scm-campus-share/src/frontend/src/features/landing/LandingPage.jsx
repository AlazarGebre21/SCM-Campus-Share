import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import { ArrowRight, Share2, Shield, Zap, Globe, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

// --- UI Components ---

const Button = ({ children, className, variant = "primary" }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300
        ${
          variant === "primary"
            ? "bg-gray-900 text-white hover:bg-gray-800 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]"
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
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
      className={`group relative border border-gray-200 bg-white overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(0,0,0,0.04),
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
        src="/campus-share.svg"
        alt="CampusShare Logo"
        className="h-16 w-auto object-contain"
      />
      <span className="font-bold text-xl tracking-tight text-gray-900">
        Campus Share
      </span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
      <a href="#features" className="hover:text-black transition-colors">
        Features
      </a>
      <a href="#showcase" className="hover:text-black transition-colors">
        Showcase
      </a>
      <a href="#about" className="hover:text-black transition-colors">
        About
      </a>
    </div>
    <div className="flex items-center gap-4">
      <Link
        to="/login"
        className="text-sm text-gray-600 hover:text-black transition-colors hidden sm:block"
      >
        Log in
      </Link>
      <Button variant="primary" className="px-5 py-2 text-xs">
        <Link to="/register">Get Started</Link>
      </Button>
    </div>
  </nav>
);

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-32 overflow-hidden bg-white">
      {/* Background Elements (Light Mode) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-purple-50 border border-purple-100 text-xs font-medium text-purple-600 mb-6">
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
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Start Exploring <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Abstract UI Representation */}
      <motion.div
        style={{ y: y1, rotateX: 15 }}
        className="mt-24 relative w-full max-w-6xl perspective-1000"
      >
        <div className="relative rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[16/9]">
          {/* Mock UI Header */}
          <div className="h-12 border-b border-gray-100 flex items-center px-4 gap-2 bg-gray-50/50">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          {/* Mock UI Body */}
          <div className="p-8 grid grid-cols-12 gap-6 h-full">
            <div className="col-span-3 space-y-4">
              <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
              <div className="mt-8 space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-full bg-gray-50 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="col-span-9 space-y-6">
              <div className="h-64 w-full bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-6 flex items-end shadow-sm">
                <div className="space-y-2">
                  <div className="h-8 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-96 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-gray-50 rounded-xl border border-gray-100"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description, className }) => (
  <Spotlight className={`p-8 flex flex-col h-full ${className}`}>
    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </Spotlight>
);

const Features = () => {
  return (
    <section id="features" className="py-32 px-6 relative bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            Engineered for <br />{" "}
            <span className="text-blue-600">academic excellence.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={Share2}
            title="Peer-to-Peer Sharing"
            description="Directly share resources with students across departments without centralized bottlenecks."
            className="md:col-span-2"
          />
          <FeatureCard
            icon={Shield}
            title="Verified Content"
            description="Community-driven verification ensures that only high-quality, relevant materials rise to the top."
          />
          <FeatureCard
            icon={Zap}
            title="Lightning Fast"
            description="Optimized for speed with a Go backend and edge caching for instant resource retrieval."
          />
          <FeatureCard
            icon={Globe}
            title="Universal Access"
            description="Accessible from any device, anywhere. Your campus resources in your pocket."
            className="md:col-span-2"
          />
        </div>
      </div>
    </section>
  );
};

const Showcase = () => {
  return (
    <section id="showcase" className="py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            Sharing Is
          </h2>
          <i className="text-gray-600 max-w-md mt-4 md:mt-0">caring</i>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent z-10" />

          {/* Placeholder for Screenshot */}
          <div className="aspect-[16/10] w-full bg-gray-100 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-700 mix-blend-multiply" />

            <div className="z-20 text-center p-8">
              <div className="w-20 h-20 mx-auto bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-gray-200 shadow-sm">
                <BookOpen size={32} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Resource Hub
              </h3>
              <p className="text-gray-600">
                Centralized management for all your study materials
              </p>
            </div>
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
          className="text-gray-500 hover:text-gray-900 transition-colors"
          target="_blank"
        >
          GitHub
        </a>
        <a
          href="#"
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          Twitter
        </a>
        <a
          href="#"
          className="text-gray-500 hover:text-gray-900 transition-colors"
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
