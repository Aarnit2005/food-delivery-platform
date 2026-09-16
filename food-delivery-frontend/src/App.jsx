import { useEffect, useMemo, useState } from "react";

import {
  Link,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  ShoppingCart,
  Star,
  User
} from "lucide-react";

import Restaurant from "./pages/Restaurant";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

import "./App.css";

const API_URL = "http://localhost:8082";

const RESTAURANTS_PER_PAGE = 24;

function Home() {

  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const userName =
    localStorage.getItem("foodrushUserName");

  const userId =
    localStorage.getItem("foodrushUserId");

  /*
   * ======================================================
   * LOAD RESTAURANTS
   * ======================================================
   */

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {

    try {

      setLoading(true);

      const response =
        await fetch(`${API_URL}/restaurants`);

      if (!response.ok) {
        throw new Error(
          "Unable to load restaurants"
        );
      }

      const data =
        await response.json();

      setRestaurants(data);

    } catch (error) {

      console.error(
        "Unable to load restaurants:",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  /*
   * ======================================================
   * SEARCH / FILTER
   * ======================================================
   */

  const filteredRestaurants = useMemo(() => {

    const text =
      search.trim().toLowerCase();

    if (!text) {
      return restaurants;
    }

    return restaurants.filter(
      (restaurant) => {

        const name =
          restaurant.name
            ?.toLowerCase() || "";

        const cuisine =
          restaurant.cuisine
            ?.toLowerCase() || "";

        const location =
          restaurant.location
            ?.toLowerCase() || "";

        /*
         * Chicken is a food category rather than
         * a restaurant cuisine, so include restaurants
         * whose names/cuisines are likely to serve it.
         */

        if (text === "chicken") {

          return (
            name.includes("chicken") ||
            cuisine.includes("indian") ||
            cuisine.includes("mughlai") ||
            cuisine.includes("biryani") ||
            cuisine.includes("fast food") ||
            cuisine.includes("burger")
          );
        }

        return (
          name.includes(text) ||
          cuisine.includes(text) ||
          location.includes(text)
        );
      }
    );

  }, [restaurants, search]);

  /*
   * ======================================================
   * PAGINATION
   * ======================================================
   */

  const totalPages =
    Math.ceil(
      filteredRestaurants.length /
        RESTAURANTS_PER_PAGE
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      Math.max(totalPages, 1)
    );

  const startIndex =
    (safeCurrentPage - 1) *
    RESTAURANTS_PER_PAGE;

  const endIndex =
    startIndex +
    RESTAURANTS_PER_PAGE;

  const displayedRestaurants =
    filteredRestaurants.slice(
      startIndex,
      endIndex
    );

  /*
   * When search changes, always return
   * to page 1.
   */

  const handleSearchChange = (value) => {

    setSearch(value);
    setCurrentPage(1);
  };

  const handleCategoryClick = (category) => {

    handleSearchChange(category);

    setTimeout(() => {

      document
        .getElementById("restaurants")
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }, 50);
  };

  const clearSearch = () => {

    setSearch("");
    setCurrentPage(1);
  };

  /*
   * ======================================================
   * CATEGORIES
   * ======================================================
   */

  const categories = [

    {
      emoji: "🍛",
      name: "Biryani"
    },

    {
      emoji: "🍕",
      name: "Pizza"
    },

    {
      emoji: "🍔",
      name: "Burgers"
    },

    {
      emoji: "🍜",
      name: "Chinese"
    },

    {
      emoji: "🥘",
      name: "Indian"
    },

    {
      emoji: "🍗",
      name: "Chicken"
    },

    {
      emoji: "🥗",
      name: "Healthy"
    },

    {
      emoji: "🍰",
      name: "Desserts"
    }
  ];

  /*
   * ======================================================
   * OFFERS
   * ======================================================
   */

  const offers = [

    {
      title: "50% OFF",
      subtitle: "On your first order",
      code: "WELCOME50",
      emoji: "🎉"
    },

    {
      title: "FREE DELIVERY",
      subtitle: "On orders above ₹299",
      code: "FREEDEL",
      emoji: "🛵"
    },

    {
      title: "₹100 OFF",
      subtitle: "On orders above ₹499",
      code: "FOOD100",
      emoji: "🔥"
    }
  ];

  /*
   * ======================================================
   * RESTAURANT EMOJI
   * ======================================================
   */

  const getRestaurantEmoji = (
    cuisine = ""
  ) => {

    const value =
      cuisine.toLowerCase();

    if (value.includes("biryani"))
      return "🍛";

    if (value.includes("pizza"))
      return "🍕";

    if (value.includes("burger"))
      return "🍔";

    if (value.includes("chinese"))
      return "🍜";

    if (value.includes("south"))
      return "🥞";

    if (value.includes("dessert"))
      return "🍰";

    if (value.includes("healthy"))
      return "🥗";

    if (value.includes("indian"))
      return "🥘";

    if (value.includes("mexican"))
      return "🌮";

    if (value.includes("cafe"))
      return "☕";

    if (value.includes("asian"))
      return "🍱";

    return "🍽️";
  };

  /*
   * ======================================================
   * SCROLL TO RESTAURANTS
   * ======================================================
   */

  const scrollToRestaurants = () => {

    document
      .getElementById("restaurants")
      ?.scrollIntoView({
        behavior: "smooth"
      });
  };

  /*
   * ======================================================
   * HOME PAGE
   * ======================================================
   */

  return (

    <div className="home-page">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="navbar">

        <Link
          to="/"
          className="logo"
        >

          <span className="logo-mark">
            F
          </span>

          FoodRush

        </Link>

        <div className="nav-links">

          <a href="#restaurants">
            Restaurants
          </a>

          <a href="#offers">
            Offers
          </a>

          <a href="#why-us">
            Why FoodRush?
          </a>

        </div>

        <div className="nav-actions">

          <Link
            to="/cart"
            className="nav-icon-button"
          >

            <ShoppingCart size={19} />

            <span>
              Cart
            </span>

          </Link>

          {userId ? (

            <Link
              to="/profile"
              className="profile-nav-button"
            >

              <User size={18} />

              <span>
                {userName || "Profile"}
              </span>

            </Link>

          ) : (

            <Link
              to="/login"
              className="login-nav-button"
            >
              Login
            </Link>

          )}

        </div>

      </header>


      {/* ==================================================
          HERO
      ================================================== */}

      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">

            <span>
              ✦
            </span>

            Delicious food, delivered fast

          </div>


          <h1 className="hero-title">

            Your favourite food.

            <br />

            <span>
              Delivered to your door.
            </span>

          </h1>


          <p className="hero-subtitle">

            Discover the best restaurants around you,
            order your favourites and enjoy every bite.

          </p>


          <div className="search-box">

            <MapPin size={20} />

            <input
              type="text"
              placeholder="Search restaurants, cuisines or locations..."
              value={search}
              onChange={(event) =>
                handleSearchChange(
                  event.target.value
                )
              }
              onKeyDown={(event) => {

                if (event.key === "Enter") {
                  scrollToRestaurants();
                }

              }}
            />

            <button
              onClick={scrollToRestaurants}
            >

              <Search size={18} />

              Search

            </button>

          </div>


          <div className="hero-stats">

            <div>

              <strong>
                {restaurants.length > 0
                  ? `${restaurants.length.toLocaleString("en-IN")}+`
                  : "2,000+"}
              </strong>

              <span>
                Restaurants
              </span>

            </div>


            <div>

              <strong>
                10K+
              </strong>

              <span>
                Happy customers
              </span>

            </div>


            <div>

              <strong>
                30 min
              </strong>

              <span>
                Average delivery
              </span>

            </div>

          </div>

        </div>


        <div className="hero-visual">

          <div className="hero-food-circle">
            🍛
          </div>


          <div className="floating-food-card card-one">

            <span>
              🍕
            </span>

            <div>

              <strong>
                Fresh Pizza
              </strong>

              <small>
                Delivered hot
              </small>

            </div>

          </div>


          <div className="floating-food-card card-two">

            <span>
              ⭐
            </span>

            <div>

              <strong>
                4.8 Rating
              </strong>

              <small>
                Loved by foodies
              </small>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          CATEGORIES
      ================================================== */}

      <section className="categories-section">

        <div className="section-heading">

          <div>

            <span className="section-eyebrow">
              EXPLORE
            </span>

            <h2>
              What are you craving?
            </h2>

          </div>

          <span className="section-description">
            Pick a category and find your favourite
          </span>

        </div>


        <div className="category-grid">

          {categories.map(
            (category) => (

              <button
                className="category-card"
                key={category.name}
                onClick={() =>
                  handleCategoryClick(
                    category.name
                  )
                }
              >

                <div className="category-icon">
                  {category.emoji}
                </div>

                <span>
                  {category.name}
                </span>

              </button>

            )
          )}

        </div>

      </section>


      {/* ==================================================
          OFFERS
      ================================================== */}

      <section
        className="offers-section"
        id="offers"
      >

        <div className="section-heading">

          <div>

            <span className="section-eyebrow">
              OFFERS
            </span>

            <h2>
              Deals you'll love
            </h2>

          </div>

          <span className="section-description">
            More food. Less spending.
          </span>

        </div>


        <div className="offers-grid">

          {offers.map(
            (offer) => (

              <div
                className="offer-card"
                key={offer.code}
              >

                <div className="offer-emoji">
                  {offer.emoji}
                </div>

                <div className="offer-content">

                  <strong>
                    {offer.title}
                  </strong>

                  <span>
                    {offer.subtitle}
                  </span>

                  <small>
                    Use code: {offer.code}
                  </small>

                </div>

                <ArrowRight size={20} />

              </div>

            )
          )}

        </div>

      </section>


      {/* ==================================================
          RESTAURANTS
      ================================================== */}

      <section
        className="restaurants-section"
        id="restaurants"
      >

        <div className="section-heading">

          <div>

            <span className="section-eyebrow">
              TOP RESTAURANTS
            </span>

            <h2>

              {search
                ? `Results for "${search}"`
                : "Popular near you"}

            </h2>

          </div>


          <div className="restaurant-results-info">

            {!loading && (

              <span>

                {filteredRestaurants.length.toLocaleString(
                  "en-IN"
                )}

                {" "}

                restaurants

              </span>

            )}

          </div>

        </div>


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (

          <div className="restaurant-loading-home">

            <div className="loading-spinner"></div>

            <p>
              Finding great food near you...
            </p>

          </div>


        ) : filteredRestaurants.length === 0 ? (

          /* ==================================================
             NO RESULTS
          ================================================== */

          <div className="no-restaurants">

            <div>
              🍽️
            </div>

            <h3>
              No restaurants found
            </h3>

            <p>
              Try searching for another cuisine
              or restaurant.
            </p>

            <button
              onClick={clearSearch}
            >
              Show all restaurants
            </button>

          </div>


        ) : (

          /* ==================================================
             RESTAURANT GRID
          ================================================== */

          <>

            <div className="restaurant-grid">

              {displayedRestaurants.map(
                (restaurant) => (

                  <article
                    className="restaurant-card"
                    key={restaurant.id}
                    onClick={() =>
                      navigate(
                        `/restaurant/${restaurant.id}`
                      )
                    }
                  >

                    <div className="restaurant-card-image">

                      <span>

                        {getRestaurantEmoji(
                          restaurant.cuisine
                        )}

                      </span>


                      <div className="restaurant-offer">
                        20% OFF
                      </div>


                      <div className="restaurant-rating">

                        <Star
                          size={13}
                          fill="currentColor"
                        />

                        {restaurant.rating}

                      </div>

                    </div>


                    <div className="restaurant-card-content">

                      <h3>
                        {restaurant.name}
                      </h3>


                      <p className="restaurant-cuisine">
                        {restaurant.cuisine}
                      </p>


                      <div className="restaurant-meta">

                        <span>

                          <Clock size={14} />

                          25–30 min

                        </span>


                        <span>

                          <MapPin size={14} />

                          {restaurant.location}

                        </span>

                      </div>


                      <div className="restaurant-card-footer">

                        <span>
                          Free delivery above ₹299
                        </span>

                        <ChevronRight size={17} />

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>


            {/* ==================================================
                PAGINATION
            ================================================== */}

            {totalPages > 1 && (

              <div className="pagination">

                <button
                  className="pagination-button"
                  disabled={safeCurrentPage === 1}
                  onClick={() => {

                    setCurrentPage(
                      (page) =>
                        Math.max(page - 1, 1)
                    );

                    window.scrollTo({
                      top:
                        document
                          .getElementById(
                            "restaurants"
                          )
                          ?.offsetTop || 0,
                      behavior: "smooth"
                    });

                  }}
                >

                  <ChevronLeft size={18} />

                  Previous

                </button>


                <div className="pagination-pages">

                  {Array.from(
                    {
                      length: Math.min(
                        totalPages,
                        5
                      )
                    },
                    (_, index) => {

                      let pageNumber;

                      if (
                        totalPages <= 5
                      ) {

                        pageNumber =
                          index + 1;

                      } else if (
                        safeCurrentPage <= 3
                      ) {

                        pageNumber =
                          index + 1;

                      } else if (
                        safeCurrentPage >=
                        totalPages - 2
                      ) {

                        pageNumber =
                          totalPages -
                          4 +
                          index;

                      } else {

                        pageNumber =
                          safeCurrentPage -
                          2 +
                          index;

                      }

                      return (

                        <button
                          key={pageNumber}
                          className={
                            pageNumber ===
                            safeCurrentPage
                              ? "pagination-number active"
                              : "pagination-number"
                          }
                          onClick={() => {

                            setCurrentPage(
                              pageNumber
                            );

                            window.scrollTo({
                              top:
                                document
                                  .getElementById(
                                    "restaurants"
                                  )
                                  ?.offsetTop ||
                                0,
                              behavior:
                                "smooth"
                            });

                          }}
                        >

                          {pageNumber}

                        </button>

                      );

                    }
                  )}

                </div>


                <button
                  className="pagination-button"
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  onClick={() => {

                    setCurrentPage(
                      (page) =>
                        Math.min(
                          page + 1,
                          totalPages
                        )
                    );

                    window.scrollTo({
                      top:
                        document
                          .getElementById(
                            "restaurants"
                          )
                          ?.offsetTop || 0,
                      behavior: "smooth"
                    });

                  }}
                >

                  Next

                  <ChevronRight size={18} />

                </button>

              </div>

            )}


            <div className="pagination-summary">

              Showing{" "}

              <strong>
                {startIndex + 1}
              </strong>

              {" "}–{" "}

              <strong>
                {Math.min(
                  endIndex,
                  filteredRestaurants.length
                )}
              </strong>

              {" "}of{" "}

              <strong>
                {filteredRestaurants.length.toLocaleString(
                  "en-IN"
                )}
              </strong>

              {" "}restaurants

            </div>

          </>

        )}

      </section>


      {/* ==================================================
          WHY FOODRUSH
      ================================================== */}

      <section
        className="why-section"
        id="why-us"
      >

        <div className="why-header">

          <span className="section-eyebrow">
            WHY FOODRUSH
          </span>

          <h2>
            More than just food delivery.
          </h2>

          <p>
            We make ordering food simple, fast and
            enjoyable from the first click to the last
            bite.
          </p>

        </div>


        <div className="why-grid">

          <div className="why-card">

            <div className="why-icon">
              ⚡
            </div>

            <h3>
              Lightning fast
            </h3>

            <p>
              Get your favourite meals delivered
              quickly and reliably.
            </p>

          </div>


          <div className="why-card">

            <div className="why-icon">
              🍽️
            </div>

            <h3>
              Great selection
            </h3>

            <p>
              Discover restaurants and cuisines for
              every craving.
            </p>

          </div>


          <div className="why-card">

            <div className="why-icon">
              🔒
            </div>

            <h3>
              Safe & secure
            </h3>

            <p>
              Your orders and payments are handled
              with security in mind.
            </p>

          </div>


          <div className="why-card">

            <div className="why-icon">
              💛
            </div>

            <h3>
              Made for foodies
            </h3>

            <p>
              A smooth experience designed around
              people who love good food.
            </p>

          </div>

        </div>

      </section>


      {/* ==================================================
          CTA
      ================================================== */}

      <section className="home-cta">

        <div>

          <span className="section-eyebrow">
            READY TO ORDER?
          </span>

          <h2>
            Your next delicious meal
            <br />
            is just a click away.
          </h2>

          <p>
            Explore restaurants and start your
            FoodRush journey.
          </p>

        </div>


        <button
          onClick={scrollToRestaurants}
        >

          Explore restaurants

          <ArrowRight size={18} />

        </button>

      </section>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="footer">

        <div className="footer-main">

          <div className="footer-brand">

            <Link
              to="/"
              className="logo"
            >

              <span className="logo-mark">
                F
              </span>

              FoodRush

            </Link>


            <p>
              Good food. Great mood.
              <br />
              Delivered to your doorstep.
            </p>

          </div>


          <div className="footer-column">

            <h4>
              FoodRush
            </h4>

            <a href="#restaurants">
              Restaurants
            </a>

            <a href="#offers">
              Offers
            </a>

            <a href="#why-us">
              Why FoodRush
            </a>

          </div>


          <div className="footer-column">

            <h4>
              Account
            </h4>

            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>

            <Link to="/orders">
              My Orders
            </Link>

            <Link to="/profile">
              Profile
            </Link>

          </div>


          <div className="footer-column">

            <h4>
              Need help?
            </h4>

            <span>
              Help & Support
            </span>

            <span>
              Terms & Conditions
            </span>

            <span>
              Privacy Policy
            </span>

          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © 2026 FoodRush. All rights reserved.
          </span>

          <span>
            Made with ❤️ for food lovers
          </span>

        </div>

      </footer>

    </div>
  );
}


/*
 * ==========================================================
 * APPLICATION ROUTES
 * ==========================================================
 */

function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/restaurant/:id"
        element={<Restaurant />}
      />

      <Route
        path="/cart"
        element={<Cart />}
      />

      <Route
        path="/checkout"
        element={<Checkout />}
      />

      <Route
        path="/order-success/:orderId"
        element={<OrderSuccess />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/orders"
        element={<Orders />}
      />

      <Route
        path="/profile"
        element={<Profile />}
      />

    </Routes>

  );
}

export default App;