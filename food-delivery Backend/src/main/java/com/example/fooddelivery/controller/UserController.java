package com.example.fooddelivery.controller;

import com.example.fooddelivery.entity.User;
import com.example.fooddelivery.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService) {

        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> request) {

        try {

            String name =
                    request.get("name");

            String email =
                    request.get("email");

            String phone =
                    request.get("phone");

            String password =
                    request.get("password");

            User user =
                    userService.register(
                            name,
                            email,
                            phone,
                            password
                    );

            return ResponseEntity.ok(
                    createUserResponse(user)
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request) {

        try {

            String email =
                    request.get("email");

            String password =
                    request.get("password");

            User user =
                    userService.login(
                            email,
                            password
                    );

            return ResponseEntity.ok(
                    createUserResponse(user)
            );

        } catch (RuntimeException exception) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }

    private Map<String, Object> createUserResponse(
            User user) {

        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone()
        );
    }
}