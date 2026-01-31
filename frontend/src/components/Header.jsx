"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import {
  LogIn,
  LogOut,
  Menu,
  ShoppingCart,
  X,
  Settings,
  MonitorIcon as MonitorCog,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NavLink from "./common/NavLink";
import { ADMIN_LINKS, PUBLIC_LINKS } from "@/constants";
import logo from "../assets/Logo Sheesh 2025.png";
import shosho from "../assets/shosho.png";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();
  const { user, logout, isAuthenticated } = useUser();
  const { t } = useTranslation();

  const handleLinkClick = () => setIsMenuOpen(false);
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <nav
      className={`fixed top-0 w-full bg-gradient-to-r from-white via-yellow-50/30 to-white backdrop-blur-md border-b-2 ${
        !isAuthenticated && "border-yellow-300"
      } z-50 shadow-lg shadow-yellow-100/50`}
    >
      <div className="container mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-2 xs:py-3 sm:py-4">
        <div className="flex items-center justify-between gap-1 xs:gap-2 sm:gap-4 md:gap-6">
          {/* Logo */}
          <Link
            to={isAuthenticated ? "/products" : "/"}
            className="flex-shrink-0 group min-w-0"
          >
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3">
              {/* الشعار الأول (أكبر بشكل ملحوظ + Responsive ممتاز) */}
              <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-20 rounded-full">
                <img
                  src={logo || "/placeholder.svg"}
                  alt="شاورما شيش"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* الشعار الثاني */}
              <div className="flex-shrink-0 min-w-0">
                <img
                  src={shosho}
                  alt="YALLA SHEESH Logo"
                  className="h-10 xs2:w-40 xs:h-12 xs:w-40 sm:h-14 sm:w-44 md:h-16 md:w-50 lg:h-20 lg:w-70 w-auto object-contain"
                />
              </div>
            </div>
          </Link>
          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-6">
            {!isAuthenticated &&
              PUBLIC_LINKS.map((key) => (
                <NavLink
                  key={key.label}
                  to={
                    key.label === "our_story"
                      ? "/story"
                      : key.label === "jobs"
                        ? "/JobsPage"
                        : `/#${key.label}`
                  }
                  label={t(key.label)}
                  onClick={handleLinkClick}
                  className="text-sm xl:text-base text-gray-700 hover:text-red-700 font-semibold transition-all duration-300 whitespace-nowrap relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-red-600 after:to-yellow-500 hover:after:w-full after:transition-all after:duration-300"
                />
              ))}
          </div>
          {/* User Icons */}
          <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2">
            {isAuthenticated && user.role === "user" && (
              <Link to="/cart">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative border-2 border-red-600 text-red-700 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 hover:text-white bg-white h-9 w-9 xs:h-10 xs:w-10 md:h-11 md:w-11 p-0 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-200 flex-shrink-0"
                >
                  <ShoppingCart className="h-4 w-4 xs:h-5 xs:w-5" />
                  {cart.products?.length > 0 && (
                    <Badge className="absolute -top-1.5 -right-1.5 xs:-top-2 xs:-right-2 h-5 w-5 xs:h-6 xs:w-6 rounded-full p-0 flex items-center justify-center text-[10px] xs:text-xs font-bold bg-gradient-to-br from-yellow-400 to-yellow-600 text-red-900 border-2 border-white shadow-md animate-pulse">
                      {cart.products.length}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {isAuthenticated &&
              (user.role === "admin" || user.role === "employee") && (
                <div className="hidden lg:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-red-600 border-2 text-red-900 hover:bg-gradient-to-r hover:from-red-700 hover:to-red-800 hover:text-white h-10 md:h-11 text-sm font-bold gap-2 px-4 md:px-5 transition-all duration-300 hover:shadow-lg hover:scale-105 flex-shrink-0"
                      >
                        <MonitorCog className="h-4 w-4" />
                        <span className="hidden xl:inline">
                          {t("control_panel")}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-white border-2 border-red-200 shadow-xl rounded-lg p-2"
                    >
                      {ADMIN_LINKS.map(
                        (link) =>
                          link.roles.includes(user.role) && (
                            <Link to={link.to} key={link.to}>
                              <DropdownMenuItem className="cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-md p-3 transition-all duration-200 focus:bg-gradient-to-r focus:from-red-50 focus:to-yellow-50">
                                <link.icon className="h-4 w-4 ml-2 text-red-600" />
                                <span className="font-semibold text-gray-700">
                                  {t(link.label)}
                                </span>
                              </DropdownMenuItem>
                            </Link>
                          ),
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

            {isAuthenticated && (
              <Link to="/settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative border-2 border-red-600 text-red-900 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 hover:text-white bg-white h-9 w-9 xs:h-10 xs:w-10 md:h-11 md:w-11 p-0 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-200 flex-shrink-0"
                >
                  <Settings className="h-4 w-4 xs:h-5 xs:w-5" />
                </Button>
              </Link>
            )}

            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex bg-gradient-to-r border-2 border-red-600 text-red-900 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 hover:text-white h-9 sm:h-10 md:h-11 text-xs sm:text-sm font-bold gap-1.5 sm:gap-2 px-2.5 sm:px-4 md:px-5 transition-all duration-300 hover:shadow-lg hover:scale-105 flex-shrink-0"
              >
                <span>{t("logout")}</span>
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            ) : (
              <div className="hidden sm:flex gap-2 flex-shrink-0">
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r border-2 border-red-600 text-red-900 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 hover:text-white h-9 sm:h-10 md:h-11 text-xs sm:text-sm font-bold gap-1.5 sm:gap-2 px-2.5 sm:px-4 md:px-5 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <span>{t("login")}</span>
                    <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </Link>
                {/* <Link to="/employee-login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r border-2 border-yellow-500 text-yellow-900 hover:bg-gradient-to-br hover:from-yellow-600 hover:to-yellow-700 hover:text-white h-9 sm:h-10 md:h-11 text-xs sm:text-sm font-bold gap-1.5 sm:gap-2 px-2.5 sm:px-4 md:px-5 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <span className="hidden lg:inline">
                      {t("employee_login") || "Employee"}
                    </span>
                    <span className="lg:hidden">👔</span>
                    <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </Link> */}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 xs:h-10 xs:w-10 p-0 hover:bg-red-100 text-red-700 transition-all duration-300 flex-shrink-0"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 xs:h-6 xs:w-6" />
              ) : (
                <Menu className="h-5 w-5 xs:h-6 xs:w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-xl border-t border-gray-100 lg:hidden overflow-y-auto max-h-[85vh] animate-in slide-in-from-top-5 fade-in duration-200">
            <div className="flex flex-col p-4 space-y-4">
              {/* Public Links */}
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2">
                  {PUBLIC_LINKS.map((key) => (
                    <NavLink
                      className="block px-4 py-3 text-base font-semibold text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                      key={key.label}
                      to={
                        key.label === "our_story"
                          ? "/story"
                          : key.label === "jobs"
                            ? "/JobsPage"
                            : `/#${key.label}`
                      }
                      label={t(key.label)}
                      onClick={handleLinkClick}
                    />
                  ))}
                </div>
              )}

              {/* Mobile Language Switcher */}
              <div className="sm:hidden px-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    {t("language")}
                  </span>
                  <LanguageSwitcher />
                </div>
              </div>

              {/* Admin & User Links */}
              <div className="pt-2 border-t border-gray-100">
                {isAuthenticated && (
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {ADMIN_LINKS.map(
                      (link) =>
                        link.roles.includes(user.role) && (
                          <Link to={link.to} key={link.to} onClick={toggleMenu}>
                            <div className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors">
                              <link.icon className="w-5 h-5 text-red-500" />
                              <span className="font-medium">
                                {t(link.label)}
                              </span>
                            </div>
                          </Link>
                        ),
                    )}
                  </div>
                )}

                <div className="mt-4">
                  {isAuthenticated ? (
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleLogout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("logout")}
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link to="/login" onClick={handleLinkClick}>
                        <Button
                          variant="default"
                          size="lg"
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          {t("login")}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
