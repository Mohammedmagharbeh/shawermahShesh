import { useContext } from "react";

function CartCard({ product }) {
  //   const handleQuantityChange = (e) => {
  //     const newQuantity = parseInt(e.target.value, 10) || 1;
  //     setCart((prevCart) =>
  //       prevCart.map((item) =>
  //         item.id === product.id ? { ...item, quantity: newQuantity } : item
  //       )
  //     );
  //   };

  const discountPrice = (
    product.price -
    (product.price * product.discountPercentage) / 100
  ).toFixed(2);

  return (
    <div className="items-center p-4 shadow-md border-gray-200 max-sm:flex-col lg:grid max-sm:grid-cols-1 lg:grid-cols-4">
      <div className="flex items-center space-x-4">
        <button
          className="text-red-500 text-xl"
          //   onClick={() => removeCartItem(product.id)}
        >
          ❌
        </button>
        <img
          src={product?.images?.[0]}
          alt={product.name}
          className="w-12 h-12 object-cover"
        />
        <span>{product.name}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="max-sm:block lg:hidden">Price:</span>
        <span className="text-center">${discountPrice}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="max-sm:block lg:hidden">Quantity:</span>
        <input
          type="number"
          value={product.quantity}
          //   onChange={handleQuantityChange}
          className="w-16 px-2 py-1 border rounded text-center"
          min="1"
        />
      </div>
      <div className="flex justify-between gap-4">
        <span className="max-sm:block lg:hidden">Total:</span>
        <span className="text-center">
          ${(discountPrice * product.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export default CartCard;
