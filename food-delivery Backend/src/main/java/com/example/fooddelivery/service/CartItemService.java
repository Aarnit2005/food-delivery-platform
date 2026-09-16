package com.example.fooddelivery.service;

import com.example.fooddelivery.entity.CartItem;
import com.example.fooddelivery.entity.MenuItem;
import com.example.fooddelivery.repository.CartItemRepository;
import com.example.fooddelivery.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartItemService {

    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;

    public CartItemService(
            CartItemRepository cartItemRepository,
            MenuItemRepository menuItemRepository) {

        this.cartItemRepository = cartItemRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public CartItem addToCart(
            Long userId,
            Long menuItemId,
            Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero");
        }

        MenuItem menuItem = menuItemRepository
                .findById(menuItemId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Menu item not found"));

        if (!Boolean.TRUE.equals(menuItem.getAvailable())) {
            throw new RuntimeException(
                    "Menu item is currently unavailable");
        }

        CartItem existingItem =
                cartItemRepository
                        .findByUserIdAndMenuItemId(
                                userId,
                                menuItemId)
                        .orElse(null);

        if (existingItem != null) {

            existingItem.setQuantity(
                    existingItem.getQuantity() + quantity
            );

            return cartItemRepository.save(existingItem);
        }

        CartItem cartItem = new CartItem(
                userId,
                menuItemId,
                quantity
        );

        return cartItemRepository.save(cartItem);
    }

    public List<CartItem> getCart(Long userId) {

        return cartItemRepository.findByUserId(userId);
    }

    public CartItem updateQuantity(
            Long cartItemId,
            Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero");
        }

        CartItem cartItem =
                cartItemRepository.findById(cartItemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart item not found"));

        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }

    public void removeFromCart(Long cartItemId) {

        if (!cartItemRepository.existsById(cartItemId)) {
            throw new RuntimeException(
                    "Cart item not found");
        }

        cartItemRepository.deleteById(cartItemId);
    }

    public void clearCart(Long userId) {

        cartItemRepository.deleteByUserId(userId);
    }
}