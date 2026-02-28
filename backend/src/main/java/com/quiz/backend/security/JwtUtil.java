package com.quiz.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    private final byte[] keyBytes;
    private final int expMinutes;

    public JwtUtil(@Value("${app.jwt.secret}") String secret,
                   @Value("${app.jwt.expMinutes}") int expMinutes) {
        this.keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.expMinutes = expMinutes;
    }

    public String createToken(String adminId, String email, String role) {
        long now = System.currentTimeMillis();
        long exp = now + (long) expMinutes * 60 * 1000;

        return Jwts.builder()
                .setSubject(adminId)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(exp))
                .addClaims(Map.of("email", email, "role", role))
                .signWith(Keys.hmacShaKeyFor(keyBytes), SignatureAlgorithm.HS256)
                .compact();
    }
}