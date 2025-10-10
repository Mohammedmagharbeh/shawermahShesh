// import { useEffect, useMemo, useState } from "react";
// import {
//   Dialog as DialogUi,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Plus, Minus, ShoppingCart } from "lucide-react";
// import { useCart } from "@/contexts/CartContext";
// import Loading from "@/componenet/common/Loading";
// import toast from "react-hot-toast";
// import product_placeholder from "../../assets/product_placeholder.jpeg";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export function ProductDialog({ id, triggerLabel = "View Product" }) {
//   const [quantity, setQuantity] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [product, setProduct] = useState({
//     _id: "",
//     name: "",
//     price: 0,
//     image: "",
//     category: "",
//     description: "",
//   });
//   const [additions, setAdditions] = useState([]);
//   const [selectedAdditions, setSelectedAdditions] = useState([]);
//   const [spicy, setSpicy] = useState(null); // null, true, false
//   const { addToCart } = useCart();
//   const selectedLanguage = localStorage.getItem("language") || "ar";

//   useEffect(() => {
//     const fetchProductDetails = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(
//           `${import.meta.env.VITE_BASE_URL}/products/${id}`
//         );
//         if (!response.ok) throw new Error("Failed to fetch product details");

//         const data = await response.json();
//         setProduct(data.data);
//       } catch (error) {
//         console.error("Error fetching product details:", error);
//         setProduct({
//           _id: "",
//           name: "",
//           price: 0,
//           image: "",
//           category: "",
//           description: "",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) fetchProductDetails();
//   }, [id]);

//   useEffect(() => {
//     const fetchAdditions = async () => {
//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_BASE_URL}/additions`
//         );
//         if (!response.ok) throw new Error("Failed to fetch additions");

//         const data = await response.json();
//         setAdditions(data.additions);
//       } catch (error) {
//         console.error("Error fetching additions:", error);
//         setAdditions([]);
//       }
//     };
//     fetchAdditions();
//   }, []);

//   const handleQuantityChange = (increment) => {
//     setQuantity((prev) => Math.max(1, prev + increment));
//   };

//   const handleAddToCart = () => {
//     addToCart(product._id, quantity, spicy, selectedAdditions);
//     toast.success(
//       `Added ${quantity} ${product.name[selectedLanguage]} to cart`
//     );
//   };

//   return (
//     <DialogUi>
//       <DialogTrigger asChild>
//         <Button variant="outline">{triggerLabel}</Button>
//       </DialogTrigger>

//       <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {product.name[selectedLanguage] || "Product Details"}
//           </DialogTitle>
//           <DialogDescription>{product.category}</DialogDescription>
//         </DialogHeader>

//         {loading ? (
//           <Loading />
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-4">
//             {/* Product Image */}
//             <div className="relative">
//               <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
//                 <img
//                   src={product.image || product_placeholder}
//                   alt={product.name[selectedLanguage]}
//                   className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
//                 />
//               </div>
//               {product.category && (
//                 <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white">
//                   {product.category}
//                 </Badge>
//               )}
//             </div>

//             {/* Product Details */}
//             <div className="flex flex-col space-y-6">
//               <div>
//                 <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
//                   {product.name[selectedLanguage]}
//                 </h1>
//                 <p className="text-4xl font-bold text-red-500 mb-4">
//                   ${product.price.toFixed(2)}
//                 </p>
//               </div>

//               <p className="text-gray-700 text-lg leading-relaxed">
//                 {product.description[selectedLanguage]}
//               </p>

//               {/* Quantity + Add to Cart */}
//               <div className="space-y-4 mt-6">
//                 <div className="flex flex-col sm:flex-row items-center gap-4">
//                   <div className="flex items-center border-2 border-gray-200 rounded-lg">
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="h-12 w-12 hover:bg-red-50 hover:text-red-500"
//                       onClick={() => handleQuantityChange(-1)}
//                     >
//                       <Minus className="w-4 h-4" />
//                     </Button>
//                     <span className="w-16 text-center font-semibold text-lg">
//                       {quantity}
//                     </span>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="h-12 w-12 hover:bg-red-50 hover:text-red-500"
//                       onClick={() => handleQuantityChange(1)}
//                     >
//                       <Plus className="w-4 h-4" />
//                     </Button>
//                   </div>

//                   <Button
//                     onClick={handleAddToCart}
//                     className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 text-lg font-semibold"
//                   >
//                     <ShoppingCart className="w-5 h-5 mr-2" />
//                     Add to Cart - ${(product.price * quantity).toFixed(2)}
//                   </Button>
//                 </div>
//                 <div className="flex flex-col sm:flex-row items-center gap-4">
//                   {/* sipcy or not radio input */}
//                   <span className="text-lg font-medium text-gray-900 mb-2">
//                     Choose Spiciness:
//                   </span>
//                   <Label className="inline-flex gap-2 items-center justify-center">
//                     <Input
//                       type="radio"
//                       className="form-radio text-red-500"
//                       name="spicy"
//                       value="yes"
//                       onChange={() => setSpicy(true)}
//                     />
//                     <span className="ml-2">Spicy</span>
//                   </Label>
//                   <Label className="inline-flex gap-2 items-center justify-center ml-6">
//                     <Input
//                       type="radio"
//                       className="form-radio text-red-500"
//                       name="spicy"
//                       value="no"
//                       defaultChecked
//                       onChange={() => setSpicy(false)}
//                     />
//                     <span className="ml-2">Not Spicy</span>
//                   </Label>
//                 </div>
//                 <div>
//                   {additions?.map((addition) => (
//                     <div key={addition._id} className="flex items-center gap-2">
//                       <Input
//                         type="checkbox"
//                         id={addition._id}
//                         name="addition"
//                         value={addition._id}
//                         className="form-checkbox h-5 w-5 text-red-500"
//                         onChange={(e) => {
//                           if (e.target.checked) {
//                             setSelectedAdditions((prev) => [
//                               ...prev,
//                               addition._id,
//                             ]);
//                           } else {
//                             setSelectedAdditions((prev) =>
//                               prev.filter((id) => id !== addition._id)
//                             );
//                           }
//                         }}
//                       />
//                       <Label htmlFor={addition._id} className="text-gray-700">
//                         {addition.name} (+$
//                         {addition.price.toFixed(2)})
//                       </Label>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
//           <DialogClose asChild>
//             <Button
//               variant="outline"
//               className="w-full sm:w-auto bg-transparent"
//             >
//               Close
//             </Button>
//           </DialogClose>
//         </DialogFooter>
//       </DialogContent>
//     </DialogUi>
//   );
// }


import { useEffect, useState } from "react";
import {
  Dialog as DialogUi,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Loading from "@/componenet/common/Loading";
import toast from "react-hot-toast";
import product_placeholder from "../../assets/product_placeholder.jpeg";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProductDialog({ id, triggerLabel = "View Product" }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState({
    _id: "",
    name: "",
    price: 0,
    image: "",
    category: "",
    description: "",
  });
  const [additions, setAdditions] = useState([]);
  const [selectedAdditions, setSelectedAdditions] = useState([]);
  const [spicy, setSpicy] = useState(null); // null, true, false
  const { addToCart } = useCart();
  const selectedLanguage = localStorage.getItem("language") || "ar";

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/products/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch product details");
        const data = await response.json();
        setProduct(data.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductDetails();
  }, [id]);

  useEffect(() => {
    const fetchAdditions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/additions`
        );
        if (!response.ok) throw new Error("Failed to fetch additions");
        const data = await response.json();
        setAdditions(data.additions);
      } catch (error) {
        console.error("Error fetching additions:", error);
        setAdditions([]);
      }
    };
    fetchAdditions();
  }, []);

  const handleQuantityChange = (increment) => {
    setQuantity((prev) => Math.max(1, prev + increment));
  };

  const handleAddToCart = () => {
    // 🧠 حفظ الإضافات كاملة مع الاسم والسعر
    const selectedFullAdditions = additions.filter((a) =>
      selectedAdditions.includes(a._id)
    );

    addToCart(product._id, quantity, spicy, selectedFullAdditions);
    toast.success(
      `✅ تمت إضافة ${quantity} من ${product.name[selectedLanguage]}`
    );
  };

  return (
    <DialogUi>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product.name[selectedLanguage] || "Product Details"}
          </DialogTitle>
          <DialogDescription>{product.category}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-4">
            {/* صورة المنتج */}
            <div className="relative">
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={product.image || product_placeholder}
                  alt={product.name[selectedLanguage]}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {product.category && (
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white">
                  {product.category}
                </Badge>
              )}
            </div>

            {/* تفاصيل المنتج */}
            <div className="flex flex-col space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {product.name[selectedLanguage]}
                </h1>
                <p className="text-4xl font-bold text-red-500 mb-4">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">
                {product.description[selectedLanguage]}
              </p>

              <div className="space-y-4 mt-6">
                {/* الكمية */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 hover:bg-red-50 hover:text-red-500"
                      onClick={() => handleQuantityChange(-1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-16 text-center font-semibold text-lg">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 hover:bg-red-50 hover:text-red-500"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 text-lg font-semibold"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    أضف إلى السلة - ${(product.price * quantity).toFixed(2)}
                  </Button>
                </div>

                {/* اختيار حار أو غير حار */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <span className="text-lg font-medium text-gray-900 mb-2">
                    اختر درجة الحارة:
                  </span>
                  <Label className="inline-flex gap-2 items-center">
                    <Input
                      type="radio"
                      name="spicy"
                      value="yes"
                      onChange={() => setSpicy(true)}
                    />
                    <span>🌶️ حار</span>
                  </Label>
                  <Label className="inline-flex gap-2 items-center ml-6">
                    <Input
                      type="radio"
                      name="spicy"
                      value="no"
                      defaultChecked
                      onChange={() => setSpicy(false)}
                    />
                    <span>❄️ غير حار</span>
                  </Label>
                </div>

                {/* الإضافات */}
                <div>
                  {additions?.map((addition) => (
                    <div key={addition._id} className="flex items-center gap-2">
                      <Input
                        type="checkbox"
                        id={addition._id}
                        value={addition._id}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAdditions((prev) => [
                              ...prev,
                              addition._id,
                            ]);
                          } else {
                            setSelectedAdditions((prev) =>
                              prev.filter((id) => id !== addition._id)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={addition._id} className="text-gray-700">
                        {addition.name} (+${addition.price.toFixed(2)})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              إغلاق
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </DialogUi>
  );
}
