import { Outlet } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from './Header';
import BottomNav from './BottomNav';

export default function AppShell() {
  const { scrollY } = useScroll();
  
  // Parallax transforms - move blobs at different speeds
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const rotate1 = useTransform(scrollY, [0, 1000], [0, 45]);

  return (
    <div className="app-shell">
      {/* Decorative Blobs with Parallax */}
      <motion.div 
        className="bg-blob blob-1"
        style={{ y: y1, rotate: rotate1 }}
      />
      <motion.div 
        className="bg-blob blob-2"
        style={{ y: y2 }}
      />
      
      <Header />
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}


