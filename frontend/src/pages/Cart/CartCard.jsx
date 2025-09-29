function CartCard({ product, handleQuantityChange, removeCartItem }) {
  return (
    <div className="items-center p-4 shadow-md border-gray-200 grid max-sm:grid-cols-1 lg:grid-cols-4">
      <div className="flex items-center space-x-4">
        <button
          className="text-red-500 text-xl"
          onClick={() => removeCartItem(product.productId._id)}
        >
          ❌
        </button>
        <img
          src={product?.images?.[0]}
          alt={product.name}
          className="w-12 h-12 object-cover"
        />
        <span>{product.productId.name}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="max-sm:block lg:hidden">Price:</span>
        <span className="text-center">${product.productId.price}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="max-sm:block lg:hidden">Quantity:</span>
        <input
          type="number"
          value={product.quantity}
          onChange={(e) => handleQuantityChange(e, product.productId._id)}
          className="w-16 px-2 py-1 border rounded text-center"
          min="1"
        />
      </div>
      <div className="flex justify-between gap-4">
        <span className="max-sm:block lg:hidden">Total:</span>
        <span className="text-center">
          ${(product.productId.price * product.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export default CartCard;
