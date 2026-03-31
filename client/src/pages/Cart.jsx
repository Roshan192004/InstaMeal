import { useState } from "react";
import API from "../services/api";
import OrderTracking from "../components/OrderTracking";

function Cart() {
  const [orderId, setOrderId] = useState(null);

  const placeOrder = async () => {
    const token = localStorage.getItem("token");

    const { data } = await API.post(
      "/orders",
      {
        items: [{ name: "Pizza", price: 200, quantity: 1 }],
        totalPrice: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setOrderId(data._id);
  };

  return (
    <div style={styles.container}>
      <h2>Your Cart 🛒</h2>

      <button onClick={placeOrder} style={styles.button}>
        Place Order
      </button>

      {orderId && <OrderTracking orderId={orderId} />}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
  },
  button: {
    padding: "10px 20px",
    background: "orange",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Cart;