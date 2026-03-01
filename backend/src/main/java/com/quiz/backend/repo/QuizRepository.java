package com.quiz.backend.repo;

import com.quiz.backend.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface QuizRepository extends MongoRepository<Quiz, String> {
    Optional<Quiz> findByQuizNo(String quizNo);

    List<Quiz> findByStatusAndCategoryOrderByCreatedAtDesc(Quiz.Status status, String category);
    List<Quiz> findByStatusOrderByCreatedAtDesc(Quiz.Status status);
}

/*package com.quiz.backend.repo;

import com.quiz.backend.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface QuizRepository extends MongoRepository<Quiz, String> {
    Optional<Quiz> findByQuizNo(String quizNo);
    List<Quiz> findByStatusAndCategoryOrderByCreatedAtDesc(Quiz.Status status, String category);
    List<Quiz> findByStatusOrderByCreatedAtDesc(Quiz.Status status);
}*/