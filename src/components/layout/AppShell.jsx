import { Outlet } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from './Header';
import BottomNav from './BottomNav';
import ArtBuddy from '../ui/ArtBuddy/ArtBuddy';
import GuidedTour from '../ui/GuidedTour';

export default function AppShell() {
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const rotate1 = useTransform(scrollY, [0, 1000], [0, 45]);

  return (
    <div className="app-shell">
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
      <ArtBuddy />
      <GuidedTour />
    </div>
  );
}


