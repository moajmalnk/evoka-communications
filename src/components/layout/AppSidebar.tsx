import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  FileText,
  Receipt,
  Clock,
  DollarSign,
  Users,
  Settings,
  BarChart3,
  Building2,
} from 'lucide-react';

// Menu items based on user roles
const getMenuItems = (role: string) => {
  const baseItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  ];

  switch (role) {
    case 'admin':
      return [
        ...baseItems,
        { title: 'Projects', url: '/projects', icon: FolderKanban },
        { title: 'Tasks', url: '/tasks', icon: CheckSquare },
        { title: 'Work Submissions', url: '/work-submissions', icon: FileText },
        { title: 'Invoicing', url: '/invoicing', icon: Receipt },
        { title: 'Attendance', url: '/attendance', icon: Clock },
        { title: 'Finance', url: '/finance', icon: DollarSign },
        { title: 'Employees', url: '/employees', icon: Users },
        { title: 'Reports', url: '/reports', icon: BarChart3 },
        { title: 'Settings', url: '/settings', icon: Settings },
      ];

    case 'general_manager':
      return [
        ...baseItems,
        { title: 'Projects', url: '/projects', icon: FolderKanban },
        { title: 'Work Approvals', url: '/work-submissions', icon: FileText },
        { title: 'Invoicing', url: '/invoicing', icon: Receipt },
        { title: 'Finance', url: '/finance', icon: DollarSign },
        { title: 'Reports', url: '/reports', icon: BarChart3 },
        { title: 'Employees', url: '/employees', icon: Users },
      ];

    case 'project_coordinator':
      return [
        ...baseItems,
        { title: 'Projects', url: '/projects', icon: FolderKanban },
        { title: 'Tasks', url: '/tasks', icon: CheckSquare },
        { title: 'Work Submissions', url: '/work-submissions', icon: FileText },
        { title: 'Employees', url: '/employees', icon: Users },
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
        { title: 'Employees', url: '/employees', icon: Users },
        { title: 'Attendance', url: '/attendance', icon: Clock },
        { title: 'Leave Management', url: '/leave-management', icon: Clock },
        { title: 'Payroll', url: '/payroll', icon: DollarSign },
        { title: 'Reports', url: '/reports', icon: BarChart3 },
      ];

    default:
      return baseItems;
  }
};

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = getMenuItems(user.role);
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (active: boolean) => 
    active 
      ? "bg-sidebar-accent text-sidebar-primary font-medium" 
      : "hover:bg-sidebar-accent/50 transition-colors";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="p-2">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-sidebar-border">
          <div className="p-2 bg-gradient-primary rounded-lg shadow-sm">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">Agency</h2>
              <p className="text-xs text-sidebar-foreground/60">Management</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wide">
            {!isCollapsed ? 'Navigation' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClassName(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info */}
        {!isCollapsed && (
          <div className="mt-auto p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}