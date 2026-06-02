import { motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    style={{ width: "100%" }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
