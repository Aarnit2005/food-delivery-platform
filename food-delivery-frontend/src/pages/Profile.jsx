import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  User,
  Utensils
} from "lucide-react";

import "./Profile.css";

const API_URL = "http://localhost:8082";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId =
    localStorage.getItem("foodrushUserId") || "1";

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const storedName =
        localStorage.getItem(
          "foodrushUserName"
        );

      const storedEmail =
        localStorage.getItem(
          "foodrushUserEmail"
        );

      /*
       * Use locally stored information first.
       * Orders are fetched from the backend to
       * calculate account statistics.
       */

      setUser({
        id: userId,
        name: storedName || "FoodRush User",
        email: storedEmail || "Not available"
      });

      const response = await fetch(
        `${API_URL}/orders/user/${userId}`
      );

      if (response.ok) {
        const data = await response.json();

        const sortedOrders = [...data].sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

        setOrders(sortedOrders);
      }

    } catch (err) {
      console.error(
        "Unable to load profile:",
        err
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

    return new Date(dateString).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );
  };

  const getInitials = (name) => {
    if (!name) {
      return "F";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0).toUpperCase()
      )
      .join("");
  };

  const logout = () => {
    localStorage.removeItem(
      "foodrushUserId"
    );

    localStorage.removeItem(
      "foodrushUserName"
    );

    localStorage.removeItem(
      "foodrushUserEmail"
    );

    navigate("/");
  };

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status === "DELIVERED"
    ).length;

  const activeOrders =
    orders.filter(
      (order) =>
        order.status !== "DELIVERED"
    ).length;

  const totalSpent =
    orders.reduce(
      (total, order) =>
        total + Number(order.totalAmount || 0),
      0
    );

  if (loading) {
    return (
      <div className="profile-loading">

        <div className="profile-spinner"></div>

        <p>
          Loading your profile...
        </p>

      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* NAVBAR */}

      <header className="profile-navbar">

        <Link
          to="/"
          className="profile-logo"
        >
          <span className="profile-logo-mark">
            F
          </span>

          FoodRush
        </Link>

        <nav className="profile-nav">

          <Link to="/">
            Home
          </Link>

          <Link to="/orders">
            My Orders
          </Link>

          <Link to="/cart">
            Cart
          </Link>

        </nav>

        <div className="profile-nav-current">
          <User size={16} />
          Profile
        </div>

      </header>

      {/* MAIN */}

      <main className="profile-main">

        <Link
          to="/"
          className="profile-back"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="profile-heading">

          <div>

            <span className="profile-eyebrow">
              MY ACCOUNT
            </span>

            <h1>
              Profile
            </h1>

            <p>
              Manage your FoodRush account and
              view your activity.
            </p>

          </div>

        </div>

        {/* PROFILE HERO */}

        <section className="profile-hero-card">

          <div className="profile-avatar">
            {getInitials(user?.name)}
          </div>

          <div className="profile-hero-info">

            <span>
              FOODRUSH MEMBER
            </span>

            <h2>
              {user?.name}
            </h2>

            <p>
              Member since 2026
            </p>

          </div>

          <button
            className="profile-logout"
            onClick={logout}
          >
            <LogOut size={15} />
            Logout
          </button>

        </section>

        {/* STATISTICS */}

        <section className="profile-stats">

          <div className="profile-stat">

            <div className="profile-stat-icon">
              <ShoppingBag size={18} />
            </div>

            <div>
              <strong>
                {orders.length}
              </strong>

              <span>
                Total orders
              </span>
            </div>

          </div>

          <div className="profile-stat">

            <div className="profile-stat-icon">
              <Package size={18} />
            </div>

            <div>
              <strong>
                {deliveredOrders}
              </strong>

              <span>
                Delivered
              </span>
            </div>

          </div>

          <div className="profile-stat">

            <div className="profile-stat-icon">
              <Clock size={18} />
            </div>

            <div>
              <strong>
                {activeOrders}
              </strong>

              <span>
                Active orders
              </span>
            </div>

          </div>

          <div className="profile-stat">

            <div className="profile-stat-icon">
              <Utensils size={18} />
            </div>

            <div>
              <strong>
                {formatPrice(totalSpent)}
              </strong>

              <span>
                Total spent
              </span>
            </div>

          </div>

        </section>

        {/* CONTENT */}

        <div className="profile-layout">

          {/* PERSONAL INFORMATION */}

          <section className="profile-card">

            <div className="profile-card-header">

              <div className="profile-card-icon">
                <User size={17} />
              </div>

              <div>

                <span>
                  ACCOUNT INFORMATION
                </span>

                <h2>
                  Personal details
                </h2>

              </div>

            </div>

            <div className="profile-details">

              <div className="profile-detail-row">

                <div className="profile-detail-icon">
                  <User size={16} />
                </div>

                <div>

                  <span>
                    Full name
                  </span>

                  <strong>
                    {user?.name}
                  </strong>

                </div>

              </div>

              <div className="profile-detail-row">

                <div className="profile-detail-icon">
                  <Mail size={16} />
                </div>

                <div>

                  <span>
                    Email address
                  </span>

                  <strong>
                    {user?.email}
                  </strong>

                </div>

              </div>

              <div className="profile-detail-row">

                <div className="profile-detail-icon">
                  <Phone size={16} />
                </div>

                <div>

                  <span>
                    Phone number
                  </span>

                  <strong>
                    Not added
                  </strong>

                </div>

              </div>

              <div className="profile-detail-row">

                <div className="profile-detail-icon">
                  <MapPin size={16} />
                </div>

                <div>

                  <span>
                    Default address
                  </span>

                  <strong>
                    SRM University, Kattankulathur
                  </strong>

                </div>

              </div>

            </div>

          </section>

          {/* QUICK ACTIONS */}

          <section className="profile-card">

            <div className="profile-card-header">

              <div className="profile-card-icon">
                <ShoppingBag size={17} />
              </div>

              <div>

                <span>
                  QUICK ACTIONS
                </span>

                <h2>
                  Your FoodRush
                </h2>

              </div>

            </div>

            <div className="profile-actions">

              <Link
                to="/orders"
                className="profile-action"
              >

                <div className="profile-action-icon">
                  <Package size={17} />
                </div>

                <div>

                  <strong>
                    My Orders
                  </strong>

                  <span>
                    View and track your orders
                  </span>

                </div>

                <ChevronRight size={16} />

              </Link>

              <Link
                to="/cart"
                className="profile-action"
              >

                <div className="profile-action-icon">
                  <ShoppingBag size={17} />
                </div>

                <div>

                  <strong>
                    My Cart
                  </strong>

                  <span>
                    Continue your food order
                  </span>

                </div>

                <ChevronRight size={16} />

              </Link>

              <Link
                to="/"
                className="profile-action"
              >

                <div className="profile-action-icon">
                  <Utensils size={17} />

                </div>

                <div>

                  <strong>
                    Explore Restaurants
                  </strong>

                  <span>
                    Discover something delicious
                  </span>

                </div>

                <ChevronRight size={16} />

              </Link>

            </div>

          </section>

        </div>

        {/* RECENT ORDERS */}

        {orders.length > 0 && (
          <section className="recent-orders-card">

            <div className="recent-orders-header">

              <div>

                <span>
                  ORDER ACTIVITY
                </span>

                <h2>
                  Recent orders
                </h2>

              </div>

              <Link to="/orders">
                View all
                <ChevronRight size={15} />
              </Link>

            </div>

            <div className="recent-orders-list">

              {orders
                .slice(0, 3)
                .map((order) => (

                  <Link
                    to={`/order-success/${order.id}`}
                    className="recent-order"
                    key={order.id}
                  >

                    <div className="recent-order-icon">
                      🍛
                    </div>

                    <div className="recent-order-info">

                      <strong>
                        Paradise Biryani
                      </strong>

                      <span>
                        Order #{order.id} •{" "}
                        {formatDate(
                          order.createdAt
                        )}
                      </span>

                    </div>

                    <div className="recent-order-right">

                      <strong>
                        {formatPrice(
                          order.totalAmount
                        )}
                      </strong>

                      <span>
                        {order.status}
                      </span>

                    </div>

                    <ChevronRight
                      size={15}
                    />

                  </Link>

                ))}

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default Profile;