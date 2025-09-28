import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  FileText,
  Receipt,
  Clock,
  IndianRupee,
  Users,
  Settings,
  BarChart3,
  Building2,
  Menu,
  X,
  ChevronDown,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  UserCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Simplified page navigation data for dropdown
const pageNavigationItems = [
  {
    id: 'PAGE-001',
    name: 'Employees',
    role: 'employees',
    url: '/employees',
    icon: Users
  },
  {
    id: 'PAGE-002',
    name: 'Clients',
    role: 'clients',
    url: '/clients',
    icon: UserCircle
  },
  {
    id: 'PAGE-003',
    name: 'HR Management',
    role: 'hr',
    url: '/hr',
    icon: UserCheck
  },
  {
    id: 'PAGE-004',
    name: 'Project Coordinator',
    role: 'project_coordinator',
    url: '/project-coordinator',
    icon: FolderKanban
  },
  {
    id: 'PAGE-005',
    name: 'General Manager',
    role: 'general_manager',
    url: '/general-manager',
    icon: Building2
  }
];

// Define menu item type
type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  hasDropdown?: boolean;
};

// Menu items based on user roles
const getMenuItems = (role: string): MenuItem[] => {
  const baseItems: MenuItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  ];

  // Special users item that shows dropdown
  const usersItem: MenuItem = {
    title: 'Users',
    url: '/employees',
    icon: Users,
    hasDropdown: true
  };

  switch (role) {
    case 'admin':
      return [
        ...baseItems,
        { title: 'Projects', url: '/projects', icon: FolderKanban },
        { title: 'Tasks', url: '/tasks', icon: CheckSquare },
        { title: 'Work Submissions', url: '/work-submissions', icon: FileText },
        { title: 'Invoicing', url: '/invoicing', icon: Receipt },
        { title: 'Attendance', url: '/attendance', icon: Clock },
        { title: 'Finance', url: '/finance', icon: IndianRupee },
        usersItem,
        // { title: 'Leave Management', url: '/leave-management', icon: Clock },
        // { title: 'HR Management', url: '/hr', icon: Users },
        // { title: 'Project Coordinator', url: '/project-coordinator', icon: FolderKanban },
        // { title: 'General Manager', url: '/general-manager', icon: Building2 },
        { title: 'Reports', url: '/reports', icon: BarChart3 },
        { title: 'Settings', url: '/settings', icon: Settings },
      ];

    case 'general_manager':
      return [
        ...baseItems,
        { title: 'General Manager', url: '/general-manager', icon: Building2 },
        { title: 'Projects', url: '/projects', icon: FolderKanban },
        { title: 'Work Approvals', url: '/work-approvals', icon: FileText },
        { title: 'Invoicing', url: '/invoicing', icon: Receipt },
        { title: 'Finance', url: '/finance', icon: IndianRupee },
        usersItem,
        { title: 'Reports', url: '/reports', icon: BarChart3 },
      ];

    case 'project_coordinator':
      return [
        ...baseItems,
        { title: 'Project Coordinator', url: '/project-coordinator', icon: FolderKanban },
        { title: 'Projects', url: '/projects', icon: FolderKanban },
        { title: 'Tasks', url: '/tasks', icon: CheckSquare },
        { title: 'Work Submissions', url: '/work-submissions', icon: FileText },
        usersItem,
      ];

    case 'employee':
      return [
        ...baseItems,
        { title: 'My Tasks', url: '/tasks', icon: CheckSquare },
        { title: 'Submit Work', url: '/work-submissions', icon: FileText },
        { title: 'Attendance', url: '/attendance', icon: Clock },
      ];

    case 'hr':
      return [
        ...baseItems,
        { title: 'HR Management', url: '/hr', icon: Users },
        usersItem,
        { title: 'Attendance', url: '/attendance', icon: Clock },
        { title: 'Leave Management', url: '/leave-management', icon: Clock },
        { title: 'Payroll', url: '/payroll', icon: IndianRupee },
        { title: 'Reports', url: '/reports', icon: BarChart3 },
      ];

    default:
      return baseItems;
  }
};

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const menuItems = getMenuItems(user?.role || '');
  const currentPath = location.pathname;
console.log(user);
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (active: boolean) => 
    active 
      ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200";

  const handleNavClick = () => {
    // Close sidebar on mobile/tablet after navigation
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      setIsMobileOpen(false);
    }
  };

  const handlePageSelect = (page: { url: string }) => {
    // Navigate directly to the page URL
    navigate(page.url);
    
    // Close sidebar on mobile/tablet after navigation
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      setIsMobileOpen(false);
    }
  };

  // Enhanced responsive breakpoint detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setScreenSize('mobile');
        setIsMobileOpen(false);
      } else if (width < 1024) {
        setScreenSize('tablet');
        setIsMobileOpen(false);
      } else {
        setScreenSize('desktop');
        setIsMobileOpen(false);
      }
    };

    // Check on mount
    checkScreenSize();

    // Add event listener with debouncing
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 150);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleToggleSidebar = () => {
      if (screenSize === 'mobile' || screenSize === 'tablet') {
        setIsMobileOpen(!isMobileOpen);
      } else if (screenSize === 'desktop') {
        setIsDesktopOpen(!isDesktopOpen);
      }
    };

    window.addEventListener('toggleSidebar', handleToggleSidebar);

    return () => window.removeEventListener('toggleSidebar', handleToggleSidebar);
  }, [screenSize, isMobileOpen, isDesktopOpen]);

  // Dispatch sidebar state changes for desktop
  useEffect(() => {
    if (screenSize === 'desktop') {
      window.dispatchEvent(new CustomEvent('sidebarStateChange', { 
        detail: { isOpen: isDesktopOpen } 
      }));
    }
  }, [isDesktopOpen, screenSize]);

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Determine if sidebar should be visible
  const isMobileOrTablet = screenSize === 'mobile' || screenSize === 'tablet';
  const shouldShowSidebar = isMobileOrTablet ? isMobileOpen : isDesktopOpen;

  if (!user) return null;

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50
          transition-all duration-300 ease-in-out
          ${isMobileOrTablet 
            ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full')
            : (isDesktopOpen ? 'translate-x-0' : '-translate-x-full')
          }
          w-64
          h-full
          bg-sidebar border-r border-sidebar-border
          shadow-xl lg:shadow-none
        `}
      >
        <div className="p-2 h-full flex flex-col">
          {/* Header with Mobile Close Button */}
          <div className="flex items-center justify-between px-3 py-4 mb-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-sm">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <div className="transition-all duration-200 min-w-0">
                <h2 className="font-semibold text-sidebar-foreground text-base sm:text-lg truncate">Evoka</h2>
                <p className="text-xs text-sidebar-foreground/60 truncate">Communications</p>
              </div>
            </div>
            
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-sidebar-foreground" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wide px-3 mb-2">
              Navigation
            </div>
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.title}>
                  {item.hasDropdown ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div
                          className={`
                            flex items-center gap-3 px-3 py-3 rounded-lg
                            transition-all duration-200 relative cursor-pointer
                            text-sm sm:text-base
                            ${getNavClassName(isActive(item.url))}
                            ${isMobileOrTablet ? 'py-4' : 'py-2.5'}
                          `}
                        >
                          <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                          <span className="font-medium truncate">{item.title}</span>
                          <ChevronDown className="h-4 w-4 ml-auto flex-shrink-0" />
                          {isActive(item.url) && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 sm:h-8 bg-primary rounded-r-full" />
                          )}
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {pageNavigationItems.map((page) => (
                          <DropdownMenuItem
                            key={page.id}
                            onClick={() => handlePageSelect(page)}
                            className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                          >
                            <page.icon className="h-4 w-4 text-muted-foreground" />
                            <div className="font-medium">{page.name}</div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <NavLink
                      to={item.url}
                      onClick={handleNavClick}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg
                        transition-all duration-200 relative
                        text-sm sm:text-base
                        ${getNavClassName(isActive(item.url))}
                        ${isMobileOrTablet ? 'py-4' : 'py-2.5'}
                      `}
                    >
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="font-medium truncate">{item.title}</span>
                      {isActive(item.url) && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 sm:h-8 bg-primary rounded-r-full" />
                      )}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info */}
          {/* <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-xs sm:text-sm font-semibold text-primary-foreground">
                  {`${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}` || (user?.email?.[0] ?? '?')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user?.firstName || ''} {user?.lastName || ''}
                </p>
                <p className="text-xs text-sidebar-foreground/60 capitalize truncate">
                  {user?.role?.replace('_', ' ') ?? ''}
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </aside>
    </>
  );
}