package com.quiz.backend.controller;

import com.quiz.backend.dto.CreateQuizRequest;
import com.quiz.backend.dto.UpdateScheduledQuizRequest;
import com.quiz.backend.model.Quiz;
import com.quiz.backend.repo.QuizRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin
public class QuizController {

    private final QuizRepository repo;

    public QuizController(QuizRepository repo) {
        this.repo = repo;
    }

    // ✅ Schedule admin creates quiz (status = SCHEDULED)
    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateQuizRequest req,
                                    @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {

        if (req == null || req.quizNo == null || req.category == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "quizNo and category are required"));
        }
        if (repo.findByQuizNo(req.quizNo).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "Quiz number already exists"));
        }

        Quiz q = new Quiz();
        q.setQuizNo(req.quizNo);
        q.setCategory(req.category);
        q.setTimeLimitMinutes(req.timeLimitMinutes);
        q.setNoOfQuestions(req.noOfQuestions);
        q.setTotalMarks(req.totalMarks);
        q.setPassingMark(req.passingMark);
        q.setStartAt(req.startAt != null ? Instant.parse(req.startAt) : null);
        q.setEndAt(req.endAt != null ? Instant.parse(req.endAt) : null);
        q.setStatus(Quiz.Status.SCHEDULED);
        q.setCreatedByEmail(adminEmail);
        q.setUpdatedAt(Instant.now());

        return ResponseEntity.ok(repo.save(q));
    }

    // ✅ list scheduled quizzes by category (for your category buttons)
    @GetMapping("/scheduled")
    public List<Quiz> scheduledByCategory(@RequestParam String category) {
        return repo.findByStatusAndCategoryOrderByCreatedAtDesc(Quiz.Status.SCHEDULED, category);
    }

    // ✅ get quiz details
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable String id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(Map.of("message", "Quiz not found")));
    }

    // ✅ schedule admin edit details (but NOT quizNo/category)
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateScheduled(@PathVariable String id, @RequestBody UpdateScheduledQuizRequest req) {
        Quiz q = repo.findById(id).orElse(null);
        if (q == null) return ResponseEntity.status(404).body(Map.of("message", "Quiz not found"));
        if (q.getStatus() != Quiz.Status.SCHEDULED) {
            return ResponseEntity.status(400).body(Map.of("message", "Only scheduled quizzes can be edited here"));
        }

        if (req.timeLimitMinutes != null) q.setTimeLimitMinutes(req.timeLimitMinutes);
        if (req.noOfQuestions != null) q.setNoOfQuestions(req.noOfQuestions);
        if (req.totalMarks != null) q.setTotalMarks(req.totalMarks);
        if (req.passingMark != null) q.setPassingMark(req.passingMark);
        if (req.startAt != null) q.setStartAt(Instant.parse(req.startAt));
        if (req.endAt != null) q.setEndAt(Instant.parse(req.endAt));

        q.setUpdatedAt(Instant.now());
        return ResponseEntity.ok(repo.save(q));
    }

    // ✅ quiz admin clicks "Add Questions" -> move to DRAFT
    @PostMapping("/{id}/move-to-draft")
    public ResponseEntity<?> moveToDraft(@PathVariable String id) {
        Quiz q = repo.findById(id).orElse(null);
        if (q == null) return ResponseEntity.status(404).body(Map.of("message", "Quiz not found"));
        if (q.getStatus() != Quiz.Status.SCHEDULED) {
            return ResponseEntity.status(400).body(Map.of("message", "Only scheduled quizzes can move to draft"));
        }
        q.setStatus(Quiz.Status.DRAFT);
        q.setUpdatedAt(Instant.now());
        return ResponseEntity.ok(repo.save(q));
    }
}