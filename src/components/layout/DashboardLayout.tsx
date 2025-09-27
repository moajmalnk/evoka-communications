import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { Navbar } from './Navbar';

export function DashboardLayout() {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  // Listen for desktop sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setIsDesktopSidebarOpen(event.detail.isOpen);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden">
      <AppSidebar />
      <div className={`flex-1 flex flex-col w-full min-w-0 transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <Navbar />
        {/* Spacer to account for fixed header */}
        <div className="h-16 lg:h-16"></div>
        <main className="flex-1 p-3 sm:p-4 lg:p-6 transition-all duration-300 w-full overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}