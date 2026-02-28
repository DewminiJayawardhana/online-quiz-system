package com.quiz.backend.seed;

import com.quiz.backend.model.AdminUser;
import com.quiz.backend.repo.AdminUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {

    @Bean
    CommandLineRunner seedAdmins(AdminUserRepository repo, PasswordEncoder encoder) {
        return args -> {
            seed(repo, encoder, "mainadmin@oqs.com", "main@admin123", "MAIN_ADMIN");
            seed(repo, encoder, "sheduleadmin@oqs.com", "shedule@admin123", "SCHEDULE_ADMIN");
            seed(repo, encoder, "quizeadmin@oqs.com", "quize@admin123", "QUIZ_ADMIN");
        };
    }

    private void seed(AdminUserRepository repo, PasswordEncoder encoder, String email, String rawPass, String role) {
        String e = email.trim().toLowerCase();
        if (!repo.existsByEmail(e)) {
            repo.save(new AdminUser(e, encoder.encode(rawPass), role));
        }
    }
}
