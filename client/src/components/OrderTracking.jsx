import { useEffect, useState } from "react";
import socket from "../services/socket";

function OrderTracking() {
  const [status, setStatus] = useState("Waiting...");

  useEffect(() => {

    const handleOrderStatus = (data) => {
      console.log("📦 Received:", data);

      // ✅ Directly update status (NO orderId logic)
      setStatus(data.status);
    };

    socket.on("orderStatus", handleOrderStatus);

    return () => {
      socket.off("orderStatus", handleOrderStatus);
    };

  }, []);

  return (
    <div>
      <h2>Order Status</h2>
      <h3>{status}</h3>
    </div>
  );
}

export default OrderTracking;