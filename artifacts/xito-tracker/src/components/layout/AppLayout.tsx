import { useUser, useClerk } from "@clerk/react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderOpen,
  Calendar,
  Bell,
  BarChart,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Projects", href: "/projects", icon: Briefcase },
  { label: "Files", href: "/files", icon: FolderOpen },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Analytics", href: "/analytics", icon: BarChart },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex h-full flex-col bg-card border-r">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Xito Tracker</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed inset-y-0 z-50">
        <NavContent />
      </div>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col md:pl-64">
        <header className="md:hidden flex items-center h-16 px-4 border-b bg-card sticky top-0 z-40">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="flex-1 flex justify-center">
            <span className="font-bold">Xito Tracker</span>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
