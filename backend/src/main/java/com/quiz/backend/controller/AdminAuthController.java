package com.quiz.backend.controller;

import com.quiz.backend.dto.AdminLoginRequest;
import com.quiz.backend.model.AdminUser;
import com.quiz.backend.repo.AdminUserRepository;
import com.quiz.backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin-auth")
@CrossOrigin
public class AdminAuthController {

    private final AdminUserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    public AdminAuthController(AdminUserRepository repo, PasswordEncoder encoder, JwtUtil jwt) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest req) {
        if (req == null || req.email == null || req.password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }

        AdminUser admin = repo.findByEmail(req.email.trim().toLowerCase())
                .orElse(null);

        if (admin == null || !admin.isActive()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }

        if (!encoder.matches(req.password, admin.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }

        String token = jwt.createToken(admin.getId(), admin.getEmail(), admin.getRole());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "admin", Map.of(
                        "id", admin.getId(),
                        "email", admin.getEmail(),
                        "role", admin.getRole()
                )
        ));
    }
}