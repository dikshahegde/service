package com.cafehub.controller;

import com.cafehub.dto.AuthResponse;
import com.cafehub.dto.LoginRequest;
import com.cafehub.dto.RegisterRequest;
import com.cafehub.model.User;
import com.cafehub.repository.UserRepository;
import com.cafehub.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse("User already exists with this email", null, null));
            }

            // Create new user
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(request.getRole());
            user.setPhone(request.getPhone());

            User savedUser = userRepository.save(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name());

            return ResponseEntity.ok(new AuthResponse(
                "User registered successfully",
                token,
                AuthResponse.UserDto.fromUser(savedUser)
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse("Registration failed: " + e.getMessage(), null, null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Get user details
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

            return ResponseEntity.ok(new AuthResponse(
                "Login successful",
                token,
                AuthResponse.UserDto.fromUser(user)
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse("Invalid credentials", null, null));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(new AuthResponse(
                "User found",
                null,
                AuthResponse.UserDto.fromUser(user)
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse("User not found", null, null));
        }
    }
}