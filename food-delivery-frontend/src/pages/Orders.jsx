import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Home,
  Package,
  Receipt,
  RefreshCw,
  ShoppingBag,
  Star,
  Truck
} from "lucide-react";

import "./Orders.css";

const API_URL = "http://localhost:8082";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId =
    localStorage.getItem("foodrushUserId") || "1";

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/orders/user/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to load your orders."
        );
      }

      const sortedOrders = [...data].sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

      setOrders(sortedOrders);

      const itemsMap = {};

      await Promise.all(
        sortedOrders.map(async (order) => {
          try {
            const itemsResponse =
              await fetch(
                `${API_URL}/orders/${order.id}/items`
              );

            if (itemsResponse.ok) {
              const items =
                await itemsResponse.json();

              itemsMap[order.id] = items;
            }
          } catch (err) {
            console.error(
              `Unable to load items for order ${order.id}:`,
              err
            );
          }
        })
      );

      setOrderItems(itemsMap);

    } catch (err) {
      setError(
        err.message ||
        "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString(
      "en-IN"
    )}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    return new Date(dateString).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }
    );
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PLACED":
        return "Order placed";

      case "PREPARING":
        return "Preparing";

      case "OUT_FOR_DELIVERY":
        return "Out for delivery";

      case "DELIVERED":
        return "Delivered";

      default:
        return status || "Unknown";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "OUT_FOR_DELIVERY":
        return Truck;

      case "DELIVERED":
        return Package;

      case "PREPARING":
        return Clock;

      default:
        return Receipt;
    }
  };

  const isActiveOrder = (status) => {
    return (
      status === "PLACED" ||
      status === "PREPARING" ||
      status === "OUT_FOR_DELIVERY"
    );
  };

  const reorder = async (orderId) => {
    const items = orderItems[orderId] || [];

    if (items.length === 0) {
      return;
    }

    try {
      for (const item of items) {
        await fetch(
          `${API_URL}/cart/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              userId: Number(userId),
              menuItemId: item.menuItemId,
              quantity: item.quantity
            })
          }
        );
      }

      navigate("/cart");

    } catch (err) {
      setError(
        "Unable to reorder these items."
      );
    }
  };

  if (loading) {
    return (
      <div className="orders-loading">

        <div className="orders-spinner"></div>

        <p>
          Loading your orders...
        </p>

      </div>
    );
  }

  return (
    <div className="orders-page">

      {/* NAVBAR */}

      <header className="orders-navbar">

        <Link
          to="/"
          className="orders-logo"
        >
          <span className="orders-logo-mark">
            F
          </span>

          FoodRush
        </Link>

        <nav className="orders-nav">

          <Link to="/">
            Home
          </Link>

          <Link
            to="/cart"
            className="orders-cart-link"
          >
            Cart
          </Link>

        </nav>

        <div className="orders-nav-badge">
          <ShoppingBag size={16} />
          My Orders
        </div>

      </header>

      {/* MAIN */}

      <main className="orders-main">

        <Link
          to="/"
          className="orders-back"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="orders-heading">

          <div>

            <span className="orders-eyebrow">
              YOUR FOOD JOURNEY
            </span>

            <h1>
              My Orders
            </h1>

            <p>
              Track your current orders and
              revisit your favourites.
            </p>

          </div>

          <button
            className="orders-refresh"
            onClick={loadOrders}
          >
            <RefreshCw size={15} />
            Refresh
          </button>

        </div>

        {error && (
          <div className="orders-error">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}

        {orders.length === 0 && !error && (
          <section className="orders-empty">

            <div className="orders-empty-icon">
              🍽️
            </div>

            <h2>
              No orders yet
            </h2>

            <p>
              Your delicious food journey starts
              here. Explore restaurants and place
              your first order.
            </p>

            <Link
              to="/"
              className="browse-restaurants-button"
            >
              Browse restaurants
              <ChevronRight size={16} />
            </Link>

          </section>
        )}

        {/* ORDERS */}

        <div className="orders-list">

          {orders.map((order) => {

            const items =
              orderItems[order.id] || [];

            const StatusIcon =
              getStatusIcon(order.status);

            return (
              <article
                className="order-history-card"
                key={order.id}
              >

                {/* CARD HEADER */}

                <div className="order-history-header">

                  <div className="order-history-restaurant">

                    <div className="order-restaurant-icon">
                      🍛
                    </div>

                    <div>

                      <h2>
                        Paradise Biryani
                      </h2>

                      <span>
                        Indian • Chennai
                      </span>

                    </div>

                  </div>

                  <div
                    className={
                      order.status ===
                      "DELIVERED"
                        ? "order-status delivered"
                        : "order-status active"
                    }
                  >

                    <StatusIcon size={14} />

                    {getStatusLabel(
                      order.status
                    )}

                  </div>

                </div>

                {/* ORDER INFO */}

                <div className="order-history-info">

                  <div>

                    <span>
                      ORDER
                    </span>

                    <strong>
                      #{order.id}
                    </strong>

                  </div>

                  <div>

                    <span>
                      ORDERED ON
                    </span>

                    <strong>
                      {formatDate(
                        order.createdAt
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      TOTAL
                    </span>

                    <strong>
                      {formatPrice(
                        order.totalAmount
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      PAYMENT
                    </span>

                    <strong className="payment-success">
                      ✓{" "}
                      {order.paymentStatus ||
                        "SUCCESS"}
                    </strong>

                  </div>

                </div>

                {/* ITEMS */}

                <div className="order-history-items">

                  {items.length > 0 ? (
                    items.map((item) => (
                      <div
                        className="history-item"
                        key={item.id}
                      >

                        <div className="history-item-image">
                          🍛
                        </div>

                        <div className="history-item-details">

                          <strong>
                            {item.itemName}
                          </strong>

                          <span>
                            {item.quantity} ×{" "}
                            {formatPrice(
                              item.price
                            )}
                          </span>

                        </div>

                        <strong className="history-item-total">
                          {formatPrice(
                            Number(item.price) *
                            item.quantity
                          )}
                        </strong>

                      </div>
                    ))
                  ) : (
                    <p className="items-loading-text">
                      Order items unavailable.
                    </p>
                  )}

                </div>

                {/* FOOTER */}

                <div className="order-history-footer">

                  <div className="delivery-location">

                    <Home size={15} />

                    <span>
                      Delivered to Home
                    </span>

                  </div>

                  <div className="order-actions">

                    {isActiveOrder(
                      order.status
                    ) && (
                      <Link
                        to={`/order-success/${order.id}`}
                        className="track-order-button"
                      >
                        <Truck size={15} />
                        Track order
                      </Link>
                    )}

                    {order.status ===
                      "DELIVERED" && (
                      <button
                        className="reorder-button"
                        onClick={() =>
                          reorder(order.id)
                        }
                      >
                        <ShoppingBag size={15} />
                        Reorder
                      </button>
                    )}

                    <Link
                      to={`/order-success/${order.id}`}
                      className="view-order-button"
                    >
                      View details
                      <ChevronRight size={15} />
                    </Link>

                  </div>

                </div>

              </article>
            );
          })}

        </div>

        {/* BOTTOM CTA */}

        {orders.length > 0 && (
          <section className="orders-bottom-cta">

            <div className="orders-bottom-icon">
              <Star size={19} />
            </div>

            <div>
              <strong>
                Hungry for something new?
              </strong>

              <p>
                Discover more restaurants and
                flavours around you.
              </p>
            </div>

            <Link to="/">
              Explore food
              <ChevronRight size={16} />
            </Link>

          </section>
        )}

      </main>

    </div>
  );
}

export default Orders;