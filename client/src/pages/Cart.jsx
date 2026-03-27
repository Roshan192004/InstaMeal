import OrderTracking from "../components/OrderTracking";

function Cart() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Cart Page 🛒</h2>

      {/* ✅ No orderId needed now */}
      <OrderTracking />
    </div>
  );
}

export default Cart;