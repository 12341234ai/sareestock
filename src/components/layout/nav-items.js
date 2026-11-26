import {
  BookOpen,
  FolderOpen,
  Images,
  LayoutDashboard,
  PlusCircle,
  ScanSearch,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, exact: true },
  { label: "Groups", to: "/groups", icon: FolderOpen },
  { label: "Add Sarees", to: "/add", icon: PlusCircle },
  { label: "Gallery", to: "/gallery", icon: Images },
  { label: "Photo Search", to: "/search", icon: ScanSearch },
  { label: "How to Use", to: "/how-to-use", icon: BookOpen },
  { label: "Settings", to: "/settings", icon: Settings },
];

export const MOBILE_NAV = [
  { label: "Home", to: "/", icon: LayoutDashboard, exact: true },
  { label: "Add", to: "/add", icon: PlusCircle },
  { label: "Gallery", to: "/gallery", icon: Images },
  { label: "Search", to: "/search", icon: ScanSearch },
  { label: "Groups", to: "/groups", icon: FolderOpen },
];

export function isNavActive(item, pathname) {
  return item.exact ? pathname === item.to : pathname.startsWith(item.to);
}