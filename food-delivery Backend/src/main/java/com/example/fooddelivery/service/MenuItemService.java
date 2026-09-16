package com.example.fooddelivery.service;

import com.example.fooddelivery.entity.MenuItem;
import com.example.fooddelivery.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;

    public MenuItemService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> getMenuByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    public MenuItem getMenuItemById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Menu item not found"));
    }

    public MenuItem createMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    public MenuItem updateMenuItem(
            Long id,
            MenuItem updatedMenuItem) {

        MenuItem menuItem = getMenuItemById(id);

        menuItem.setRestaurantId(
                updatedMenuItem.getRestaurantId()
        );

        menuItem.setName(
                updatedMenuItem.getName()
        );

        menuItem.setCategory(
                updatedMenuItem.getCategory()
        );

        menuItem.setPrice(
                updatedMenuItem.getPrice()
        );

        menuItem.setAvailable(
                updatedMenuItem.getAvailable()
        );

        return menuItemRepository.save(menuItem);
    }

    public void deleteMenuItem(Long id) {

        if (!menuItemRepository.existsById(id)) {
            throw new RuntimeException("Menu item not found");
        }

        menuItemRepository.deleteById(id);
    }
}