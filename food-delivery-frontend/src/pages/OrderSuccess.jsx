import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  Home,
  MapPin,
  Package,
  Receipt,
  ShieldCheck,
  Truck
} from "lucide-react";

import "./OrderSuccess.css";

const API_URL = "http://localhost:8082";

function OrderSuccess() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const orderResponse = await fetch(
        `${API_URL}/orders/${orderId}`
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.message ||
          "Unable to find this order."
        );
      }

      setOrder(orderData);

      const itemsResponse = await fetch(
        `${API_URL}/orders/${orderId}/items`
      );

      if (itemsResponse.ok) {
        const itemsData =
          await itemsResponse.json();

        setOrderItems(itemsData);

        const menuMap = {};

        await Promise.all(
          itemsData.map(async (item) => {
            try {
              const response = await fetch(
                `${API_URL}/menu-items/${item.menuItemId}`
              );

              if (response.ok) {
                const menuItem =
                  await response.json();

                menuMap[item.menuItemId] =
                  menuItem;
              }
            } catch (err) {
              console.error(
                "Unable to load menu item:",
                err
              );
            }
          })
        );

        setMenuItems(menuMap);
      }

    } catch (err) {
      setError(err.message);
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

  const getStatusStep = () => {
    if (!order) {
      return 0;
    }

    switch (order.status) {
      case "PLACED":
        return 1;

      case "PREPARING":
        return 2;

      case "OUT_FOR_DELIVERY":
        return 3;

      case "DELIVERED":
        return 4;

      default:
        return 1;
    }
  };

  const currentStep = getStatusStep();

  const steps = [
    {
      key: "PLACED",
      title: "Order placed",
      description: "We've received your order.",
      icon: Receipt
    },
    {
      key: "PREPARING",
      title: "Preparing your food",
      description: "The restaurant is cooking.",
      icon: Package
    },
    {
      key: "OUT_FOR_DELIVERY",
      title: "Out for delivery",
      description: "Your rider is on the way.",
      icon: Truck
    },
    {
      key: "DELIVERED",
      title: "Delivered",
      description: "Enjoy your delicious meal!",
      icon: Home
    }
  ];

  if (loading) {
    return (
      <div className="order-success-loading">

        <div className="order-success-spinner"></div>

        <p>
          Loading your order...
        </p>

      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-success-error">

        <div className="order-error-icon">
          !
        </div>

        <h2>
          Order not found
        </h2>

        <p>
          {error ||
            "We couldn't find the order you're looking for."}
        </p>

        <Link
          to="/"
          className="order-home-button"
        >
          <ArrowLeft size={17} />
          Back to home
        </Link>

      </div>
    );
  }

  return (
    <div className="order-success-page">

      {/* NAVBAR */}

      <header className="order-success-navbar">

        <Link
          to="/"
          className="order-success-logo"
        >
          <span className="order-success-logo-mark">
            F
          </span>

          FoodRush
        </Link>

        <div className="order-nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/orders">
            My Orders
          </Link>

        </div>

        <div className="order-secure">

          <ShieldCheck size={16} />

          Secure order

        </div>

      </header>

      {/* MAIN */}

      <main className="order-success-main">

        {/* SUCCESS HERO */}

        <section className="order-success-hero">

          <div className="success-check">

            <Check size={32} strokeWidth={3} />

          </div>

          <span className="success-eyebrow">
            ORDER CONFIRMED
          </span>

          <h1>
            Your food is on its way!
          </h1>

          <p>
            Order #{order.id} has been successfully
            placed. Sit back and we'll take care of
            the rest.
          </p>

        </section>

        {/* ORDER META */}

        <section className="order-meta-card">

          <div className="order-meta-item">

            <Receipt size={18} />

            <div>
              <span>
                ORDER NUMBER
              </span>

              <strong>
                #{order.id}
              </strong>
            </div>

          </div>

          <div className="order-meta-divider"></div>

          <div className="order-meta-item">

            <Clock size={18} />

            <div>
              <span>
                ESTIMATED DELIVERY
              </span>

              <strong>
                25–30 min
              </strong>
            </div>

          </div>

          <div className="order-meta-divider"></div>

          <div className="order-meta-item">

            <MapPin size={18} />

            <div>
              <span>
                DELIVERING TO
              </span>

              <strong>
                Home
              </strong>
            </div>

          </div>

        </section>

        {/* CONTENT */}

        <div className="order-success-layout">

          {/* TRACKING */}

          <section className="tracking-card">

            <div className="tracking-header">

              <div>
                <span className="tracking-eyebrow">
                  LIVE TRACKING
                </span>

                <h2>
                  Track your order
                </h2>
              </div>

              <span className="tracking-status">
                {order.status ===
                "DELIVERED"
                  ? "Delivered"
                  : "On the way"}
              </span>

            </div>

            <div className="tracking-progress">

              <div className="progress-line"></div>

              <div
                className="progress-line-active"
                style={{
                  width: `${
                    ((currentStep - 1) / 3) *
                    100
                  }%`
                }}
              ></div>

              {steps.map(
                (step, index) => {

                  const stepNumber =
                    index + 1;

                  const Icon =
                    step.icon;

                  const isCompleted =
                    currentStep >=
                    stepNumber;

                  const isCurrent =
                    currentStep ===
                    stepNumber;

                  return (
                    <div
                      className={
                        isCompleted
                          ? "tracking-step completed"
                          : "tracking-step"
                      }
                      key={step.key}
                    >

                      <div
                        className={
                          isCurrent
                            ? "tracking-icon current"
                            : isCompleted
                            ? "tracking-icon completed"
                            : "tracking-icon"
                        }
                      >

                        {isCompleted ? (
                          <Check
                            size={17}
                            strokeWidth={3}
                          />
                        ) : (
                          <Icon size={17} />
                        )}

                      </div>

                      <div className="tracking-step-content">

                        <strong>
                          {step.title}
                        </strong>

                        <span>
                          {step.description}
                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            <div className="tracking-delivery-box">

              <div className="delivery-box-icon">
                <Truck size={21} />
              </div>

              <div>

                <strong>
                  {order.status ===
                  "DELIVERED"
                    ? "Order delivered"
                    : "We're getting your order ready"}
                </strong>

                <p>
                  {order.status ===
                  "DELIVERED"
                    ? "Thanks for ordering with FoodRush!"
                    : "You'll receive your food fresh and hot."}
                </p>

              </div>

            </div>

          </section>

          {/* ORDER SUMMARY */}

          <aside className="order-summary-card">

            <div className="order-summary-heading">

              <span>
                ORDER SUMMARY
              </span>

              <h2>
                Paradise Biryani
              </h2>

              <p>
                Indian • Chennai
              </p>

            </div>

            <div className="success-order-items">

              {orderItems.map((item) => {

                const menuItem =
                  menuItems[
                    item.menuItemId
                  ];

                return (
                  <div
                    className="success-order-item"
                    key={item.id}
                  >

                    <div className="success-item-image">
                      🍛
                    </div>

                    <div className="success-item-info">

                      <strong>
                        {item.itemName}
                      </strong>

                      <span>
                        {item.quantity} ×{" "}
                        {formatPrice(item.price)}
                      </span>

                    </div>

                    <strong>
                      {formatPrice(
                        Number(item.price) *
                        item.quantity
                      )}
                    </strong>

                  </div>
                );
              })}

            </div>

            <div className="success-summary-divider"></div>

            <div className="success-summary-row">

              <span>
                Total paid
              </span>

              <strong>
                {formatPrice(
                  order.totalAmount
                )}
              </strong>

            </div>

            <div className="success-payment-status">

              <Check size={14} />

              Payment{" "}
              {order.paymentStatus?.toLowerCase() ||
                "successful"}

            </div>

            <div className="success-order-date">

              Ordered on{" "}
              {formatDate(order.createdAt)}

            </div>

          </aside>

        </div>

        {/* ACTIONS */}

        <div className="order-success-actions">

          <Link
            to="/orders"
            className="view-orders-button"
          >
            View my orders
          </Link>

          <Link
            to="/"
            className="continue-shopping-button"
          >
            <Home size={16} />
            Order more food
          </Link>

        </div>

      </main>

    </div>
  );
}

export default OrderSuccess;