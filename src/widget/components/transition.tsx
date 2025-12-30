import React from "react";
import { AnimatePresence, motion } from "motion/react";

const Transition: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const key = children.key ?? "transition";
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export { Transition };
