package com.example.fooddelivery.entity;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class RestaurantDataSeeder implements CommandLineRunner {

    private static final int TARGET_RESTAURANTS = 2000;
    private static final int MENU_ITEMS_PER_RESTAURANT = 12;

    @PersistenceContext
    private EntityManager entityManager;

    private final Random random = new Random(2026);

    private final String[] restaurantPrefixes = {
            "Spice", "Royal", "Urban", "Grand", "Tasty",
            "Fresh", "Desi", "Golden", "Street", "Flavours",
            "Foodie", "Classic", "House of", "Kitchen",
            "Heritage", "Express", "Delight", "Taste",
            "Cravings", "Signature"
    };

    private final String[] restaurantSuffixes = {
            "Bites", "Kitchen", "Grill", "Cafe", "Eats",
            "Dine", "Corner", "Hub", "Treats", "Tadka",
            "Food Court", "Bistro", "Palace", "Table",
            "Bakery", "Restaurant", "House", "Point",
            "Food Works", "Flavour House"
    };

    private final String[] cuisines = {
            "Indian",
            "Biryani",
            "South Indian",
            "North Indian",
            "Chinese",
            "Mughlai",
            "Fast Food",
            "Pizza",
            "Burgers",
            "Desserts",
            "Continental",
            "Asian",
            "Mexican",
            "Cafe",
            "Healthy"
    };

    private final String[] locations = {
            "Chennai",
            "Bangalore",
            "Hyderabad",
            "Mumbai",
            "Delhi",
            "Pune",
            "Kolkata",
            "Kochi",
            "Coimbatore",
            "Madurai",
            "Jaipur",
            "Ahmedabad",
            "Gurgaon",
            "Noida",
            "Chandigarh",
            "Mysore",
            "Visakhapatnam",
            "Vijayawada",
            "Trivandrum",
            "Bhubaneswar"
    };

    @Override
    @Transactional
    public void run(String... args) {
        seedDatabase();
    }

    public void seedDatabase() {

        long existingRestaurants =
                ((Number) entityManager
                        .createNativeQuery(
                                "SELECT COUNT(*) FROM restaurants")
                        .getSingleResult())
                        .longValue();

        System.out.println();
        System.out.println("==========================================");
        System.out.println("          FOODRUSH DATA SEEDER");
        System.out.println("==========================================");
        System.out.println(
                "Existing restaurants: " + existingRestaurants);
        System.out.println(
                "Target restaurants: " + TARGET_RESTAURANTS);
        System.out.println("==========================================");

        /*
         * First make sure existing restaurants have
         * enough menu items.
         *
         * This preserves Paradise Biryani and its
         * existing order/menu data.
         */
        seedMissingMenusForExistingRestaurants();

        int restaurantsToCreate =
                TARGET_RESTAURANTS -
                        (int) existingRestaurants;

        if (restaurantsToCreate <= 0) {

            System.out.println(
                    "Restaurant target already reached.");

            printFinalCounts();

            return;
        }

        System.out.println(
                "Creating "
                        + restaurantsToCreate
                        + " restaurants...");

        for (int i = 0;
             i < restaurantsToCreate;
             i++) {

            String cuisine =
                    cuisines[
                            random.nextInt(
                                    cuisines.length)
                            ];

            String location =
                    locations[
                            random.nextInt(
                                    locations.length)
                            ];

            String name =
                    generateRestaurantName(i + 2);

            double rating =
                    generateRating();

            boolean open =
                    random.nextInt(100) < 88;

            Restaurant restaurant =
                    new Restaurant(
                            name,
                            cuisine,
                            location,
                            rating,
                            open
                    );

            entityManager.persist(restaurant);

            /*
             * Restaurant uses GenerationType.IDENTITY,
             * therefore flush so the ID is generated.
             */
            entityManager.flush();

            Long restaurantId =
                    restaurant.getId();

            createMenuForRestaurant(
                    restaurantId,
                    cuisine
            );

            /*
             * Flush periodically so the persistence
             * context does not become unnecessarily large.
             */
            if ((i + 1) % 25 == 0) {

                entityManager.flush();
                entityManager.clear();

                System.out.println(
                        "Created "
                                + (i + 1)
                                + " / "
                                + restaurantsToCreate
                                + " restaurants");
            }
        }

        entityManager.flush();

        System.out.println();
        System.out.println("==========================================");
        System.out.println("       SEEDING COMPLETED SUCCESSFULLY");
        System.out.println("==========================================");

        printFinalCounts();

        System.out.println("==========================================");
    }

    /*
     * ======================================================
     * CREATE MENU ITEMS
     * ======================================================
     */

    private void createMenuForRestaurant(
            Long restaurantId,
            String cuisine) {

        List<MenuTemplate> menu =
                getMenuForCuisine(cuisine);

        for (MenuTemplate item : menu) {

            MenuItem menuItem =
                    new MenuItem(
                            restaurantId,
                            item.name,
                            item.category,
                            item.price,
                            true
                    );

            entityManager.persist(menuItem);
        }
    }

    /*
     * ======================================================
     * EXISTING RESTAURANTS
     *
     * Add menu items only if an existing restaurant
     * has fewer than 12.
     * ======================================================
     */

    private void seedMissingMenusForExistingRestaurants() {

        List<?> restaurantIds =
                entityManager
                        .createNativeQuery(
                                "SELECT id FROM restaurants")
                        .getResultList();

        for (Object value : restaurantIds) {

            Long restaurantId =
                    ((Number) value).longValue();

            Number count =
                    (Number) entityManager
                            .createNativeQuery(
                                    "SELECT COUNT(*) " +
                                            "FROM menu_items " +
                                            "WHERE restaurant_id = :restaurantId")
                            .setParameter(
                                    "restaurantId",
                                    restaurantId)
                            .getSingleResult();

            int existingMenuItems =
                    count.intValue();

            if (existingMenuItems >=
                    MENU_ITEMS_PER_RESTAURANT) {

                continue;
            }

            String cuisine =
                    (String) entityManager
                            .createNativeQuery(
                                    "SELECT cuisine " +
                                            "FROM restaurants " +
                                            "WHERE id = :restaurantId")
                            .setParameter(
                                    "restaurantId",
                                    restaurantId)
                            .getSingleResult();

            List<MenuTemplate> menu =
                    getMenuForCuisine(cuisine);

            int itemsNeeded =
                    MENU_ITEMS_PER_RESTAURANT -
                            existingMenuItems;

            for (int i = 0;
                 i < itemsNeeded && i < menu.size();
                 i++) {

                MenuTemplate item =
                        menu.get(
                                existingMenuItems + i
                        );

                MenuItem menuItem =
                        new MenuItem(
                                restaurantId,
                                item.name,
                                item.category,
                                item.price,
                                true
                        );

                entityManager.persist(menuItem);
            }
        }

        entityManager.flush();
    }

    /*
     * ======================================================
     * RESTAURANT NAME GENERATOR
     * ======================================================
     */

    private String generateRestaurantName(
            int number) {

        String prefix =
                restaurantPrefixes[
                        random.nextInt(
                                restaurantPrefixes.length)
                        ];

        String suffix =
                restaurantSuffixes[
                        random.nextInt(
                                restaurantSuffixes.length)
                        ];

        return prefix
                + " "
                + suffix
                + " "
                + String.format("%04d", number);
    }

    /*
     * ======================================================
     * RATING GENERATOR
     * ======================================================
     */

    private double generateRating() {

        double rating =
                3.5 +
                        random.nextDouble() * 1.5;

        return Math.round(
                rating * 10.0
        ) / 10.0;
    }

    /*
     * ======================================================
     * MENU DATABASE
     * ======================================================
     */

    private List<MenuTemplate> getMenuForCuisine(
            String cuisine) {

        List<MenuTemplate> menu =
                new ArrayList<>();

        switch (cuisine) {

            case "Biryani":

                menu.add(new MenuTemplate(
                        "Chicken Biryani",
                        "Biryani",
                        260.0));

                menu.add(new MenuTemplate(
                        "Mutton Biryani",
                        "Biryani",
                        340.0));

                menu.add(new MenuTemplate(
                        "Veg Biryani",
                        "Biryani",
                        190.0));

                menu.add(new MenuTemplate(
                        "Egg Biryani",
                        "Biryani",
                        220.0));

                menu.add(new MenuTemplate(
                        "Chicken 65",
                        "Starters",
                        220.0));

                menu.add(new MenuTemplate(
                        "Chicken Tikka",
                        "Starters",
                        240.0));

                menu.add(new MenuTemplate(
                        "Paneer Tikka",
                        "Starters",
                        210.0));

                menu.add(new MenuTemplate(
                        "Mutton Kebab",
                        "Starters",
                        280.0));

                menu.add(new MenuTemplate(
                        "Garlic Naan",
                        "Breads",
                        65.0));

                menu.add(new MenuTemplate(
                        "Butter Naan",
                        "Breads",
                        55.0));

                menu.add(new MenuTemplate(
                        "Gulab Jamun",
                        "Desserts",
                        90.0));

                menu.add(new MenuTemplate(
                        "Fresh Lime Soda",
                        "Beverages",
                        80.0));

                break;

            case "South Indian":

                menu.add(new MenuTemplate(
                        "Masala Dosa",
                        "Dosa",
                        120.0));

                menu.add(new MenuTemplate(
                        "Plain Dosa",
                        "Dosa",
                        90.0));

                menu.add(new MenuTemplate(
                        "Paneer Dosa",
                        "Dosa",
                        160.0));

                menu.add(new MenuTemplate(
                        "Idli Sambar",
                        "Breakfast",
                        80.0));

                menu.add(new MenuTemplate(
                        "Vada Sambar",
                        "Breakfast",
                        85.0));

                menu.add(new MenuTemplate(
                        "Pongal",
                        "Breakfast",
                        100.0));

                menu.add(new MenuTemplate(
                        "Poori Masala",
                        "Breakfast",
                        110.0));

                menu.add(new MenuTemplate(
                        "Vegetable Uttapam",
                        "Dosa",
                        130.0));

                menu.add(new MenuTemplate(
                        "Curd Rice",
                        "Rice",
                        100.0));

                menu.add(new MenuTemplate(
                        "Lemon Rice",
                        "Rice",
                        105.0));

                menu.add(new MenuTemplate(
                        "Filter Coffee",
                        "Beverages",
                        60.0));

                menu.add(new MenuTemplate(
                        "Payasam",
                        "Desserts",
                        90.0));

                break;

            case "Chinese":

                menu.add(new MenuTemplate(
                        "Veg Fried Rice",
                        "Rice",
                        150.0));

                menu.add(new MenuTemplate(
                        "Chicken Fried Rice",
                        "Rice",
                        190.0));

                menu.add(new MenuTemplate(
                        "Veg Hakka Noodles",
                        "Noodles",
                        160.0));

                menu.add(new MenuTemplate(
                        "Chicken Hakka Noodles",
                        "Noodles",
                        210.0));

                menu.add(new MenuTemplate(
                        "Chilli Chicken",
                        "Starters",
                        230.0));

                menu.add(new MenuTemplate(
                        "Chicken Manchurian",
                        "Starters",
                        220.0));

                menu.add(new MenuTemplate(
                        "Gobi Manchurian",
                        "Starters",
                        170.0));

                menu.add(new MenuTemplate(
                        "Spring Rolls",
                        "Starters",
                        150.0));

                menu.add(new MenuTemplate(
                        "Schezwan Fried Rice",
                        "Rice",
                        180.0));

                menu.add(new MenuTemplate(
                        "Paneer Chilli",
                        "Starters",
                        190.0));

                menu.add(new MenuTemplate(
                        "Momos",
                        "Snacks",
                        140.0));

                menu.add(new MenuTemplate(
                        "Iced Tea",
                        "Beverages",
                        80.0));

                break;

            case "Pizza":

                menu.add(new MenuTemplate(
                        "Margherita Pizza",
                        "Pizza",
                        220.0));

                menu.add(new MenuTemplate(
                        "Farmhouse Pizza",
                        "Pizza",
                        320.0));

                menu.add(new MenuTemplate(
                        "Paneer Tikka Pizza",
                        "Pizza",
                        340.0));

                menu.add(new MenuTemplate(
                        "Chicken Tikka Pizza",
                        "Pizza",
                        380.0));

                menu.add(new MenuTemplate(
                        "Pepperoni Pizza",
                        "Pizza",
                        420.0));

                menu.add(new MenuTemplate(
                        "Veg Supreme Pizza",
                        "Pizza",
                        360.0));

                menu.add(new MenuTemplate(
                        "Garlic Bread",
                        "Sides",
                        140.0));

                menu.add(new MenuTemplate(
                        "Cheese Garlic Bread",
                        "Sides",
                        180.0));

                menu.add(new MenuTemplate(
                        "French Fries",
                        "Sides",
                        120.0));

                menu.add(new MenuTemplate(
                        "Pasta Alfredo",
                        "Pasta",
                        240.0));

                menu.add(new MenuTemplate(
                        "Chocolate Brownie",
                        "Desserts",
                        130.0));

                menu.add(new MenuTemplate(
                        "Cold Coffee",
                        "Beverages",
                        120.0));

                break;

            case "Burgers":
            case "Fast Food":

                menu.add(new MenuTemplate(
                        "Classic Veg Burger",
                        "Burgers",
                        140.0));

                menu.add(new MenuTemplate(
                        "Classic Chicken Burger",
                        "Burgers",
                        180.0));

                menu.add(new MenuTemplate(
                        "Cheese Burger",
                        "Burgers",
                        190.0));

                menu.add(new MenuTemplate(
                        "Double Chicken Burger",
                        "Burgers",
                        260.0));

                menu.add(new MenuTemplate(
                        "Paneer Burger",
                        "Burgers",
                        170.0));

                menu.add(new MenuTemplate(
                        "Peri Peri Fries",
                        "Sides",
                        150.0));

                menu.add(new MenuTemplate(
                        "French Fries",
                        "Sides",
                        110.0));

                menu.add(new MenuTemplate(
                        "Chicken Nuggets",
                        "Sides",
                        180.0));

                menu.add(new MenuTemplate(
                        "Chicken Wings",
                        "Starters",
                        220.0));

                menu.add(new MenuTemplate(
                        "Veg Wrap",
                        "Wraps",
                        150.0));

                menu.add(new MenuTemplate(
                        "Chicken Wrap",
                        "Wraps",
                        190.0));

                menu.add(new MenuTemplate(
                        "Chocolate Shake",
                        "Beverages",
                        160.0));

                break;

            case "North Indian":
            case "Indian":
            case "Mughlai":

                menu.add(new MenuTemplate(
                        "Butter Chicken",
                        "Main Course",
                        280.0));

                menu.add(new MenuTemplate(
                        "Chicken Tikka Masala",
                        "Main Course",
                        290.0));

                menu.add(new MenuTemplate(
                        "Paneer Butter Masala",
                        "Main Course",
                        240.0));

                menu.add(new MenuTemplate(
                        "Dal Makhani",
                        "Main Course",
                        190.0));

                menu.add(new MenuTemplate(
                        "Shahi Paneer",
                        "Main Course",
                        230.0));

                menu.add(new MenuTemplate(
                        "Chicken Biryani",
                        "Rice",
                        260.0));

                menu.add(new MenuTemplate(
                        "Jeera Rice",
                        "Rice",
                        130.0));

                menu.add(new MenuTemplate(
                        "Garlic Naan",
                        "Breads",
                        70.0));

                menu.add(new MenuTemplate(
                        "Butter Naan",
                        "Breads",
                        60.0));

                menu.add(new MenuTemplate(
                        "Tandoori Roti",
                        "Breads",
                        45.0));

                menu.add(new MenuTemplate(
                        "Gulab Jamun",
                        "Desserts",
                        90.0));

                menu.add(new MenuTemplate(
                        "Lassi",
                        "Beverages",
                        100.0));

                break;

            case "Desserts":

                menu.add(new MenuTemplate(
                        "Chocolate Cake",
                        "Cakes",
                        180.0));

                menu.add(new MenuTemplate(
                        "Red Velvet Cake",
                        "Cakes",
                        220.0));

                menu.add(new MenuTemplate(
                        "Brownie",
                        "Desserts",
                        130.0));

                menu.add(new MenuTemplate(
                        "Chocolate Lava Cake",
                        "Desserts",
                        180.0));

                menu.add(new MenuTemplate(
                        "Gulab Jamun",
                        "Indian Desserts",
                        90.0));

                menu.add(new MenuTemplate(
                        "Rasmalai",
                        "Indian Desserts",
                        120.0));

                menu.add(new MenuTemplate(
                        "Ice Cream Sundae",
                        "Ice Cream",
                        160.0));

                menu.add(new MenuTemplate(
                        "Chocolate Ice Cream",
                        "Ice Cream",
                        120.0));

                menu.add(new MenuTemplate(
                        "Mango Ice Cream",
                        "Ice Cream",
                        120.0));

                menu.add(new MenuTemplate(
                        "Cheesecake",
                        "Cakes",
                        230.0));

                menu.add(new MenuTemplate(
                        "Waffle",
                        "Desserts",
                        190.0));

                menu.add(new MenuTemplate(
                        "Cold Coffee",
                        "Beverages",
                        130.0));

                break;

            case "Continental":

                menu.add(new MenuTemplate(
                        "Creamy Alfredo Pasta",
                        "Pasta",
                        260.0));

                menu.add(new MenuTemplate(
                        "Arrabbiata Pasta",
                        "Pasta",
                        240.0));

                menu.add(new MenuTemplate(
                        "Grilled Chicken",
                        "Main Course",
                        320.0));

                menu.add(new MenuTemplate(
                        "Chicken Steak",
                        "Main Course",
                        380.0));

                menu.add(new MenuTemplate(
                        "Veg Steak",
                        "Main Course",
                        300.0));

                menu.add(new MenuTemplate(
                        "Chicken Sandwich",
                        "Sandwiches",
                        220.0));

                menu.add(new MenuTemplate(
                        "Veg Sandwich",
                        "Sandwiches",
                        180.0));

                menu.add(new MenuTemplate(
                        "Caesar Salad",
                        "Salads",
                        200.0));

                menu.add(new MenuTemplate(
                        "Greek Salad",
                        "Salads",
                        210.0));

                menu.add(new MenuTemplate(
                        "Garlic Bread",
                        "Sides",
                        140.0));

                menu.add(new MenuTemplate(
                        "Chocolate Brownie",
                        "Desserts",
                        140.0));

                menu.add(new MenuTemplate(
                        "Iced Coffee",
                        "Beverages",
                        140.0));

                break;

            case "Asian":

                menu.add(new MenuTemplate(
                        "Thai Green Curry",
                        "Main Course",
                        280.0));

                menu.add(new MenuTemplate(
                        "Thai Red Curry",
                        "Main Course",
                        280.0));

                menu.add(new MenuTemplate(
                        "Pad Thai",
                        "Noodles",
                        260.0));

                menu.add(new MenuTemplate(
                        "Sushi Platter",
                        "Sushi",
                        450.0));

                menu.add(new MenuTemplate(
                        "Chicken Teriyaki",
                        "Main Course",
                        320.0));

                menu.add(new MenuTemplate(
                        "Veg Teriyaki",
                        "Main Course",
                        280.0));

                menu.add(new MenuTemplate(
                        "Ramen",
                        "Noodles",
                        260.0));

                menu.add(new MenuTemplate(
                        "Gyoza",
                        "Starters",
                        190.0));

                menu.add(new MenuTemplate(
                        "Spring Rolls",
                        "Starters",
                        160.0));

                menu.add(new MenuTemplate(
                        "Fried Rice",
                        "Rice",
                        180.0));

                menu.add(new MenuTemplate(
                        "Mochi",
                        "Desserts",
                        150.0));

                menu.add(new MenuTemplate(
                        "Green Tea",
                        "Beverages",
                        80.0));

                break;

            case "Mexican":

                menu.add(new MenuTemplate(
                        "Veg Tacos",
                        "Tacos",
                        180.0));

                menu.add(new MenuTemplate(
                        "Chicken Tacos",
                        "Tacos",
                        220.0));

                menu.add(new MenuTemplate(
                        "Chicken Burrito",
                        "Burritos",
                        260.0));

                menu.add(new MenuTemplate(
                        "Veg Burrito",
                        "Burritos",
                        220.0));

                menu.add(new MenuTemplate(
                        "Cheese Quesadilla",
                        "Quesadilla",
                        210.0));

                menu.add(new MenuTemplate(
                        "Chicken Quesadilla",
                        "Quesadilla",
                        250.0));

                menu.add(new MenuTemplate(
                        "Nachos",
                        "Sides",
                        170.0));

                menu.add(new MenuTemplate(
                        "Loaded Nachos",
                        "Sides",
                        230.0));

                menu.add(new MenuTemplate(
                        "Mexican Rice",
                        "Rice",
                        180.0));

                menu.add(new MenuTemplate(
                        "Guacamole",
                        "Sides",
                        150.0));

                menu.add(new MenuTemplate(
                        "Churros",
                        "Desserts",
                        140.0));

                menu.add(new MenuTemplate(
                        "Lime Soda",
                        "Beverages",
                        90.0));

                break;

            case "Cafe":

                menu.add(new MenuTemplate(
                        "Cappuccino",
                        "Coffee",
                        140.0));

                menu.add(new MenuTemplate(
                        "Latte",
                        "Coffee",
                        150.0));

                menu.add(new MenuTemplate(
                        "Americano",
                        "Coffee",
                        120.0));

                menu.add(new MenuTemplate(
                        "Cold Coffee",
                        "Coffee",
                        160.0));

                menu.add(new MenuTemplate(
                        "Masala Chai",
                        "Tea",
                        80.0));

                menu.add(new MenuTemplate(
                        "Veg Sandwich",
                        "Sandwiches",
                        160.0));

                menu.add(new MenuTemplate(
                        "Chicken Sandwich",
                        "Sandwiches",
                        210.0));

                menu.add(new MenuTemplate(
                        "Pasta",
                        "Pasta",
                        230.0));

                menu.add(new MenuTemplate(
                        "French Fries",
                        "Sides",
                        120.0));

                menu.add(new MenuTemplate(
                        "Chocolate Brownie",
                        "Desserts",
                        140.0));

                menu.add(new MenuTemplate(
                        "Blueberry Cheesecake",
                        "Desserts",
                        220.0));

                menu.add(new MenuTemplate(
                        "Chocolate Shake",
                        "Beverages",
                        170.0));

                break;

            case "Healthy":

                menu.add(new MenuTemplate(
                        "Grilled Chicken Bowl",
                        "Bowls",
                        280.0));

                menu.add(new MenuTemplate(
                        "Paneer Protein Bowl",
                        "Bowls",
                        250.0));

                menu.add(new MenuTemplate(
                        "Veg Salad Bowl",
                        "Salads",
                        210.0));

                menu.add(new MenuTemplate(
                        "Chicken Salad",
                        "Salads",
                        240.0));

                menu.add(new MenuTemplate(
                        "Quinoa Bowl",
                        "Bowls",
                        260.0));

                menu.add(new MenuTemplate(
                        "Avocado Toast",
                        "Breakfast",
                        220.0));

                menu.add(new MenuTemplate(
                        "Oats Bowl",
                        "Breakfast",
                        170.0));

                menu.add(new MenuTemplate(
                        "Fruit Bowl",
                        "Breakfast",
                        160.0));

                menu.add(new MenuTemplate(
                        "Protein Smoothie",
                        "Beverages",
                        190.0));

                menu.add(new MenuTemplate(
                        "Green Smoothie",
                        "Beverages",
                        170.0));

                menu.add(new MenuTemplate(
                        "Fresh Juice",
                        "Beverages",
                        130.0));

                menu.add(new MenuTemplate(
                        "Greek Yogurt",
                        "Desserts",
                        150.0));

                break;

            default:

                menu.add(new MenuTemplate(
                        "Special Veg Meal",
                        "Main Course",
                        180.0));

                menu.add(new MenuTemplate(
                        "Special Chicken Meal",
                        "Main Course",
                        240.0));

                menu.add(new MenuTemplate(
                        "Paneer Special",
                        "Main Course",
                        220.0));

                menu.add(new MenuTemplate(
                        "Chicken Tikka",
                        "Starters",
                        230.0));

                menu.add(new MenuTemplate(
                        "Veg Starter",
                        "Starters",
                        170.0));

                menu.add(new MenuTemplate(
                        "Fried Rice",
                        "Rice",
                        170.0));

                menu.add(new MenuTemplate(
                        "Noodles",
                        "Noodles",
                        170.0));

                menu.add(new MenuTemplate(
                        "Butter Naan",
                        "Breads",
                        60.0));

                menu.add(new MenuTemplate(
                        "Garlic Naan",
                        "Breads",
                        70.0));

                menu.add(new MenuTemplate(
                        "French Fries",
                        "Sides",
                        120.0));

                menu.add(new MenuTemplate(
                        "Gulab Jamun",
                        "Desserts",
                        90.0));

                menu.add(new MenuTemplate(
                        "Fresh Lime Soda",
                        "Beverages",
                        80.0));

                break;
        }

        return menu;
    }

    /*
     * ======================================================
     * VERIFY FINAL COUNTS
     * ======================================================
     */

    private void printFinalCounts() {

        Number restaurantCount =
                (Number) entityManager
                        .createNativeQuery(
                                "SELECT COUNT(*) FROM restaurants")
                        .getSingleResult();

        Number menuCount =
                (Number) entityManager
                        .createNativeQuery(
                                "SELECT COUNT(*) FROM menu_items")
                        .getSingleResult();

        System.out.println();
        System.out.println(
                "Total restaurants: "
                        + restaurantCount);

        System.out.println(
                "Total menu items: "
                        + menuCount);
    }

    /*
     * ======================================================
     * MENU TEMPLATE
     * ======================================================
     */

    private static class MenuTemplate {

        private final String name;
        private final String category;
        private final Double price;

        public MenuTemplate(
                String name,
                String category,
                Double price) {

            this.name = name;
            this.category = category;
            this.price = price;
        }
    }
}