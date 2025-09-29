// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import Loading from "../componenet/common/Loading";

// function ProductView() {
//   const { id } = useParams();
//   const [product, setProduct] = useState({
//     _id: "",
//     name: "",
//     price: 0,
//     image: "",
//     category: "",
//     description: "",
//   });
//   const [quantity, setQuantity] = useState(1);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProductDetails = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(
//           `http://localhost:5000/api/products/${id}`
//         );
//         if (!response.ok) {
//           throw new Error("Failed to fetch product details");
//         }
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

//     fetchProductDetails();

//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }, [id]);

//   const handleQuantityChange = (increment) => {
//     setQuantity((prev) => Math.max(1, prev + increment));
//   };

//   if (loading) return <Loading />;

//   return (
//     <div className="flex flex-col max-sm:px-[72px] mx-[135px] py-20">
//       <div className="flex gap-[30px] max-sm:flex-col md:flex-col lg:flex-row max-sm:items-center">
//         <div className="min-w-[500px] min-h-[600px] max-w-[500px] max-h-[600px] bg-secondary overflow-hidden px-10">
//           <img src={"src"} alt={product.name} className="" />
//         </div>
//         <div className="flex flex-col gap-4 text-start mx-[70px]">
//           <h1 className="text-2xl font-semibold">{product.name}</h1>

//           <p className="text-2xl">${product.price.toFixed(2)}</p>
//           <p className="text-sm">{product.description}</p>
//           <hr className="border-t border-gray-300 my-4" />

//           {/* Color and Size Selection */}
//           <div className="flex gap-4 items-center mb-10">
//             <div className="flex items-center border">
//               <button
//                 className="border w-10 h-11 hover:bg-button2 hover:text-white transition-colors"
//                 onClick={() => handleQuantityChange(-1)}
//               >
//                 <span className="text-xl">-</span>
//               </button>
//               <span className="w-20 text-center">{quantity}</span>
//               <button
//                 className="border w-10 h-11 hover:bg-button2 hover:text-white transition-colors"
//                 onClick={() => handleQuantityChange(1)}
//               >
//                 <span className="text-xl">+</span>
//               </button>
//             </div>
//             <button className="bg-button2 py-3 text-white rounded-md w-[165px] hover:bg-secondary hover:text-black border hover:border-black transition-colors">
//               Add To Cart
//             </button>
//             <button
//               className="border w-[40px] h-[40px] py-1 px-1 rounded-md"
//               onClick={() => setWishListItems(product)}
//             >
//               <svg
//                 width="22"
//                 height="20"
//                 viewBox="0 0 22 20"
//                 // fill={`${
//                 //   wishList.some((item) => item?.id === parseInt(id))
//                 //     ? "#DB4444"
//                 //     : "none"
//                 // }`}
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="hover:fill-button2 ml-1"
//               >
//                 <path
//                   d="M6 1C3.239 1 1 3.216 1 5.95C1 8.157 1.875 13.395 10.488 18.69C10.6423 18.7839 10.8194 18.8335 11 18.8335C11.1806 18.8335 11.3577 18.7839 11.512 18.69C20.125 13.395 21 8.157 21 5.95C21 3.216 18.761 1 16 1C13.239 1 11 4 11 4C11 4 8.761 1 6 1Z"
//                   stroke="black"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProductView;

import { useEffect, useState } from "react";
import {
  Star,
  Clock,
  Flame,
  Leaf,
  Heart,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import pizza from "../assets/pizza.jpg";

function ProductView() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  // const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState({
    _id: "",
    name: "",
    price: 0,
    image: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/products/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        const data = await response.json();
        setProduct(data.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setProduct({
          _id: "",
          name: "",
          price: 0,
          image: "",
          category: "",
          description: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const handleQuantityChange = (increment) => {
    setQuantity((prev) => Math.max(1, prev + increment));
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log(`Added ${quantity} ${product.name} to cart`);
  };

  // const toggleFavorite = () => {
  //   setIsFavorite(!isFavorite);
  // };

  // const renderSpiceLevel = (level) => {
  //   return Array.from({ length: 3 }, (_, i) => (
  //     <Flame
  //       key={i}
  //       className={`w-4 h-4 ${i < level ? "fill-red-500 text-red-500" : "text-gray-300"}`}
  //     />
  //   ));
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative">
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={pizza}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white">
            {product.category}
          </Badge>
        </div>

        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div> */}

            <p className="text-4xl font-bold text-red-500 mb-4">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed">
            {product.description}
          </p>

          {/* <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600">
                {product.prepTime} min prep
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {product.calories} calories
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Spice Level:</span>
              <div className="flex gap-1">
                {renderSpiceLevel(product.spiceLevel || 0)}
              </div>
            </div>
          </div> */}

          {/* <div className="flex flex-wrap gap-2">
            {product.isVegetarian && (
              <Badge
                variant="outline"
                className="border-green-500 text-green-700"
              >
                <Leaf className="w-3 h-3 mr-1" />
                Vegetarian
              </Badge>
            )}
            {product.isVegan && (
              <Badge
                variant="outline"
                className="border-green-600 text-green-800"
              >
                Vegan
              </Badge>
            )}
            {product.isGlutenFree && (
              <Badge
                variant="outline"
                className="border-blue-500 text-blue-700"
              >
                Gluten-Free
              </Badge>
            )}
          </div> */}

          <div className="space-y-4">
            <div className="flex items-center gap-4">
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
                Add to Cart - ${(product.price * quantity).toFixed(2)}
              </Button>

              {/* <Button
                variant="outline"
                size="sm"
                className={`h-12 w-12 ${
                  isFavorite
                    ? "bg-red-50 border-red-500 text-red-500"
                    : "hover:bg-red-50 hover:border-red-500 hover:text-red-500"
                }`}
                onClick={toggleFavorite}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                />
              </Button> */}
            </div>
          </div>

          {/* {product.ingredients && product.ingredients.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Ingredients:</h3>
              <p className="text-sm text-gray-600">
                {product.ingredients.join(", ")}
              </p>
            </div>
          )}

          {product.allergens && product.allergens.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Allergens:</h3>
              <p className="text-sm text-red-600 font-medium">
                Contains: {product.allergens.join(", ")}
              </p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default ProductView;
