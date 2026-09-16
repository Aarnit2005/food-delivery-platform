package com.example.fooddelivery.service;

import com.example.fooddelivery.entity.CartItem;
import com.example.fooddelivery.entity.MenuItem;
import com.example.fooddelivery.entity.Order;
import com.example.fooddelivery.entity.OrderItem;
import com.example.fooddelivery.repository.CartItemRepository;
import com.example.fooddelivery.repository.MenuItemRepository;
import com.example.fooddelivery.repository.OrderItemRepository;
import com.example.fooddelivery.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartItemRepository cartItemRepository,
            MenuItemRepository menuItemRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.menuItemRepository = menuItemRepository;
    }

    @Transactional
    public Order placeOrder(Long userId) {

        List<CartItem> cartItems =
                cartItemRepository.findByUserId(userId);

        if (cartItems.isEmpty()) {
            throw new RuntimeException(
                    "Cart is empty");
        }

        double totalAmount = 0.0;

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {

            MenuItem menuItem =
                    menuItemRepository.findById(
                            cartItem.getMenuItemId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Menu item not found"));

            if (!Boolean.TRUE.equals(
                    menuItem.getAvailable())) {

                throw new RuntimeException(
                        menuItem.getName()
                                + " is currently unavailable");
            }

            double itemTotal =
                    menuItem.getPrice()
                            * cartItem.getQuantity();

            totalAmount += itemTotal;

            OrderItem orderItem = new OrderItem(
                    null,
                    menuItem.getId(),
                    menuItem.getName(),
                    menuItem.getPrice(),
                    cartItem.getQuantity()
            );

            orderItems.add(orderItem);
        }

        Order order = new Order(
                userId,
                totalAmount,
                "PLACED",
                "SUCCESS",
                LocalDateTime.now()
        );

        Order savedOrder =
                orderRepository.save(order);

        for (OrderItem orderItem : orderItems) {

            orderItem.setOrderId(
                    savedOrder.getId()
            );

            orderItemRepository.save(orderItem);
        }

        cartItemRepository.deleteByUserId(userId);

        return savedOrder;
    }

    public List<Order> getOrdersByUser(Long userId) {

        return orderRepository.findByUserId(userId);
    }

    public Order getOrderById(Long orderId) {

        return orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"));
    }

    @Transactional
    public Order updateOrderStatus(
            Long orderId,
            String status) {

        Order order = getOrderById(orderId);

        order.setStatus(status);

        return orderRepository.save(order);
    }

    public List<OrderItem> getOrderItems(
            Long orderId) {

        return orderItemRepository.findByOrderId(
                orderId
        );
    }
}