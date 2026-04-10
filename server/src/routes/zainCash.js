// const express = require("express");
// const {
//   initiatePayment,
//   confirmPayment,
// } = require("../controller/zainCash.js");

// const router = express.Router();

// router.post("/zain/initiate", async (req, res) => {
//   try {
//     const { amount, mobile } = req.body;
//     console.log('init zain');
    
//     const result = await initiatePayment({ amount, mobile });

//     return res.json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "OTP initiation failed" });
//   }
// });

// router.post("/zain/confirm", async (req, res) => {
//   try {
//     const { amount, mobile, otp } = req.body;

//     const result = await confirmPayment({
//       amount,
//       mobile,
//       otp,
//     });

//     return res.json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Payment failed" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const { initiatePayment, confirmPayment } = require("../controller/zainCash");

// مسار بدء الدفع (ارسال OTP)
router.post("/zain/initiate", async (req, res) => {
  try {
    const { amount, mobile } = req.body;

    if (!amount || !mobile) {
      return res.status(400).json({ message: "المبلغ ورقم الهاتف مطلوبان" });
    }

    const result = await initiatePayment({ amount, mobile });

    // فحص إذا كان رد زين كاش يحتوي على خطأ في المعالجة
    if (result.ResultType === "Error") {
      return res.status(400).json({ 
        message: "فشل في إرسال الرمز", 
        detail: result.Description || result.ErrorMsg 
      });
    }

    return res.json(result);
  } catch (error) {
    console.error("Initiate Route Error:", error.message);
    res.status(500).json({ 
      message: "OTP initiation failed", 
      error: error.response?.data || error.message 
    });
  }
});

// مسار تأكيد الدفع (ادخال OTP)
router.post("/zain/confirm", async (req, res) => {
  try {
    const { amount, mobile, otp, note } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "رمز التحقق (OTP) مطلوب" });
    }

    const result = await confirmPayment({ amount, mobile, otp, note });

    if (result.ResultType === "Error") {
      return res.status(400).json({ 
        message: "فشل تأكيد عملية الدفع", 
        detail: result.Description || result.ErrorMsg 
      });
    }

    return res.json(result);
  } catch (error) {
    console.error("Confirm Route Error:", error.message);
    res.status(500).json({ 
      message: "Payment confirmation failed", 
      error: error.response?.data || error.message 
    });
  }
});

module.exports = router;