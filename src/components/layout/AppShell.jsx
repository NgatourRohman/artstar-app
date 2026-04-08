import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}


