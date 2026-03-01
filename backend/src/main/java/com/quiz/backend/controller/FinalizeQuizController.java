package com.quiz.backend.controller;

import com.quiz.backend.model.Question;
import com.quiz.backend.model.Quiz;
import com.quiz.backend.repo.QuestionRepository;
import com.quiz.backend.repo.QuizRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/finalize-quizzes")
@CrossOrigin
public class FinalizeQuizController {

    private final QuizRepository quizRepo;
    private final QuestionRepository questionRepo;

    public FinalizeQuizController(QuizRepository quizRepo, QuestionRepository questionRepo) {
        this.quizRepo = quizRepo;
        this.questionRepo = questionRepo;
    }

    // ✅ List READY (New) quizzes by category
    @GetMapping("/new")
    public List<Quiz> listNew(@RequestParam String category) {
        return quizRepo.findByStatusAndCategoryOrderByCreatedAtDesc(Quiz.Status.READY, category);
    }

    // ✅ List PUBLISHED quizzes by category
    @GetMapping("/published")
    public List<Quiz> listPublished(@RequestParam String category) {
        return quizRepo.findByStatusAndCategoryOrderByCreatedAtDesc(Quiz.Status.PUBLISHED, category);
    }

    // ✅ Get quiz + questions (for print + view)
    @GetMapping("/{quizId}")
    public ResponseEntity<?> getFinalizeDetails(@PathVariable String quizId) {
        Quiz quiz = quizRepo.findById(quizId).orElse(null);
        if (quiz == null) return ResponseEntity.status(404).body(Map.of("message", "Quiz not found"));

        List<Question> questions = questionRepo.findByQuizIdOrderByCreatedAtAsc(quizId);

        Map<String, Object> out = new HashMap<>();
        out.put("quiz", quiz);
        out.put("questions", questions);

        return ResponseEntity.ok(out);
    }

    // ✅ Publish quiz (READY -> PUBLISHED)
    @PostMapping("/{quizId}/publish")
    public ResponseEntity<?> publish(@PathVariable String quizId) {
        Quiz quiz = quizRepo.findById(quizId).orElse(null);
        if (quiz == null) return ResponseEntity.status(404).body(Map.of("message", "Quiz not found"));

        if (quiz.getStatus() != Quiz.Status.READY) {
            return ResponseEntity.status(400).body(Map.of("message", "Only READY quizzes can be published"));
        }

        quiz.setStatus(Quiz.Status.PUBLISHED);
        quiz.setPublishedAt(Instant.now());
        quiz.setUpdatedAt(Instant.now());

        return ResponseEntity.ok(quizRepo.save(quiz));
    }
}