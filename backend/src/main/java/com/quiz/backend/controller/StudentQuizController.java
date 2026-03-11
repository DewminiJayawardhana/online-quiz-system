package com.quiz.backend.controller;

import com.quiz.backend.model.Question;
import com.quiz.backend.model.Quiz;
import com.quiz.backend.model.QuizResult;
import com.quiz.backend.repo.QuestionRepository;
import com.quiz.backend.repo.QuizRepository;
import com.quiz.backend.repo.QuizResultRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student/quizzes")
@CrossOrigin
public class StudentQuizController {

    private final QuizRepository quizRepo;
    private final QuestionRepository questionRepo;

    @Autowired
    private QuizResultRepository quizResultRepo;

    public StudentQuizController(QuizRepository quizRepo, QuestionRepository questionRepo) {
        this.quizRepo = quizRepo;
        this.questionRepo = questionRepo;
    }

    // GET PUBLISHED QUIZZES
  
    @GetMapping
    public List<Map<String, Object>> listPublished(@RequestParam String category) {

        List<Quiz> quizzes =
                quizRepo.findByStatusAndCategoryOrderByCreatedAtDesc(
                        Quiz.Status.PUBLISHED,
                        category
                );

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


 
    // GET QUIZ QUESTIONS FOR STUDENT
 
    @GetMapping("/{quizId}")
    public ResponseEntity<?> getQuizForStudent(@PathVariable String quizId) {

        Quiz quiz = quizRepo.findById(quizId).orElse(null);

        if (quiz == null)
            return ResponseEntity.status(404).body(Map.of("message", "Quiz not found"));

        if (quiz.getStatus() != Quiz.Status.PUBLISHED)
            return ResponseEntity.status(403).body(Map.of("message", "Quiz is not published"));

        List<Question> questions =
                questionRepo.findByQuizIdOrderByCreatedAtAsc(quizId);

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

            List<Map<String, Object>> opts = new ArrayList<>();

            List<?> rawOptions = q.getOptions() == null ? List.of() : q.getOptions();

            for (Object o : rawOptions) {

                if (o instanceof String s) {
                    opts.add(Map.of("text", s));
                    continue;
                }

                if (o instanceof Map<?, ?> m) {
                    Object text = m.get("text");
                    if (text != null)
                        opts.add(Map.of("text", text.toString()));
                    continue;
                }

                try {

                    var method = o.getClass().getMethod("getText");
                    Object text = method.invoke(o);

                    if (text != null)
                        opts.add(Map.of("text", text.toString()));

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


    // SUBMIT QUIZ
   
    @PostMapping("/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(

            @PathVariable String quizId,
            @RequestBody Map<String, String> studentAnswers,
            @RequestParam String email,
            @RequestParam String name

    ) {

        Quiz quiz = quizRepo.findById(quizId).orElse(null);

        if (quiz == null)
            return ResponseEntity.status(404).body(Map.of("message", "Quiz not found"));

        List<Question> questions =
                questionRepo.findByQuizIdOrderByCreatedAtAsc(quizId);

        int score = 0;
        int correctCount = 0;
        int totalMarks = 0;

        Map<String, String> correctAnswersMap = new HashMap<>();

        for (Question q : questions) {

            totalMarks += q.getMarks();

            String correctText = "";

            if (q.getOptions() != null) {

                for (Object optObj : q.getOptions()) {

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

        boolean passed = score >= quiz.getPassingMark();

        // SAVE RESULT
        QuizResult result = new QuizResult();

        result.setStudentEmail(email);
        result.setStudentName(name);
        result.setQuizId(quizId);
        result.setQuizNo(quiz.getQuizNo());
        result.setCategory(quiz.getCategory());
        result.setScore(score);
        result.setTotal(totalMarks);
        result.setPassed(passed);
        result.setSubmittedAt(LocalDateTime.now());

        quizResultRepo.save(result);

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("score", score);
        response.put("total", totalMarks);
        response.put("correctCount", correctCount);
        response.put("passed", passed);
        response.put("correctMap", correctAnswersMap);
        response.put("resultId", result.getId());

        return ResponseEntity.ok(response);
    }

    
    // ADMIN - STUDENT PROFILES
  
    @GetMapping("/admin-profiles")
    public ResponseEntity<?> getAllStudentProfiles() {

        List<QuizResult> allResults = quizResultRepo.findAll();

        Map<String, List<QuizResult>> groupedByStudent =
                allResults.stream()
                        .collect(Collectors.groupingBy(QuizResult::getStudentEmail));

        List<Map<String, Object>> profileList = new ArrayList<>();

        for (Map.Entry<String, List<QuizResult>> entry : groupedByStudent.entrySet()) {

            Map<String, Object> profile = new LinkedHashMap<>();

            String email = entry.getKey();
            List<QuizResult> results = entry.getValue();

            String name =
                    results.isEmpty() ? "Unknown" : results.get(0).getStudentName();

            profile.put("name", name);
            profile.put("email", email);

            List<Map<String, Object>> quizDetails =
                    results.stream().map(r -> {

                        Map<String, Object> rd = new LinkedHashMap<>();

                        rd.put("quizNo", r.getQuizNo());
                        rd.put("score", r.getScore());
                        rd.put("total", r.getTotal());
                        rd.put("passed", r.isPassed());

                        return rd;

                    }).collect(Collectors.toList());

            profile.put("quizResults", quizDetails);

            profileList.add(profile);
        }

        return ResponseEntity.ok(profileList);
    }
}