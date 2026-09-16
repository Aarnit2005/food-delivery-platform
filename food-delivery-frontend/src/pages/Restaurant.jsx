import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Plus,
  ShoppingCart,
  Star,
  Minus
} from "lucide-react";

import "./Restaurant.css";

const API_URL = "http://localhost:8082";

function Restaurant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(null);
  const [error, setError] = useState("");

  const userId =
    localStorage.getItem("foodrushUserId") || "1";

  useEffect(() => {
    loadRestaurant();
    loadCart();
  }, [id]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      setError("");

      const restaurantResponse = await fetch(
        `${API_URL}/restaurants/${id}`
      );

      const menuResponse = await fetch(
        `${API_URL}/menu-items/restaurant/${id}`
      );

      const restaurantData =
        await restaurantResponse.json();

      const menuData =
        await menuResponse.json();

      if (!restaurantResponse.ok) {
        throw new Error(
          restaurantData.message ||
          "Restaurant not found."
        );
      }

      if (!menuResponse.ok) {
        throw new Error(
          menuData.message ||
          "Unable to load menu."
        );
      }

      setRestaurant(restaurantData);
      setMenuItems(menuData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const response = await fetch(
        `${API_URL}/cart/${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (err) {
      console.error("Unable to load cart:", err);
    }
  };

  const getCartQuantity = (menuItemId) => {
    const item = cart.find(
      (cartItem) =>
        cartItem.menuItemId === menuItemId
    );

    return item ? item.quantity : 0;
  };

  const addToCart = async (menuItemId) => {
    try {
      setAddingItem(menuItemId);

      const response = await fetch(
        `${API_URL}/cart/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: Number(userId),
            menuItemId: menuItemId,
            quantity: 1
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to add item."
        );
      }

      await loadCart();

    } catch (err) {
      setError(err.message);
    } finally {
      setAddingItem(null);
    }
  };

  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  const groupedMenu = menuItems.reduce(
    (groups, item) => {

      const category =
        item.category || "Other";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);

      return groups;
    },
    {}
  );

  const totalCartItems = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="restaurant-loading">
        <div className="loading-spinner"></div>
        <p>Loading restaurant...</p>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="restaurant-error-page">
        <h2>Something went wrong</h2>
        <p>{error}</p>

        <Link to="/" className="back-home-button">
          <ArrowLeft size={17} />
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="restaurant-page">

      {/* NAVBAR */}

      <header className="restaurant-navbar">

        <Link to="/" className="restaurant-logo">
          <span className="restaurant-logo-mark">
            F
          </span>
          FoodRush
        </Link>

        <div className="restaurant-nav-right">

          <Link
            to="/"
            className="restaurant-home-link"
          >
            Home
          </Link>

          <Link
            to="/cart"
            className="restaurant-cart-button"
          >
            <ShoppingCart size={18} />
            Cart

            {totalCartItems > 0 && (
              <span className="cart-count">
                {totalCartItems}
              </span>
            )}

          </Link>

        </div>

      </header>

      {/* RESTAURANT HERO */}

      <main className="restaurant-main">

        <Link
          to="/"
          className="back-link"
        >
          <ArrowLeft size={17} />
          Back to restaurants
        </Link>

        <section className="restaurant-hero">

          <div className="restaurant-hero-image">
            🍛
          </div>

          <div className="restaurant-hero-info">

            <span className="restaurant-eyebrow">
              RESTAURANT
            </span>

            <h1>
              {restaurant.name}
            </h1>

            <p className="restaurant-description">
              Delicious {restaurant.cuisine.toLowerCase()}
              {" "}food prepared fresh and delivered
              straight to your doorstep.
            </p>

            <div className="restaurant-details">

              <div className="restaurant-detail rating-detail">
                <Star
                  size={17}
                  fill="currentColor"
                />

                <strong>
                  {restaurant.rating}
                </strong>

                <span>
                  Rating
                </span>
              </div>

              <div className="restaurant-detail">
                <MapPin size={17} />

                <strong>
                  {restaurant.location}
                </strong>

                <span>
                  Location
                </span>
              </div>

              <div className="restaurant-detail">
                <Clock size={17} />

                <strong>
                  25–30 min
                </strong>

                <span>
                  Delivery
                </span>
              </div>

            </div>

            <div className="restaurant-status">

              <span
                className={
                  restaurant.open
                    ? "status-dot open"
                    : "status-dot closed"
                }
              ></span>

              {restaurant.open
                ? "Open now"
                : "Currently closed"}

            </div>

          </div>

        </section>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="restaurant-error">
            {error}
          </div>
        )}

        {/* MENU */}

        <section className="menu-section">

          <div className="menu-heading">

            <div>
              <span className="restaurant-eyebrow">
                MENU
              </span>

              <h2>
                What would you like?
              </h2>
            </div>

            <span className="menu-count">
              {menuItems.length} items
            </span>

          </div>

          {Object.entries(groupedMenu).map(
            ([category, items]) => (

              <div
                className="menu-category"
                key={category}
              >

                <h3>
                  {category}
                </h3>

                <div className="menu-items">

                  {items.map((item) => {

                    const quantity =
                      getCartQuantity(item.id);

                    return (
                      <article
                        className="menu-item"
                        key={item.id}
                      >

                        <div className="menu-item-info">

                          <div className="veg-indicator">
                            <span></span>
                          </div>

                          <h4>
                            {item.name}
                          </h4>

                          <strong>
                            {formatPrice(item.price)}
                          </strong>

                          <p>
                            Freshly prepared and
                            packed with flavour.
                          </p>

                          {!item.available && (
                            <span className="unavailable">
                              Currently unavailable
                            </span>
                          )}

                        </div>

                        <div className="menu-item-action">

                          <div className="menu-food-image">
                            {category
                              .toLowerCase()
                              .includes("biryani")
                              ? "🍛"
                              : "🍗"}
                          </div>

                          {quantity > 0 ? (

                            <div className="quantity-control">

                              <button
                                disabled
                              >
                                <Minus size={14} />
                              </button>

                              <span>
                                {quantity}
                              </span>

                              <button
                                onClick={() =>
                                  addToCart(item.id)
                                }
                                disabled={
                                  addingItem ===
                                  item.id
                                }
                              >
                                <Plus size={14} />
                              </button>

                            </div>

                          ) : (

                            <button
                              className="add-button"
                              onClick={() =>
                                addToCart(item.id)
                              }
                              disabled={
                                !item.available ||
                                addingItem === item.id
                              }
                            >
                              {addingItem === item.id
                                ? "Adding..."
                                : "ADD"}

                              <Plus size={15} />
                            </button>

                          )}

                        </div>

                      </article>
                    );
                  })}

                </div>

              </div>
            )
          )}

        </section>

      </main>

      {/* FLOATING CART */}

      {totalCartItems > 0 && (

        <Link
          to="/cart"
          className="floating-cart"
        >

          <div className="floating-cart-left">

            <ShoppingCart size={20} />

            <div>
              <strong>
                {totalCartItems}{" "}
                {totalCartItems === 1
                  ? "item"
                  : "items"}
              </strong>

              <span>
                View your cart
              </span>
            </div>

          </div>

          <span>
            View Cart →
          </span>

        </Link>

      )}

    </div>
  );
}

export default Restaurant;