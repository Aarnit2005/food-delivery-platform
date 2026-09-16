# Food Delivery Platform

A full-stack food delivery platform built using **Java Spring Boot** and **React**, designed to simulate a real-world food ordering ecosystem with restaurant discovery, menu browsing, cart management, order processing, and user management.

---

## 📌 Overview

The Food Delivery Platform is a full-stack web application that connects customers with restaurants through a seamless online food-ordering experience.

Users can browse restaurants, explore menus, add items to their cart, manage their profiles, place orders, and track their order history.

The application follows a **frontend–backend architecture**, with React handling the user interface and Java Spring Boot providing RESTful APIs and business logic.

---

## 🚀 Key Features

### 👤 User Management
- User registration and login
- User profile management
- Authentication-ready architecture
- User-specific order history

### 🍽️ Restaurant Management
- Restaurant listing
- Restaurant details
- Restaurant-specific menu browsing
- Restaurant information management

### 📋 Menu Management
- Browse menu items
- View item details
- Menu organized by restaurant
- Add menu items to cart

### 🛒 Shopping Cart
- Add items to cart
- Update item quantities
- Remove items
- Calculate cart totals
- Review cart before checkout

### 📦 Order Management
- Place food orders
- Order summary
- Order history
- Order success confirmation
- Order and order-item management

### 💳 Checkout & Payment Workflow
- Checkout interface
- Order total calculation
- Payment workflow integration point
- Order confirmation after checkout

---

## 🏗️ System Architecture

```text
                ┌─────────────────────┐
                │      React UI       │
                │     Frontend        │
                └──────────┬──────────┘
                           │
                           │ REST API
                           ▼
                ┌─────────────────────┐
                │   Spring Boot API   │
                │      Backend        │
                └──────────┬──────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        Controllers     Services    Repositories
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                     Database Layer
