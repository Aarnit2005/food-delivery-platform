package com.example.fooddelivery.controller;

import com.example.fooddelivery.entity.MenuItem;
import com.example.fooddelivery.service.MenuItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/menu-items")
@CrossOrigin(origins = "http://localhost:5173")
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(
            MenuItemService menuItemService) {

        this.menuItemService = menuItemService;
    }

    @GetMapping
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {

        return ResponseEntity.ok(
                menuItemService.getAllMenuItems()
        );
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuItem>> getMenuByRestaurant(
            @PathVariable Long restaurantId) {

        return ResponseEntity.ok(
                menuItemService.getMenuByRestaurant(
                        restaurantId
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItem(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                menuItemService.getMenuItemById(id)
        );
    }

    @PostMapping
    public ResponseEntity<MenuItem> createMenuItem(
            @RequestBody MenuItem menuItem) {

        return ResponseEntity.ok(
                menuItemService.createMenuItem(menuItem)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable Long id,
            @RequestBody MenuItem menuItem) {

        return ResponseEntity.ok(
                menuItemService.updateMenuItem(
                        id,
                        menuItem
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(
            @PathVariable Long id) {

        menuItemService.deleteMenuItem(id);

        return ResponseEntity.ok(
                java.util.Map.of(
                        "message",
                        "Menu item deleted successfully"
                )
        );
    }
}