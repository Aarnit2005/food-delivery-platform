package com.example.fooddelivery.service;

import com.example.fooddelivery.entity.User;
import com.example.fooddelivery.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UserService(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    public User register(
            String name,
            String email,
            String phone,
            String password) {

        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException(
                    "Name is required");
        }

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException(
                    "Email is required");
        }

        if (phone == null || phone.trim().isEmpty()) {
            throw new RuntimeException(
                    "Phone number is required");
        }

        if (password == null || password.length() < 6) {
            throw new RuntimeException(
                    "Password must contain at least 6 characters");
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        if (userRepository.existsByEmail(
                normalizedEmail)) {

            throw new RuntimeException(
                    "An account with this email already exists");
        }

        String encodedPassword =
                passwordEncoder.encode(password);

        User user =
                new User(
                        name.trim(),
                        normalizedEmail,
                        phone.trim(),
                        encodedPassword
                );

        return userRepository.save(user);
    }

    public User login(
            String email,
            String password) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required");
        }

        if (password == null ||
                password.isEmpty()) {

            throw new RuntimeException(
                    "Password is required");
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmail(normalizedEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid email or password"));

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password");
        }

        return user;
    }
}