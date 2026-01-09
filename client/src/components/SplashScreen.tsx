import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatrixRain } from "./MatrixRain";
import logoImg from "@assets/New_Project_[8086C82]_1767973230461.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1000); // Allow exit animation to finish
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden"
        >
          <MatrixRain />
          
          <div className="z-10 flex flex-col items-center text-center p-6 space-y-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              {/* Logo Glow Effect */}
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <img 
                src={logoImg} 
                alt="KSB Logo" 
                className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(192,192,192,0.3)]"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="text-3xl md:text-5xl font-bold text-primary tracking-widest font-display uppercase text-shadow-glow">
                KSB
              </h1>
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto my-4" />
              <p className="text-sm md:text-base text-primary/80 font-mono tracking-wider max-w-[300px] leading-relaxed">
                GÖRÜNMEZ ORDUNUN<br/>BİLİNMEZ ASKERLERİ
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-12 flex flex-col items-center space-y-2"
            >
              <span className="text-[10px] text-accent font-mono animate-pulse">
                [SYSTEM_INIT_SEQUENCE_START]
              </span>
              <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.5, duration: 2, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
