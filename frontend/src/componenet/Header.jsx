// // import { Badge } from "@/components/ui/badge";
// // import { Button } from "@/components/ui/button";
// // import { useCart } from "@/contexts/CartContext";
// // import { useUser } from "@/contexts/UserContext";
// // import { ChefHat, LogIn, LogOut, Menu, ShoppingCart, X } from "lucide-react";
// // import React, { useState } from "react";
// // import { Link } from "react-router-dom";

// // function Header() {
// //   const [isMenuOpen, setIsMenuOpen] = useState(false);
// //   const { cart } = useCart();
// //   const { user } = useUser();

// //   const handleSmoothScroll = (event, targetId) => {
// //     event.preventDefault();
// //     const targetElement = document.getElementById(targetId);
// //     if (targetElement) {
// //       targetElement.scrollIntoView({ behavior: "smooth" });
// //     }
// //     setIsMenuOpen(false);
// //   };

// //   return (
// //     <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 shadow-sm">
// //       <div className="container mx-auto px-4 py-4">
// //         <div className="flex items-center justify-between">
// //           <div className="flex items-center gap-3">
// //             <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center">
// //               <ChefHat className="h-6 w-6 text-white" />
// //             </div>
// //             <div>
// //               <h1 className="text-2xl font-bold text-red-700">شاورما شيش</h1>
// //               <p className="text-xs text-gray-600">طعم أصيل ولذيذ</p>
// //             </div>
// //           </div>

// //           <div className="hidden md:flex items-center gap-6">
// //             <a
// //               href="#home"
// //               onClick={(e) => handleSmoothScroll(e, "home")}
// //               className="text-gray-700 hover:text-red-700 font-medium transition-colors"
// //             >
// //               الرئيسية
// //             </a>
// //             <a
// //               href="#menu"
// //               onClick={(e) => handleSmoothScroll(e, "menu")}
// //               className="text-gray-700 hover:text-red-700 font-medium transition-colors"
// //             >
// //               القائمة
// //             </a>
// //             <a
// //               href="#about"
// //               onClick={(e) => handleSmoothScroll(e, "about")}
// //               className="text-gray-700 hover:text-red-700 font-medium transition-colors"
// //             >
// //               من نحن
// //             </a>
// //             <a
// //               href="#contact"
// //               onClick={(e) => handleSmoothScroll(e, "contact")}
// //               className="text-gray-700 hover:text-red-700 font-medium transition-colors"
// //             >
// //               اتصل بنا
// //             </a>
// //           </div>

// //           <div className="flex items-center gap-4">
// //             <Link to={"/cart"}>
// //               <Button
// //                 variant="outline"
// //                 size="sm"
// //                 className="relative border-red-700 text-red-700 hover:bg-red-50 bg-transparent"
// //               >
// //                 <ShoppingCart className="h-4 w-4" />
// //                 {cart.products.length > 0 && (
// //                   <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-700">
// //                     {cart.products.length}
// //                   </Badge>
// //                 )}
// //               </Button>
// //             </Link>
// //             {user?._id ? (
// //               <Button
// //                 variant="outline"
// //                 size="sm"
// //                 className="bg-transparent border-red-700 text-red-700 hover:bg-red-50"
// //               >
// //                 Logout
// //                 <LogOut className="size-4 relative border-red-700 text-red-700 hover:bg-red-50 bg-transparent" />
// //               </Button>
// //             ) : (
// //               <Link to={"/login"}>
// //                 <Button
// //                   variant="outline"
// //                   size="sm"
// //                   className="bg-transparent border-red-700 text-red-700 hover:bg-red-50"
// //                 >
// //                   Login
// //                   <LogIn className="size-4 relative border-red-700 text-red-700 hover:bg-red-50 bg-transparent" />
// //                 </Button>
// //               </Link>
// //             )}

// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               className="md:hidden"
// //               onClick={() => setIsMenuOpen(!isMenuOpen)}
// //             >
// //               {isMenuOpen ? (
// //                 <X className="h-5 w-5" />
// //               ) : (
// //                 <Menu className="h-5 w-5" />
// //               )}
// //             </Button>
// //           </div>
// //         </div>

// //         {isMenuOpen && (
// //           <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
// //             <div className="flex flex-col gap-4 pt-4">
// //               <a
// //                 href="#home"
// //                 onClick={(e) => handleSmoothScroll(e, "home")}
// //                 className="text-gray-700 hover:text-red-700 font-medium"
// //               >
// //                 الرئيسية
// //               </a>
// //               <a
// //                 href="#menu"
// //                 onClick={(e) => handleSmoothScroll(e, "menu")}
// //                 className="text-gray-700 hover:text-red-700 font-medium"
// //               >
// //                 القائمة
// //               </a>
// //               <a
// //                 href="#about"
// //                 onClick={(e) => handleSmoothScroll(e, "about")}
// //                 className="text-gray-700 hover:text-red-700 font-medium"
// //               >
// //                 من نحن
// //               </a>
// //               <a
// //                 href="#contact"
// //                 onClick={(e) => handleSmoothScroll(e, "contact")}
// //                 className="text-gray-700 hover:text-red-700 font-medium"
// //               >
// //                 اتصل بنا
// //               </a>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </nav>
// //   );
// // }

// // export default Header;
   
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// // افتراض أن useCart و useUser موجودان ولديهما دالة logout
// import { useCart } from "@/contexts/CartContext";
// import { useUser } from "@/contexts/UserContext";
// import { ChefHat, LogIn, LogOut, Menu, ShoppingCart, X } from "lucide-react";
// import React, { useState } from "react";
// import { Link } from "react-router-dom";

// function Header() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const { cart } = useCart();
//   // افتراض أن userContext يوفر دالة logout
//   const { user, logout } = useUser(); 

//   // دالة بسيطة لإغلاق القائمة في الجوال عند النقر على رابط
//   const handleLinkClick = () => {
//     setIsMenuOpen(false); 
//   };
  
//   // دالة تسجيل الخروج (يمكنك تخصيصها بناءً على منطقك)
//   const handleLogout = () => {
//     logout(); 
//     setIsMenuOpen(false);
//   }

//   return (
//     <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-yellow-200 z-50 shadow-sm">
//       <div className="container mx-auto px-4 py-4">
//         <div className="flex items-center justify-between">
          
//           {/* الشعار والاسم */}
//           <div className="flex items-center gap-3">
// <Link to="/"> 
//   <div className="flex items-center gap-3">
//     <div className="w-12 h-12 rounded-full overflow-hidden bg-red-700 flex items-center justify-center">
//       <img
//         src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDzGI9tRqzIVulcl3ghkfQ61TOgQmkuOt3gg&s"
//         alt="شاورما شيش"
//         className="w-full h-full object-cover"
//       />
//     </div>
//     <div>
// <h1 className="text-2xl font-bold text-red-700 text-shadow-yellow">
//   شاورما شيش
// </h1>
//       <p className="text-xs text-gray-600">طعم أصيل ولذيذ</p>
//     </div>
//   </div>
// </Link>

//           </div>

//           {/* روابط التصفح للشاشات الكبيرة */}
//           <div className="hidden md:flex items-center gap-6">
//             <Link
//               to="/#home"
//               onClick={handleLinkClick}
//               className="text-gray-700 hover:text-red-700 font-medium transition-colors"
//             >
//               الرئيسية
//             </Link>
//             <Link
//               to="/#menu"
//               onClick={handleLinkClick}
//               className="text-gray-700 hover:text-red-700 font-medium transition-colors"
//             >
//               القائمة
//             </Link>
//             <Link
//               to="/#about"
//               onClick={handleLinkClick}
//               className="text-gray-700 hover:text-red-700 font-medium transition-colors"
//             >
//               من نحن
//             </Link>
//             <Link
//               to="/#contact"
//               onClick={handleLinkClick}
//               className="text-gray-700 hover:text-red-700 font-medium transition-colors"
//             >
//               اتصل بنا
//             </Link>
//           </div>

//           {/* أيقونات ووظائف */}
//           <div className="flex items-center gap-4">
//             {/* أيقونة السلة */}
//             <Link to={"/cart"}>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="relative border-red-700 text-red-700 hover:bg-red-50 bg-transparent"
//               >
//                 <ShoppingCart className="h-4 w-4" />
//                 {/* عرض عدد العناصر الإجمالي في السلة */}
//                 {cart.products.length > 0 && (
//                   <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-700">
//                     {cart.products.length}
//                   </Badge>
//                 )}
//               </Button>
//             </Link>
            
//             {/* زر تسجيل الدخول/الخروج */}
//             {user?._id ? (
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={handleLogout}
//                 className="bg-transparent border-red-700 text-red-700 hover:bg-red-50"
//               >
//                 تسجيل خروج
//                 <LogOut className="ml-2 size-4" />
//               </Button>
//             ) : (
//               <Link to={"/login"}>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="bg-transparent border-red-700 text-red-700 hover:bg-red-50"
//                 >
//                   تسجيل دخول
//                   <LogIn className="ml-2 size-4" />
//                 </Button>
//               </Link>
//             )}

//             {/* زر قائمة الجوال */}
//             <Button
//               variant="ghost"
//               size="sm"
//               className="md:hidden"
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//             >
//               {isMenuOpen ? (
//                 <X className="h-5 w-5" />
//               ) : (
//                 <Menu className="h-5 w-5" />
//               )}
//             </Button>
//           </div>
//         </div>

//         {/* قائمة الجوال المفتوحة */}
//         {isMenuOpen && (
//           <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
//             <div className="flex flex-col gap-4 pt-4">
//               <Link
//                 to="/#home"
//                 onClick={handleLinkClick}
//                 className="text-gray-700 hover:text-red-700 font-medium"
//               >
//                 الرئيسية
//               </Link>
//               <Link
//                 to="/#menu"
//                 onClick={handleLinkClick}
//                 className="text-gray-700 hover:text-red-700 font-medium"
//               >
//                 القائمة
//               </Link>
//               <Link
//                 to="/#about"
//                 onClick={handleLinkClick}
//                 className="text-gray-700 hover:text-red-700 font-medium"
//               >
//                 من نحن
//               </Link>
//               <Link
//                 to="/#contact"
//                 onClick={handleLinkClick}
//                 className="text-gray-700 hover:text-red-700 font-medium"
//               >
//                 اتصل بنا
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }

// export default Header;


import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"
import { useUser } from "@/contexts/UserContext"
import { LogIn, LogOut, Menu, ShoppingCart, X } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cart } = useCart()
  const { user, logout } = useUser()

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-yellow-200 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link to="/" className="flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-red-700 flex items-center justify-center flex-shrink-0">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDzGI9tRqzIVulcl3ghkfQ61TOgQmkuOt3gg&s"
                  alt="شاورما شيش"
                  className="w-full h-full object-cover"
                />
                
              </div>
               <div>
<h1 className="text-2xl font-bold text-red-700 text-shadow-yellow">
  شاورما شيش
</h1>
      <p className="text-xs text-gray-600-italic">طعم أصيل ولذيذ</p>
    </div>
              <div className="hidden xs:block">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-red-700">شاورما شيش</h1>
                <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">طعم أصيل ولذيذ</p>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link
              to="/#home"
              onClick={handleLinkClick}
              className="text-sm xl:text-base text-gray-700 hover:text-red-700 font-medium transition-colors whitespace-nowrap"
            >
              الرئيسية
            </Link>
            <Link
              to="/#menu"
              onClick={handleLinkClick}
              className="text-sm xl:text-base text-gray-700 hover:text-red-700 font-medium transition-colors whitespace-nowrap"
            >
              القائمة
            </Link>
            <Link
              to="/#about"
              onClick={handleLinkClick}
              className="text-sm xl:text-base text-gray-700 hover:text-red-700 font-medium transition-colors whitespace-nowrap"
            >
              من نحن
            </Link>
            <Link
              to="/#contact"
              onClick={handleLinkClick}
              className="text-sm xl:text-base text-gray-700 hover:text-red-700 font-medium transition-colors whitespace-nowrap"
            >
              اتصل بنا
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart button */}
            <Link to="/cart">
              <Button
                variant="outline"
                size="sm"
                className="relative border-red-700 text-red-700 hover:bg-red-50 bg-transparent h-9 w-9 sm:h-10 sm:w-10 p-0"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cart.products.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs bg-red-700 border-2 border-white">
                    {cart.products.length}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Login/Logout button - hidden on smallest screens, shown on sm+ */}
            {user?._id ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex bg-transparent border-red-700 text-red-700 hover:bg-red-50 h-9 sm:h-10 text-xs sm:text-sm gap-1 sm:gap-2 px-2 sm:px-3"
              >
                <span className="hidden md:inline">تسجيل خروج</span>
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            ) : (
              <Link to="/login" className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-red-700 text-red-700 hover:bg-red-50 h-9 sm:h-10 text-xs sm:text-sm gap-1 sm:gap-2 px-2 sm:px-3"
                >
                  <span className="hidden md:inline">تسجيل دخول</span>
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 sm:h-10 sm:w-10 p-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-3 sm:mt-4 pb-3 sm:pb-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-3 sm:gap-4 pt-3 sm:pt-4">
              <Link
                to="/#home"
                onClick={handleLinkClick}
                className="text-base sm:text-lg text-gray-700 hover:text-red-700 font-medium py-2 px-2 hover:bg-red-50 rounded-lg transition-all"
              >
                الرئيسية
              </Link>
              <Link
                to="/#menu"
                onClick={handleLinkClick}
                className="text-base sm:text-lg text-gray-700 hover:text-red-700 font-medium py-2 px-2 hover:bg-red-50 rounded-lg transition-all"
              >
                القائمة
              </Link>
              <Link
                to="/#about"
                onClick={handleLinkClick}
                className="text-base sm:text-lg text-gray-700 hover:text-red-700 font-medium py-2 px-2 hover:bg-red-50 rounded-lg transition-all"
              >
                من نحن
              </Link>
              <Link
                to="/#contact"
                onClick={handleLinkClick}
                className="text-base sm:text-lg text-gray-700 hover:text-red-700 font-medium py-2 px-2 hover:bg-red-50 rounded-lg transition-all"
              >
                اتصل بنا
              </Link>

              {/* Mobile-only login/logout button */}
              <div className="sm:hidden pt-2 border-t border-gray-200">
                {user?._id ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full bg-transparent border-red-700 text-red-700 hover:bg-red-50 h-11 text-base gap-2"
                  >
                    تسجيل خروج
                    <LogOut className="h-4 w-4" />
                  </Button>
                ) : (
                  <Link to="/login" className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent border-red-700 text-red-700 hover:bg-red-50 h-11 text-base gap-2"
                    >
                      تسجيل دخول
                      <LogIn className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Header
