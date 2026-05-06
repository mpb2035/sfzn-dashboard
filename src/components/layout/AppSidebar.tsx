import { LayoutDashboard, BarChart3, Shield, Bookmark, LayoutGrid, FolderKanban, MessageSquareWarning, Globe, Users, FileUp, Target, Footprints, ListTodo, CalendarDays, History, FileText, Plane, Clock, Wallet, ChevronDown, Folder } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useUserRole } from '@/hooks/useUserRole';
import { useSidebarConfig } from '@/hooks/useSidebarConfig';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  LayoutDashboard, Clock, Plane, MessageSquareWarning, BarChart3,
  Bookmark, FolderKanban, ListTodo, CalendarDays, Wallet, History,
  Globe, FileText, FileUp, LayoutGrid, Target,
};

const GROUP_ICONS: Record<string, React.ElementType> = {
  main: LayoutDashboard,
  manpower_blueprint: Users,
  running: Footprints,
};

export function AppSidebar() {
  const { state } = useSidebar();
  const { isAdmin } = useUserRole();
  const { groups, getGroupItems, getGroupLabel, loading, iconMap } = useSidebarConfig();
  const collapsed = state === 'collapsed';

  const STANDARD_USER_PATHS = new Set(['/', '/project-workflow', '/todo']);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const isOpen = (group: string) => openGroups[group] ?? true;
  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !(prev[group] ?? true) }));
  };

  const renderItems = (groupName: string) => {
    let items = getGroupItems(groupName);
    if (!isAdmin) items = items.filter(i => STANDARD_USER_PATHS.has(i.item_path));
    return items.map((item) => {
      const iconName = iconMap[item.item_path] || 'LayoutDashboard';
      const IconComp = ICON_COMPONENTS[iconName] || LayoutDashboard;
      return (
        <SidebarMenuItem key={item.item_path}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.item_path}
              end={item.item_path === '/'}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50"
              activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
            >
              <IconComp className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.item_title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };


  if (loading) return <Sidebar className={collapsed ? 'w-14' : 'w-56'} collapsible="icon"><SidebarContent /></Sidebar>;

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-56'} collapsible="icon">
      <SidebarContent className="pt-4">
        {groups.map((groupName) => {
          const GroupIcon = GROUP_ICONS[groupName] || Folder;
          const groupItems = getGroupItems(groupName);
          if (groupItems.length === 0) return null;

          return (
            <Collapsible key={groupName} open={isOpen(groupName)} onOpenChange={() => toggleGroup(groupName)}>
              <SidebarGroup>
                {!collapsed && (
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors cursor-pointer">
                    <span className="flex items-center gap-2">
                      <GroupIcon className="h-4 w-4" />
                      {getGroupLabel(groupName)}
                    </span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${isOpen(groupName) ? 'rotate-0' : '-rotate-90'}`} />
                  </CollapsibleTrigger>
                )}
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>{renderItems(groupName)}</SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
                    >
                      <Shield className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
