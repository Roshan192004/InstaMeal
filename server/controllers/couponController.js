// Simple coupon store — replace with DB-backed coupons in production
const COUPONS = {
  WELCOME10: { discount: 10, type: "percent", description: "10% off for new users" },
  FLAT50: { discount: 50, type: "flat", description: "₹50 flat off" },
  SAVE20: { discount: 20, type: "percent", description: "20% off on orders above ₹300", minOrder: 300 },
  INSTAFOOD: { discount: 15, type: "percent", description: "15% off — InstaMeal special" },
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const coupon = COUPONS[code?.toUpperCase()];

    if (!coupon) {
      return res.status(404).json({ valid: false, message: "Invalid coupon code" });
    }

    if (coupon.minOrder && orderTotal < coupon.minOrder) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order of ₹${coupon.minOrder} required`,
      });
    }

    let discountAmount = 0;
    if (coupon.type === "percent") {
      discountAmount = Math.round((orderTotal * coupon.discount) / 100);
    } else {
      discountAmount = coupon.discount;
    }

    res.json({
      valid: true,
      discount: discountAmount,
      description: coupon.description,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
