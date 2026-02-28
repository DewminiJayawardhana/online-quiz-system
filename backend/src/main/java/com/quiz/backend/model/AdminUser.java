package com.quiz.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("admins")
public class AdminUser {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash; // BCrypt hash
    private String role;         // MAIN_ADMIN / SCHEDULE_ADMIN / QUIZ_ADMIN
    private boolean active = true;

    public AdminUser() {}

    public AdminUser(String email, String passwordHash, String role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.active = true;
    }

    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
    public boolean isActive() { return active; }

    public void setId(String id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setRole(String role) { this.role = role; }
    public void setActive(boolean active) { this.active = active; }
}