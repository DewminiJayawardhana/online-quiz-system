package com.quiz.backend.controller;

import com.quiz.backend.model.Question;
import com.quiz.backend.model.Quiz;
import com.quiz.backend.repo.QuestionRepository;
import com.quiz.backend.repo.QuizRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student/quizzes")
@CrossOrigin
public class StudentQuizController {

    private final QuizRepository quizRepo;
    private final QuestionRepository questionRepo;

    public StudentQuizController(QuizRepository quizRepo, QuestionRepository questionRepo) {
        this.quizRepo = quizRepo;
        this.questionRepo = questionRepo;
    }

    @GetMapping
    public List<Map<String, Object>> listPublished(@RequestParam String category) {
        List<Quiz> quizzes = quizRepo.findByStatusAndCategoryOrderByCreatedAtDesc(Quiz.Status.PUBLISHED, category);

        return quizzes.stream().map(q -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", q.getId());
            m.put("quizNo", q.getQuizNo());
            m.put("category", q.getCategory());
            m.put("timeLimitMinutes", q.getTimeLimitMinutes());
            m.put("noOfQuestions", q.getNoOfQuestions());
            m.put("totalMarks", q.getTotalMarks());
            m.put("passingMark", q.getPassingMark());
            m.put("startAt", q.getStartAt());
            m.put("endAt", q.getEndAt());
            m.put("publishedAt", q.getPublishedAt());
            return m;
        }).collect(Collectors.toList());
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<?> getQuizForStudent(@PathVariable String quizId) {
        Quiz quiz = quizRepo.findById(quizId).orElse(null);
        if (quiz == null) return ResponseEntity.status(404).body(Map.of("message", "Quiz not found"));

        if (quiz.getStatus() != Quiz.Status.PUBLISHED) {
            return ResponseEntity.status(403).body(Map.of("message", "Quiz is not published"));
        }

        List<Question> questions = questionRepo.findByQuizIdOrderByCreatedAtAsc(quizId);

        Map<String, Object> out = new LinkedHashMap<>();

        Map<String, Object> quizMap = new LinkedHashMap<>();
        quizMap.put("id", quiz.getId());
        quizMap.put("quizNo", quiz.getQuizNo());
        quizMap.put("category", quiz.getCategory());
        quizMap.put("timeLimitMinutes", quiz.getTimeLimitMinutes());
        quizMap.put("noOfQuestions", quiz.getNoOfQuestions());
        quizMap.put("totalMarks", quiz.getTotalMarks());
        quizMap.put("passingMark", quiz.getPassingMark());
        quizMap.put("startAt", quiz.getStartAt());
        quizMap.put("endAt", quiz.getEndAt());

        out.put("quiz", quizMap);

        List<Map<String, Object>> qs = new ArrayList<>();

        for (Question q : questions) {
            Map<String, Object> qm = new LinkedHashMap<>();
            qm.put("id", q.getId());
            qm.put("text", q.getText());
            qm.put("marks", q.getMarks());

            // ✅ options WITHOUT correct answers (works with any option structure)
            List<Map<String, Object>> opts = new ArrayList<>();
            List<?> rawOptions = q.getOptions() == null ? List.of() : q.getOptions();

            for (Object o : rawOptions) {
                if (o instanceof String s) {
                    opts.add(Map.of("text", s));
                    continue;
                }
                if (o instanceof Map<?, ?> m) {
                    Object text = m.get("text");
                    if (text != null) opts.add(Map.of("text", text.toString()));
                    continue;
                }
                try {
                    var method = o.getClass().getMethod("getText");
                    Object text = method.invoke(o);
                    if (text != null) opts.add(Map.of("text", text.toString()));
                } catch (Exception ignored) {
                    opts.add(Map.of("text", o.toString()));
                }
            }

            qm.put("options", opts);
            qs.add(qm);
        }

        out.put("questions", qs);

        return ResponseEntity.ok(out);
    }
    // ... කලින් තිබුණු import සහ code එක ...

@PostMapping("/{quizId}/submit")
public ResponseEntity<?> submitQuiz(@PathVariable String quizId, @RequestBody Map<String, String> studentAnswers) {
    // studentAnswers ලැබෙන්නේ මෙහෙමයි: { "questionId": "තෝරාගත්ත උත්තරයේ Text එක" }

    Quiz quiz = quizRepo.findById(quizId).orElse(null);
    if (quiz == null) return ResponseEntity.status(404).body(Map.of("message", "Quiz not found"));

    List<Question> questions = questionRepo.findByQuizIdOrderByCreatedAtAsc(quizId);
    
    int score = 0;
    int correctCount = 0;
    int totalMarks = 0;

    // ප්‍රශ්නයෙන් ප්‍රශ්නයට ගොස් උත්තර පරීක්ෂා කිරීම
    Map<String, String> correctAnswersMap = new HashMap<>();

    for (Question q : questions) {
        totalMarks += q.getMarks();
        
        // Database එකේ තියෙන නිවැරදි option එකේ Text එක හොයාගන්නවා
        String correctText = "";
        if (q.getOptions() != null) {
            for (Object optObj : q.getOptions()) {
                // මෙතනදී QuestionOption class එකට cast කරලා බලනවා
                if (optObj instanceof com.quiz.backend.model.QuestionOption opt) {
                    if (opt.isCorrect()) {
                        correctText = opt.getText();
                    }
                }
            }
        }
        
        correctAnswersMap.put(q.getId(), correctText);

        String submittedText = studentAnswers.get(q.getId());
        if (submittedText != null && submittedText.equals(correctText)) {
            score += q.getMarks();
            correctCount++;
        }
    }

    // ප්‍රතිඵලය සකස් කිරීම
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("score", score);
    result.put("total", totalMarks);
    result.put("correctCount", correctCount);
    result.put("passed", score >= quiz.getPassingMark());
    result.put("correctMap", correctAnswersMap); // පසුව ශිෂ්‍යයාට නිවැරදි උත්තර පෙන්වීමට

    return ResponseEntity.ok(result);
}
}