import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Users, Bell, Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/notification-bell";
import { getCurrentUser, isAdmin, logout } from "@/lib/auth";

export function Navigation() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={isAdmin() ? "/admin" : "/member"}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-nigerian-green rounded-lg flex items-center justify-center">
                <Users className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-nigerian-green">Kontrib</h1>
                <p className="text-xs text-gray-600">Financial Management</p>
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              {isAdmin() && (
                <div className="bg-gray-100 p-1 rounded-lg">
                  <Link href="/admin">
                    <Button 
                      variant={location === "/admin" ? "default" : "ghost"}
                      size="sm"
                      className={location === "/admin" ? "bg-nigerian-green text-white" : ""}
                    >
                      Admin
                    </Button>
                  </Link>
                  <Link href="/member">
                    <Button 
                      variant={location === "/member" ? "default" : "ghost"}
                      size="sm"
                      className={location === "/member" ? "bg-nigerian-green text-white" : ""}
                    >
                      Member
                    </Button>
                  </Link>
                </div>
              )}
              
              <Link href="/whatsapp">
                <Button 
                  variant="outline" 
                  size="sm"
                  className={location === "/whatsapp" ? "bg-green-50 border-green-500 text-green-600" : ""}
                  data-testid="whatsapp-nav"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
              </Link>
              
              {isAdmin() && (
                <NotificationBell userId={user.id} />
              )}

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{user.fullName}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-4">
                  <div className="pb-2 border-b">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-gray-600">{user.role}</p>
                  </div>
                  
                  {isAdmin() && (
                    <>
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          Admin Dashboard
                        </Button>
                      </Link>
                      <Link href="/member" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          Member View
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  <Link href="/whatsapp" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp Integration
                    </Button>
                  </Link>
                  
                  <Button variant="outline" onClick={handleLogout} className="w-full">
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
