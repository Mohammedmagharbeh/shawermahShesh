import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ChefHat, Menu, ShoppingCart, X } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-700">شاورما شيش</h1>
              <p className="text-xs text-gray-600">طعم أصيل ولذيذ</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a
              href="#home"
              className="text-gray-700 hover:text-red-700 font-medium transition-colors"
            >
              الرئيسية
            </a>
            <a
              href="#menu"
              className="text-gray-700 hover:text-red-700 font-medium transition-colors"
            >
              القائمة
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-red-700 font-medium transition-colors"
            >
              من نحن
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-red-700 font-medium transition-colors"
            >
              اتصل بنا
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="relative border-red-700 text-red-700 hover:bg-red-50 bg-transparent"
            >
              <Link to={"/cart"}>
                <ShoppingCart className="h-4 w-4" />
                {cart.products.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-700">
                    {cart.products.length}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-4 pt-4">
              <a
                href="#home"
                className="text-gray-700 hover:text-red-700 font-medium"
              >
                الرئيسية
              </a>
              <a
                href="#menu"
                className="text-gray-700 hover:text-red-700 font-medium"
              >
                القائمة
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-red-700 font-medium"
              >
                من نحن
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-red-700 font-medium"
              >
                اتصل بنا
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
