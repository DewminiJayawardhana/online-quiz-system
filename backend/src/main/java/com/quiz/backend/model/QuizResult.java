package com.quiz.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "quiz_results")
public class QuizResult {
    @Id
    private String id;
    private String studentEmail;
    private String studentName;
    private String quizId;
    private String quizNo;
    private String category;
    private int score;
    private int total;
    private boolean passed;
    private LocalDateTime submittedAt;

    // Constructors
    public QuizResult() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getQuizId() { return quizId; }
    public void setQuizId(String quizId) { this.quizId = quizId; }

    public String getQuizNo() { return quizNo; }
    public void setQuizNo(String quizNo) { this.quizNo = quizNo; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}

