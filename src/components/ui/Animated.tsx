"use client";

import { motion, MotionProps, Variants } from "framer-motion";
import { ReactNode } from "react";

// ============================================
// TYPES
// ============================================
interface AnimatedProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
}

// ============================================
// 1. FADE IN - Apparition progressive
// ============================================
export const FadeIn = ({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.5 
}: AnimatedProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// 2. FADE IN UP - Apparition par le bas
// ============================================
export const FadeInUp = ({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.6 
}: AnimatedProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// 3. STAGGER - Liste en cascade
// ============================================
const staggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.4, 
      ease: [0.25, 0.1, 0.25, 1] 
    }
  },
};

export const StaggerContainer = ({ 
  children, 
  className = "" 
}: { children: ReactNode; className?: string }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={staggerVariants}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ 
  children, 
  className = "" 
}: { children: ReactNode; className?: string }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);

// ============================================
// 4. HOVER SCALE - Effet au survol
// ============================================
interface HoverScaleProps extends AnimatedProps {
  scale?: number;
  tapScale?: number;
}

export const HoverScale = ({ 
  children, 
  className = "", 
  scale = 1.03, 
  tapScale = 0.97 
}: HoverScaleProps) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: tapScale }}
    transition={{ 
      type: "spring", 
      stiffness: 400, 
      damping: 25 
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// 5. HOVER GLOW - Effet de lueur
// ============================================
export const HoverGlow = ({ 
  children, 
  className = "" 
}: { children: ReactNode; className?: string }) => (
  <motion.div
    whileHover={{ 
      boxShadow: "0 0 40px rgba(59, 130, 246, 0.15)",
      borderColor: "rgba(59, 130, 246, 0.3)",
    }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// 6. SCROLL REVEAL - Apparition au scroll
// ============================================
export const ScrollReveal = ({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.5,
  once = true 
}: AnimatedProps) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once, margin: "-80px" }}
    transition={{ duration, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// 7. SLIDE IN - Glissement latéral
// ============================================
export const SlideInLeft = ({ 
  children, 
  className = "", 
  delay = 0 
}: AnimatedProps) => (
  <motion.div
    initial={{ x: -60, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export const SlideInRight = ({ 
  children, 
  className = "", 
  delay = 0 
}: AnimatedProps) => (
  <motion.div
    initial={{ x: 60, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// 8. PULSE - Animation de battement
// ============================================
export const Pulse = ({ 
  children, 
  className = "" 
}: { children: ReactNode; className?: string }) => (
  <motion.div
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ 
      duration: 2, 
      repeat: Infinity,
      ease: "easeInOut" 
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// 9. FADE IN - Version sans mouvement (opacité seule)
// ============================================
export const FadeInOpacity = ({ 
  children, 
  className = "", 
  delay = 0 
}: AnimatedProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// 10. PAGE TRANSITION - Pour les changements de route
// ============================================
export const PageTransition = ({ 
  children, 
  className = "" 
}: { children: ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// 11. TYPEWRITER - Effet machine à écrire
// ============================================
interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

export const Typewriter = ({ 
  text, 
  className = "", 
  speed = 0.05, 
  delay = 0 
}: TypewriterProps) => {
  const words = text.split(' ');
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: speed, delayChildren: delay },
    }),
  };

  const childVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={childVariants}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// ============================================
// 12. SHAKE - Secousse (pour erreurs)
// ============================================
export const Shake = ({ 
  children, 
  className = "" 
}: { children: ReactNode; className?: string }) => (
  <motion.div
    animate={{ 
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5, ease: "easeInOut" }
    }}
    className={className}
  >
    {children}
  </motion.div>
);
