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
  LayoutDashboard,
  Package,
  Plus,
  MonitorCog,
  ChartNoAxesCombined,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();
  const { user, logout } = useUser();
  const { t } = useTranslation();

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-gradient-to-r from-white via-yellow-50/30 to-white backdrop-blur-md border-b-2 border-yellow-400 z-50 shadow-lg shadow-yellow-100/50">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4 md:gap-6">
          <Link to="/" className="flex-shrink-0 group">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0 ring-2 ring-yellow-400 ring-offset-2 transition-transform group-hover:scale-105 duration-300">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDzGI9tRqzIVulcl3ghkfQ61TOgQmkuOt3gg&s"
                  alt="شاورما شيش"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-700 via-red-600 to-red-700 bg-clip-text text-transparent drop-shadow-sm">
                  {t("resturant_name")}
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-yellow-700 font-medium italic">
                  {t("resturant_tagline")}
                </p>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-10">
            <Link
              to="/#home"
              onClick={handleLinkClick}
              className="text-sm xl:text-base text-gray-700 hover:text-red-700 font-semibold transition-all duration-300 whitespace-nowrap relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-red-600 after:to-yellow-500 hover:after:w-full after:transition-all after:duration-300"
            >
              {t("home")}
            </Link>
            <Link
              to="/#menu"
              onClick={handleLinkClick}
              className="text-sm xl:text-base text-gray-700 hover:text-red-700 font-semibold transition-all duration-300 whitespace-nowrap relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-red-600 after:to-yellow-500 hover:after:w-full after:transition-all after:duration-300"
            >
              {t("menu")}
            </Link>
            <Link
              to="/#about"
              onClick={handleLinkClick}
              className="text-sm xl:text-base text-gray-700 hover:text-red-700 font-semibold transition-all duration-300 whitespace-nowrap relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-red-600 after:to-yellow-500 hover:after:w-full after:transition-all after:duration-300"
            >
              {t("about_us")}
            </Link>
            <Link
              to="/#contact"
              onClick={handleLinkClick}
              className="text-sm xl:text-base text-gray-700 hover:text-red-700 font-semibold transition-all duration-300 whitespace-nowrap relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-red-600 after:to-yellow-500 hover:after:w-full after:transition-all after:duration-300"
            >
              {t("contact_us")}
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-2">
            {user.role === "user" && (
              <div className="flex items-center gap-1 sm:gap-2 md:gap-2">
                <Link to="/cart">
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative border-2 border-red-600 text-red-700 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 hover:text-white bg-white h-10 w-10 md:h-11 md:w-11 p-0 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-200 flex-shrink-0"
                  >
                    <ShoppingCart className="size-5" />
                    {cart.products?.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-gradient-to-br from-yellow-400 to-yellow-600 text-red-900 border-2 border-white shadow-md animate-pulse">
                        {cart.products.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </div>
            )}

            {(user.role === "admin" || user.role === "employee") && (
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
                    <Link to="/admin/dashboard">
                      <DropdownMenuItem className="cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-md p-3 transition-all duration-200 focus:bg-gradient-to-r focus:from-red-50 focus:to-yellow-50">
                        <LayoutDashboard className="h-4 w-4 ml-2 text-red-600" />
                        <span className="font-semibold text-gray-700">
                          {t("dashboard")}
                        </span>
                      </DropdownMenuItem>
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/orders">
                        <DropdownMenuItem className="cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-md p-3 transition-all duration-200 focus:bg-gradient-to-r focus:from-red-50 focus:to-yellow-50">
                          <Package className="h-4 w-4 ml-2 text-red-600" />
                          <span className="font-semibold text-gray-700">
                            {t("orders")}
                          </span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link to="/admin/add-product">
                        <DropdownMenuItem className="cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-md p-3 transition-all duration-200 focus:bg-gradient-to-r focus:from-red-50 focus:to-yellow-50">
                          <Plus className="h-4 w-4 ml-2 text-red-600" />
                          <span className="font-semibold text-gray-700">
                            {t("products")}
                          </span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link to="/admin/statistics">
                        <DropdownMenuItem className="cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-md p-3 transition-all duration-200 focus:bg-gradient-to-r focus:from-red-50 focus:to-yellow-50">
                          <ChartNoAxesCombined className="h-4 w-4 ml-2 text-red-600" />
                          <span className="font-semibold text-gray-700">
                            {t("Statistics")}
                          </span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <Link to="/settings">
              <Button
                variant="outline"
                size="sm"
                className="relative border-2 border-red-600 text-red-900 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 hover:text-white bg-white h-10 w-10 md:h-11 md:w-11 p-0 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-200 flex-shrink-0"
              >
                <Settings className="size-5" />
              </Button>
            </Link>

            {user?._id ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex bg-gradient-to-r  border-2 border-red-600 text-red-900 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 hover:text-white h-10 md:h-11 text-sm font-bold gap-2 px-4 md:px-5 transition-all duration-300 hover:shadow-lg hover:scale-105 flex-shrink-0"
              >
                <span className="hidden md:inline">{t("logout")}</span>
                <span className="md:hidden">{t("logout")}</span>
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Link to="/login" className="hidden sm:block flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r  border-2 border-red-600 text-red-900 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 hover:text-white h-10 md:h-11 text-sm font-bold gap-2 px-4 md:px-5 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <span className="hidden md:inline">{t("login")}</span>
                  <span className="md:hidden">{t("login")}</span>
                  <LogIn className="h-4 w-4" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-10 w-10 p-0 hover:bg-red-100 text-red-700 transition-all duration-300 flex-shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t-2 border-yellow-300 animate-in slide-in-from-top-2 duration-300 bg-gradient-to-b from-yellow-50/50 to-transparent rounded-b-lg">
            <div className="flex flex-col gap-2 pt-4">
              <Link
                to="/#home"
                onClick={handleLinkClick}
                className="text-base sm:text-lg text-gray-700 hover:text-red-700 font-semibold py-3 px-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-lg transition-all duration-300 border-l-4 border-transparent hover:border-red-600"
              >
                {t("home")}
              </Link>
              <Link
                to="/#menu"
                onClick={handleLinkClick}
                className="text-base sm:text-lg text-gray-700 hover:text-red-700 font-semibold py-3 px-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-lg transition-all duration-300 border-l-4 border-transparent hover:border-red-600"
              >
                {t("menu")}
              </Link>
              <Link
                to="/#about"
                onClick={handleLinkClick}
                className="text-base sm:text-lg text-gray-700 hover:text-red-700 font-semibold py-3 px-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-lg transition-all duration-300 border-l-4 border-transparent hover:border-red-600"
              >
                {t("about_us")}
              </Link>
              <Link
                to="/#contact"
                onClick={handleLinkClick}
                className="text-base sm:text-lg text-gray-700 hover:text-red-700 font-semibold py-3 px-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-lg transition-all duration-300 border-l-4 border-transparent hover:border-red-600"
              >
                {t("contact_us")}
              </Link>

              {(user.role === "admin" || user.role === "employee") && (
                <div className="flex flex-col gap-2 pt-3 mt-2 border-t-2 border-yellow-200">
                  <div className="flex items-center gap-2 px-4 mb-1">
                    <Settings className="h-4 w-4 text-red-900" />
                    <p className="text-xs font-bold text-red-900">
                      {t("control_panel")}
                    </p>
                  </div>
                  {(user.role === "admin" || user.role === "employee") && (
                    <Link to="/admin/dashboard" onClick={handleLinkClick}>
                      <div className="flex items-center gap-3 text-base sm:text-lg text-gray-700 hover:text-red-700 font-semibold py-3 px-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-lg transition-all duration-300 border-l-4 border-transparent hover:border-red-600">
                        <LayoutDashboard className="h-5 w-5 text-red-600" />
                        <span> {t("dashboard")}</span>
                      </div>
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link to="/orders" onClick={handleLinkClick}>
                      <div className="flex items-center gap-3 text-base sm:text-lg text-gray-700 hover:text-red-700 font-semibold py-3 px-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-lg transition-all duration-300 border-l-4 border-transparent hover:border-red-600">
                        <Package className="h-5 w-5 text-red-600" />
                        <span>{t("orders")}</span>
                      </div>
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link to="/admin/add-product" onClick={handleLinkClick}>
                      <div className="flex items-center gap-3 text-base sm:text-lg text-gray-700 hover:text-red-700 font-semibold py-3 px-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-lg transition-all duration-300 border-l-4 border-transparent hover:border-red-600">
                        <Plus className="h-5 w-5 text-red-600" />
                        <span>{t("products")}</span>
                      </div>
                    </Link>
                  )}

                  {user.role === "admin" && (
                    <Link to="/admin/statistics" onClick={handleLinkClick}>
                      <div className="flex items-center gap-3 text-base sm:text-lg text-gray-700 hover:text-red-700 font-semibold py-3 px-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-lg transition-all duration-300 border-l-4 border-transparent hover:border-red-600">
                        <ChartNoAxesCombined className="h-5 w-5 text-red-600" />
                        <span>{t("Statistics")}</span>
                      </div>
                    </Link>
                  )}
                </div>
              )}

              <div className="sm:hidden pt-3 mt-2 border-t-2 border-yellow-200">
                {user?._id ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full bg-gradient-to-r border-2 border-red-600 text-red-900 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 hover:text-white h-12 text-base font-bold gap-2 transition-all duration-300 shadow-md"
                  >
                    {t("logout")} <LogOut className="h-5 w-5" />
                  </Button>
                ) : (
                  <Link to="/login" className="block" onClick={handleLinkClick}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-gradient-to-r  border-2 border-red-600 text-red-900 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 hover:text-white h-12 text-base font-bold gap-2 transition-all duration-300 shadow-md"
                    >
                      {t("login")}
                      <LogIn className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
