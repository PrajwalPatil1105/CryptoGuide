import React from "react";
import { motion } from "framer-motion";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <motion.div
            className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute top-0 left-0 w-16 h-16 border-t-4 border-b-4 border-green-400 rounded-full"
            animate={{ rotate: -360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ opacity: 0.7 }}
          />
        </div>
        <motion.p
          className="mt-4 text-xl font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Loading Dashboard...
        </motion.p>
      </motion.div>
    </div>
  );
}

export default LoadingSpinner;
