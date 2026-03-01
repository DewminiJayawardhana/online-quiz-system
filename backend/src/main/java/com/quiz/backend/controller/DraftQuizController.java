package com.quiz.backend.controller;

import com.quiz.backend.dto.ApprovalRequest;
import com.quiz.backend.dto.CreateQuestionRequest;
import com.quiz.backend.dto.UpdateQuestionRequest;
import com.quiz.backend.model.Question;
import com.quiz.backend.model.QuestionOption;
import com.quiz.backend.model.Quiz;
import com.quiz.backend.repo.QuestionRepository;
import com.quiz.backend.repo.QuizRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/draft-quizzes")
@CrossOrigin
public class DraftQuizController {

    private final QuizRepository quizRepo;
    private final QuestionRepository questionRepo;

    public DraftQuizController(QuizRepository quizRepo, QuestionRepository questionRepo) {
        this.quizRepo = quizRepo;
        this.questionRepo = questionRepo;
    }

    // ✅ list draft quizzes by category
    @GetMapping
    public List<Quiz> listDraftByCategory(@RequestParam String category) {
        return quizRepo.findByStatusAndCategoryOrderByCreatedAtDesc(Quiz.Status.DRAFT, category);
    }

    // ✅ get draft quiz details
    @GetMapping("/{quizId}")
    public ResponseEntity<?> getDraftQuiz(@PathVariable String quizId) {
        return quizRepo.findById(quizId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(Map.of("message", "Quiz not found")));
    }

    // ✅ get questions for a quiz
    @GetMapping("/{quizId}/questions")
    public ResponseEntity<?> getQuestions(@PathVariable String quizId) {
        if (!quizRepo.existsById(quizId)) {
            return ResponseEntity.status(404).body(Map.of("message", "Quiz not found"));
        }
        return ResponseEntity.ok(questionRepo.findByQuizIdOrderByCreatedAtAsc(quizId));
    }

    // ✅ add question (QUIZ_ADMIN should call from frontend)
    @PostMapping("/{quizId}/questions")
    public ResponseEntity<?> addQuestion(@PathVariable String quizId, @RequestBody CreateQuestionRequest req) {

        Quiz quiz = quizRepo.findById(quizId).orElse(null);
        if (quiz == null) return ResponseEntity.status(404).body(Map.of("message", "Quiz not found"));
        if (quiz.getStatus() != Quiz.Status.DRAFT)
            return ResponseEntity.status(400).body(Map.of("message", "Quiz is not in DRAFT status"));

        long currentCount = questionRepo.countByQuizId(quizId);
        if (quiz.getNoOfQuestions() != null && currentCount >= quiz.getNoOfQuestions()) {
            return ResponseEntity.status(400).body(Map.of("message", "All required questions already added"));
        }

        String msg = validateQuestion(req.getText(), req.getOptions());
        if (msg != null) return ResponseEntity.status(400).body(Map.of("message", msg));

        Question q = new Question();
        q.setQuizId(quizId);
        q.setText(req.getText());
        q.setOptions(req.getOptions());
        q.setMarks(req.getMarks() == null ? 1 : req.getMarks());

        Question saved = questionRepo.save(q);

        // once content changes, reset approvals
        quiz.setContentCompleted(false);
        quiz.setScheduleVerified(false);
        quiz.setUpdatedAt(Instant.now());
        quizRepo.save(quiz);

        return ResponseEntity.ok(saved);
    }

    // ✅ update question (QUIZ_ADMIN)
    @PatchMapping("/questions/{questionId}")
    public ResponseEntity<?> updateQuestion(@PathVariable String questionId, @RequestBody UpdateQuestionRequest req) {

        Question existing = questionRepo.findById(questionId).orElse(null);
        if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "Question not found"));

        String msg = validateQuestion(req.getText(), req.getOptions());
        if (msg != null) return ResponseEntity.status(400).body(Map.of("message", msg));

        existing.setText(req.getText());
        existing.setOptions(req.getOptions());
        existing.setMarks(req.getMarks() == null ? existing.getMarks() : req.getMarks());

        Question saved = questionRepo.save(existing);

        // reset approvals for safety
        Quiz quiz = quizRepo.findById(existing.getQuizId()).orElse(null);
        if (quiz != null) {
            quiz.setContentCompleted(false);
            quiz.setScheduleVerified(false);
            quiz.setUpdatedAt(Instant.now());
            quizRepo.save(quiz);
        }

        return ResponseEntity.ok(saved);
    }

    // ✅ delete question (QUIZ_ADMIN)
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable String questionId) {

        Question existing = questionRepo.findById(questionId).orElse(null);
        if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "Question not found"));

        String quizId = existing.getQuizId();
        questionRepo.deleteById(questionId);

        Quiz quiz = quizRepo.findById(quizId).orElse(null);
        if (quiz != null) {
            quiz.setContentCompleted(false);
            quiz.setScheduleVerified(false);
            quiz.setUpdatedAt(Instant.now());
            quizRepo.save(quiz);
        }

        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    // ✅ approve (both roles call this with type)
    @PostMapping("/{quizId}/approve")
    public ResponseEntity<?> approve(@PathVariable String quizId, @RequestBody ApprovalRequest req) {

        Quiz quiz = quizRepo.findById(quizId).orElse(null);
        if (quiz == null) return ResponseEntity.status(404).body(Map.of("message", "Quiz not found"));
        if (quiz.getStatus() != Quiz.Status.DRAFT)
            return ResponseEntity.status(400).body(Map.of("message", "Quiz is not in DRAFT status"));

        long count = questionRepo.countByQuizId(quizId);
        Integer required = quiz.getNoOfQuestions() == null ? 0 : quiz.getNoOfQuestions();

        if (count != required) {
            return ResponseEntity.status(400).body(Map.of(
                    "message", "You must add exactly " + required + " questions before approvals",
                    "added", count,
                    "required", required
            ));
        }

        if ("content".equalsIgnoreCase(req.getType())) {
            quiz.setContentCompleted(true);
        } else if ("schedule".equalsIgnoreCase(req.getType())) {
            quiz.setScheduleVerified(true);
        } else {
            return ResponseEntity.status(400).body(Map.of("message", "type must be 'content' or 'schedule'"));
        }

        // ✅ Move to READY if both ticked
        if (quiz.isContentCompleted() && quiz.isScheduleVerified()) {
            quiz.setStatus(Quiz.Status.READY);
        }

        quiz.setUpdatedAt(Instant.now());
        return ResponseEntity.ok(quizRepo.save(quiz));
    }

    // ✅ list READY quizzes (Finalized section)
    @GetMapping("/ready")
    public List<Quiz> listReady(@RequestParam(required = false) String category) {
        if (category != null && !category.trim().isEmpty()) {
            return quizRepo.findByStatusAndCategoryOrderByCreatedAtDesc(Quiz.Status.READY, category);
        }
        return quizRepo.findByStatusOrderByCreatedAtDesc(Quiz.Status.READY);
    }

    private String validateQuestion(String text, List<QuestionOption> options) {
        if (text == null || text.trim().isEmpty()) return "Question text is required";
        if (options == null || options.size() < 2) return "At least 2 options required";

        int correctCount = 0;
        for (QuestionOption o : options) {
            if (o == null) return "Invalid option";
            if (o.getText() == null || o.getText().trim().isEmpty()) return "Option text is required";
            if (o.isCorrect()) correctCount++;
        }
        if (correctCount != 1) return "Exactly 1 correct answer must be selected";

        return null;
    }
}