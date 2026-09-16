package com.example.fooddelivery.service;

import com.example.fooddelivery.entity.Restaurant;
import com.example.fooddelivery.repository.RestaurantRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public RestaurantService(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Restaurant not found"));
    }

    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    public Restaurant updateRestaurant(
            Long id,
            Restaurant updatedRestaurant) {

        Restaurant restaurant = getRestaurantById(id);

        restaurant.setName(updatedRestaurant.getName());
        restaurant.setCuisine(updatedRestaurant.getCuisine());
        restaurant.setLocation(updatedRestaurant.getLocation());
        restaurant.setRating(updatedRestaurant.getRating());
        restaurant.setOpen(updatedRestaurant.getOpen());

        return restaurantRepository.save(restaurant);
    }

    public void deleteRestaurant(Long id) {

        if (!restaurantRepository.existsById(id)) {
            throw new RuntimeException("Restaurant not found");
        }

        restaurantRepository.deleteById(id);
    }
}