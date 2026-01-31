import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-red-600">Payment Failed</h1>
      <p className="text-gray-600 mt-2">
        Unfortunately, your payment could not be processed.
      </p>
      <button
        onClick={() => navigate("/checkout")}
        className="mt-4 px-6 py-2 bg-red-500 text-white rounded"
      >
        Try Again
      </button>
    </div>
  );
};

export default PaymentFailed;
