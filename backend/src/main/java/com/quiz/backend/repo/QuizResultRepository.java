package com.quiz.backend.repo;

import com.quiz.backend.model.QuizResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface QuizResultRepository extends MongoRepository<QuizResult, String> {
    
    List<QuizResult> findByStudentEmail(String email);
}
