package com.quiz.backend.repo;

import com.quiz.backend.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findByQuizIdOrderByCreatedAtAsc(String quizId);
    long countByQuizId(String quizId);
}