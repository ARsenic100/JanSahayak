import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "/assets/logo2.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300">
      {/* Fixed Login Button */}
      <div className="fixed right-8 top-8 z-50 flex space-x-4">
        <Link
          to="/auth?mode=login"
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          Login
        </Link>
        <Link
          to="/auth?mode=signup"
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          Signup
        </Link>
      </div>

      {/* Logo */}
      <div className="fixed left-8 top-8 z-50">
        <Link
          to="/"
          className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          <img
            src={logo}
            alt="JanSahayak Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="text-white font-semibold text-lg">JanSahayak</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-gray-800"
            >
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                JanSahayak
                <span className="block text-blue-700">
                  Municipal Corporation Grievance Redressal System
                </span>
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                A citizen-focused platform for Madhya Pradesh's municipal
                corporations, simplifying complaint submission and resolution
                through our innovative WhatsApp chatbot.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <p className="text-gray-700">
                    WhatsApp-based chatbot for easy grievance registration
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <p className="text-gray-700">
                    Streamlined resolution process for municipal employees
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <p className="text-gray-700">
                    Efficient management of citizen complaints
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Content - WhatsApp QR */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 shadow-2xl border border-blue-200">
                <h3 className="text-2xl font-semibold text-blue-800 mb-4">
                  Connect with our WhatsApp Bot
                </h3>
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <img
                    src="/assets/qr.svg"
                    alt="WhatsApp QR Code"
                    className="w-full max-w-[300px] mx-auto rounded-lg"
                  />
                </div>
                <p className="text-blue-700 mt-4 text-center">
                  Scan to register your grievances through WhatsApp
                </p>
              </div>
            </motion.div>
          </div>

          {/* Features Section */}
          <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white rounded-2xl mb-16 shadow-lg border border-blue-200">
            <h2 className="text-3xl font-bold text-blue-800 text-center mb-12">
              Platform Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-blue-100 rounded-xl p-3 sm:p-6 border border-blue-300 shadow-md text-sm sm:text-base"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2 sm:mb-3">
                  WhatsApp Integration
                </h3>
                <p className="text-gray-700">
                  Citizens can easily register their grievances through our
                  WhatsApp chatbot, making the process accessible and
                  convenient.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-blue-100 rounded-xl p-3 sm:p-6 border border-blue-300 shadow-md text-sm sm:text-base"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2 sm:mb-3">
                  Employee Portal
                </h3>
                <p className="text-gray-700">
                  Dedicated portal for municipal employees and administrators to
                  manage and resolve citizen complaints efficiently.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-blue-100 rounded-xl p-3 sm:p-6 border border-blue-300 shadow-md text-sm sm:text-base"
              >
                <h3 className="text-xl font-semibold text-blue-800 mb-3">
                  Streamlined Process
                </h3>
                <p className="text-gray-700">
                  Automated workflow ensures quick response and resolution of
                  grievances, improving citizen satisfaction.
                </p>
              </motion.div>
            </div>
          </div>

          {/* About Section */}
          <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-lg border border-blue-200">
            <h2 className="text-3xl font-bold text-blue-800 text-center mb-12">
              About JanSahayak
            </h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-gray-700 text-lg mb-6">
                JanSahayak is a comprehensive grievance redressal system
                designed specifically for municipal corporations in Madhya
                Pradesh. Our platform bridges the gap between citizens and
                municipal authorities through an innovative WhatsApp-based
                chatbot.
              </p>
              <p className="text-gray-700 text-lg mb-6">
                Citizens can easily register their grievances through WhatsApp,
                while municipal employees and administrators can efficiently
                manage and resolve these complaints through our dedicated web
                portal.
              </p>
              <p className="text-gray-700 text-lg">
                This website serves as the administrative interface for Madhya
                Pradesh's municipal corporation employees and administrators,
                enabling them to track, manage, and resolve citizen grievances
                effectively.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
