import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Minus,
  Plus,
  ShoppingBag,
  Trash2
} from "lucide-react";

import "./Cart.css";

const API_URL = "http://localhost:8082";

function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  const userId =
    localStorage.getItem("foodrushUserId") || "1";

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const cartResponse = await fetch(
        `${API_URL}/cart/${userId}`
      );

      const cartData = await cartResponse.json();

      if (!cartResponse.ok) {
        throw new Error(
          cartData.message || "Unable to load cart."
        );
      }

      setCartItems(cartData);

      const menuMap = {};

      await Promise.all(
        cartData.map(async (cartItem) => {

          const response = await fetch(
            `${API_URL}/menu-items/${cartItem.menuItemId}`
          );

          if (response.ok) {
            const menuItem =
              await response.json();

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

  const updateQuantity = async (
    cartItemId,
    quantity
  ) => {

    if (quantity <= 0) {
      await removeItem(cartItemId);
      return;
    }

    try {
      setProcessingId(cartItemId);

      const response = await fetch(
        `${API_URL}/cart/${cartItemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            quantity
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to update quantity."
        );
      }

      await loadCart();

    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const removeItem = async (cartItemId) => {

    try {
      setProcessingId(cartItemId);

      const response = await fetch(
        `${API_URL}/cart/${cartItemId}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to remove item."
        );
      }

      await loadCart();

    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const calculateSubtotal = () => {

    return cartItems.reduce(
      (total, cartItem) => {

        const menuItem =
          menuItems[cartItem.menuItemId];

        if (!menuItem) {
          return total;
        }

        return (
          total +
          Number(menuItem.price) *
          cartItem.quantity
        );

      },
      0
    );
  };

  const subtotal = calculateSubtotal();

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

  const handleCheckout = () => {

    if (cartItems.length === 0) {
      return;
    }

    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="cart-loading">

        <div className="cart-spinner"></div>

        <p>
          Loading your cart...
        </p>

      </div>
    );
  }

  return (
    <div className="cart-page">

      {/* NAVBAR */}

      <header className="cart-navbar">

        <Link
          to="/"
          className="cart-logo"
        >
          <span className="cart-logo-mark">
            F
          </span>

          FoodRush
        </Link>

        <div className="cart-nav-title">
          Your Cart
        </div>

        <Link
          to="/"
          className="continue-shopping"
        >
          Continue shopping
        </Link>

      </header>

      {/* MAIN */}

      <main className="cart-main">

        <Link
          to="/"
          className="cart-back"
        >
          <ArrowLeft size={16} />
          Back to restaurants
        </Link>

        <div className="cart-header">

          <div>

            <span className="cart-eyebrow">
              YOUR ORDER
            </span>

            <h1>
              Your cart
            </h1>

            <p>
              {cartItems.length === 0
                ? "Your cart is empty."
                : `${cartItems.length} different item${
                    cartItems.length === 1
                      ? ""
                      : "s"
                  } in your cart`}
            </p>

          </div>

          {cartItems.length > 0 && (
            <div className="cart-delivery-info">

              <Clock size={17} />

              <div>
                <strong>
                  25–30 min
                </strong>

                <span>
                  Estimated delivery
                </span>
              </div>

            </div>
          )}

        </div>

        {error && (
          <div className="cart-error">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (

          /* EMPTY CART */

          <section className="empty-cart">

            <div className="empty-cart-icon">
              <ShoppingBag size={42} />
            </div>

            <h2>
              Your cart is empty
            </h2>

            <p>
              Looks like you haven't added
              anything yet.
            </p>

            <Link
              to="/"
              className="browse-food-button"
            >
              Browse restaurants
            </Link>

          </section>

        ) : (

          <div className="cart-layout">

            {/* ITEMS */}

            <section className="cart-items-section">

              <div className="cart-restaurant">

                <div className="restaurant-small-icon">
                  🍛
                </div>

                <div>

                  <strong>
                    Paradise Biryani
                  </strong>

                  <span>
                    Indian • Chennai
                  </span>

                </div>

              </div>

              <div className="cart-items">

                {cartItems.map((cartItem) => {

                  const menuItem =
                    menuItems[
                      cartItem.menuItemId
                    ];

                  if (!menuItem) {
                    return null;
                  }

                  const itemTotal =
                    Number(menuItem.price) *
                    cartItem.quantity;

                  return (
                    <article
                      className="cart-item"
                      key={cartItem.id}
                    >

                      <div className="cart-food-image">
                        🍛
                      </div>

                      <div className="cart-item-details">

                        <div className="cart-item-top">

                          <div>

                            <h3>
                              {menuItem.name}
                            </h3>

                            <span>
                              {formatPrice(
                                menuItem.price
                              )}
                            </span>

                          </div>

                          <strong>
                            {formatPrice(itemTotal)}
                          </strong>

                        </div>

                        <div className="cart-item-bottom">

                          <div className="quantity-control">

                            <button
                              onClick={() =>
                                updateQuantity(
                                  cartItem.id,
                                  cartItem.quantity - 1
                                )
                              }
                              disabled={
                                processingId ===
                                cartItem.id
                              }
                            >
                              <Minus size={14} />
                            </button>

                            <span>
                              {cartItem.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(
                                  cartItem.id,
                                  cartItem.quantity + 1
                                )
                              }
                              disabled={
                                processingId ===
                                cartItem.id
                              }
                            >
                              <Plus size={14} />
                            </button>

                          </div>

                          <button
                            className="remove-item"
                            onClick={() =>
                              removeItem(
                                cartItem.id
                              )
                            }
                            disabled={
                              processingId ===
                              cartItem.id
                            }
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>

              <Link
                to={`/restaurant/1`}
                className="add-more-food"
              >
                <Plus size={16} />
                Add more food
              </Link>

            </section>

            {/* SUMMARY */}

            <aside className="cart-summary">

              <div className="summary-header">

                <h2>
                  Bill details
                </h2>

              </div>

              <div className="bill-row">

                <span>
                  Item total
                </span>

                <strong>
                  {formatPrice(subtotal)}
                </strong>

              </div>

              <div className="bill-row">

                <span>
                  Delivery fee
                </span>

                <strong>
                  {formatPrice(deliveryFee)}
                </strong>

              </div>

              <div className="bill-row">

                <span>
                  Platform fee
                </span>

                <strong>
                  {formatPrice(platformFee)}
                </strong>

              </div>

              <div className="bill-divider"></div>

              <div className="bill-total">

                <span>
                  To pay
                </span>

                <strong>
                  {formatPrice(total)}
                </strong>

              </div>

              <div className="secure-checkout">

                <span>
                  ✓
                </span>

                <p>
                  Safe and secure checkout
                </p>

              </div>

              <button
                className="checkout-button"
                onClick={handleCheckout}
              >
                Proceed to checkout
                <ArrowRightIcon />
              </button>

            </aside>

          </div>
        )}

      </main>

    </div>
  );
}

function ArrowRightIcon() {
  return (
    <span className="checkout-arrow">
      →
    </span>
  );
}

export default Cart;