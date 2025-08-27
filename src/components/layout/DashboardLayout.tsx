import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { Navbar } from './Navbar';

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full min-w-0 transition-all duration-300 ease-in-out lg:ml-64">
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