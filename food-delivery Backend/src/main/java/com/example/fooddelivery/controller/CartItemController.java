package com.example.fooddelivery.controller;

import com.example.fooddelivery.entity.CartItem;
import com.example.fooddelivery.service.CartItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartItemController {

    private final CartItemService cartItemService;

    public CartItemController(
            CartItemService cartItemService) {

        this.cartItemService = cartItemService;
    }

    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(
            @RequestBody Map<String, Object> request) {

        Long userId = Long.valueOf(
                request.get("userId").toString()
        );

        Long menuItemId = Long.valueOf(
                request.get("menuItemId").toString()
        );

        Integer quantity = Integer.valueOf(
                request.get("quantity").toString()
        );

        return ResponseEntity.ok(
                cartItemService.addToCart(
                        userId,
                        menuItemId,
                        quantity
                )
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItem>> getCart(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                cartItemService.getCart(userId)
        );
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItem> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Integer> request) {

        Integer quantity = request.get("quantity");

        return ResponseEntity.ok(
                cartItemService.updateQuantity(
                        cartItemId,
                        quantity
                )
        );
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeFromCart(
            @PathVariable Long cartItemId) {

        cartItemService.removeFromCart(cartItemId);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Item removed from cart"
                )
        );
    }

    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearCart(
            @PathVariable Long userId) {

        cartItemService.clearCart(userId);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Cart cleared successfully"
                )
        );
    }
}