import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  MapPin,
  ShieldCheck,
  Smartphone
} from "lucide-react";

import "./Checkout.css";

const API_URL = "http://localhost:8082";

function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const userId =
    localStorage.getItem("foodrushUserId") || "1";

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/cart/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load cart."
        );
      }

      if (data.length === 0) {
        navigate("/cart");
        return;
      }

      setCartItems(data);

      const menuMap = {};

      await Promise.all(
        data.map(async (cartItem) => {
          const menuResponse = await fetch(
            `${API_URL}/menu-items/${cartItem.menuItemId}`
          );

          if (menuResponse.ok) {
            const menuItem =
              await menuResponse.json();

            menuMap[cartItem.menuItemId] =
              menuItem;
          }
        })
      );

      setMenuItems(menuMap);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (total, item) => {

      const menuItem =
        menuItems[item.menuItemId];

      if (!menuItem) {
        return total;
      }

      return (
        total +
        Number(menuItem.price) *
        item.quantity
      );

    },
    0
  );

  const deliveryFee =
    cartItems.length > 0 ? 40 : 0;

  const platformFee =
    cartItems.length > 0 ? 5 : 0;

  const total =
    subtotal +
    deliveryFee +
    platformFee;

  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString(
      "en-IN"
    )}`;
  };

  const placeOrder = async () => {
    try {
      setPlacingOrder(true);
      setError("");

      const response = await fetch(
        `${API_URL}/orders/place/${userId}`,
        {
          method: "POST"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to place order."
        );
      }

      navigate(`/order-success/${data.id}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-loading">

        <div className="checkout-spinner"></div>

        <p>
          Preparing your checkout...
        </p>

      </div>
    );
  }

  return (
    <div className="checkout-page">

      {/* NAVBAR */}

      <header className="checkout-navbar">

        <Link
          to="/"
          className="checkout-logo"
        >
          <span className="checkout-logo-mark">
            F
          </span>

          FoodRush
        </Link>

        <div className="checkout-title">
          Secure Checkout
        </div>

        <div className="checkout-secure">
          <ShieldCheck size={17} />
          Secure
        </div>

      </header>

      {/* MAIN */}

      <main className="checkout-main">

        <Link
          to="/cart"
          className="checkout-back"
        >
          <ArrowLeft size={16} />
          Back to cart
        </Link>

        <div className="checkout-heading">

          <span className="checkout-eyebrow">
            CHECKOUT
          </span>

          <h1>
            Complete your order
          </h1>

          <p>
            You're just one step away from great food.
          </p>

        </div>

        {error && (
          <div className="checkout-error">
            {error}
          </div>
        )}

        <div className="checkout-layout">

          {/* LEFT */}

          <section className="checkout-left">

            {/* DELIVERY ADDRESS */}

            <div className="checkout-card">

              <div className="checkout-card-header">

                <div className="checkout-section-icon">
                  <MapPin size={18} />
                </div>

                <div>
                  <span>
                    DELIVERY ADDRESS
                  </span>

                  <h2>
                    Where should we deliver?
                  </h2>
                </div>

              </div>

              <div className="address-card">

                <div className="address-radio">
                  <div></div>
                </div>

                <div className="address-content">

                  <strong>
                    Home
                  </strong>

                  <p>
                    SRM University, Kattankulathur,
                    Chennai, Tamil Nadu
                  </p>

                  <span>
                    Deliver to this address
                  </span>

                </div>

                <button>
                  Change
                </button>

              </div>

            </div>

            {/* PAYMENT */}

            <div className="checkout-card">

              <div className="checkout-card-header">

                <div className="checkout-section-icon">
                  <CreditCard size={18} />
                </div>

                <div>
                  <span>
                    PAYMENT METHOD
                  </span>

                  <h2>
                    Choose how to pay
                  </h2>
                </div>

              </div>

              <div className="payment-options">

                <button
                  className={
                    paymentMethod === "UPI"
                      ? "payment-option selected"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod("UPI")
                  }
                >

                  <div className="payment-icon">
                    <Smartphone size={19} />
                  </div>

                  <div>
                    <strong>
                      UPI
                    </strong>

                    <span>
                      Google Pay, PhonePe, Paytm
                    </span>
                  </div>

                  <div className="payment-radio">
                    {paymentMethod === "UPI" && (
                      <Check size={12} />
                    )}
                  </div>

                </button>

                <button
                  className={
                    paymentMethod === "CARD"
                      ? "payment-option selected"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod("CARD")
                  }
                >

                  <div className="payment-icon">
                    <CreditCard size={19} />
                  </div>

                  <div>
                    <strong>
                      Credit / Debit Card
                    </strong>

                    <span>
                      Visa, Mastercard, RuPay
                    </span>
                  </div>

                  <div className="payment-radio">
                    {paymentMethod === "CARD" && (
                      <Check size={12} />
                    )}
                  </div>

                </button>

                <button
                  className={
                    paymentMethod === "COD"
                      ? "payment-option selected"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod("COD")
                  }
                >

                  <div className="payment-icon">
                    💵
                  </div>

                  <div>
                    <strong>
                      Cash on Delivery
                    </strong>

                    <span>
                      Pay when your order arrives
                    </span>
                  </div>

                  <div className="payment-radio">
                    {paymentMethod === "COD" && (
                      <Check size={12} />
                    )}
                  </div>

                </button>

              </div>

              <div className="payment-note">

                <ShieldCheck size={15} />

                <span>
                  Your payment information is
                  protected and secure.
                </span>

              </div>

            </div>

            {/* DELIVERY */}

            <div className="checkout-card delivery-card-checkout">

              <div className="checkout-card-header">

                <div className="checkout-section-icon">
                  <Clock size={18} />
                </div>

                <div>
                  <span>
                    DELIVERY TIME
                  </span>

                  <h2>
                    25–30 minutes
                  </h2>
                </div>

              </div>

              <p className="delivery-message">
                Your order will be prepared fresh
                and delivered as quickly as possible.
              </p>

            </div>

          </section>

          {/* RIGHT */}

          <aside className="checkout-summary">

            <div className="checkout-summary-header">

              <span>
                YOUR ORDER
              </span>

              <h2>
                Paradise Biryani
              </h2>

              <p>
                Indian • Chennai
              </p>

            </div>

            <div className="checkout-order-items">

              {cartItems.map((cartItem) => {

                const menuItem =
                  menuItems[
                    cartItem.menuItemId
                  ];

                if (!menuItem) {
                  return null;
                }

                return (
                  <div
                    className="checkout-order-item"
                    key={cartItem.id}
                  >

                    <div className="checkout-item-image">
                      🍛
                    </div>

                    <div className="checkout-item-info">

                      <strong>
                        {menuItem.name}
                      </strong>

                      <span>
                        {cartItem.quantity} ×{" "}
                        {formatPrice(
                          menuItem.price
                        )}
                      </span>

                    </div>

                    <strong>
                      {formatPrice(
                        Number(menuItem.price) *
                        cartItem.quantity
                      )}
                    </strong>

                  </div>
                );
              })}

            </div>

            <div className="checkout-bill">

              <div>
                <span>
                  Item total
                </span>

                <strong>
                  {formatPrice(subtotal)}
                </strong>
              </div>

              <div>
                <span>
                  Delivery fee
                </span>

                <strong>
                  {formatPrice(deliveryFee)}
                </strong>
              </div>

              <div>
                <span>
                  Platform fee
                </span>

                <strong>
                  {formatPrice(platformFee)}
                </strong>
              </div>

            </div>

            <div className="checkout-total">

              <span>
                Total
              </span>

              <strong>
                {formatPrice(total)}
              </strong>

            </div>

            <button
              className="place-order-button"
              onClick={placeOrder}
              disabled={placingOrder}
            >
              {placingOrder
                ? "Placing order..."
                : "Place order"}

              {!placingOrder && (
                <span>
                  →
                </span>
              )}
            </button>

            <p className="terms-text">
              By placing this order, you agree
              to FoodRush's terms and conditions.
            </p>

          </aside>

        </div>

      </main>

    </div>
  );
}

export default Checkout;