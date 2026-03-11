package com.quiz.backend.dto;

public class QuizResultDTO {
    private String quizNo;
    private String category;
    private int score;
    private int total;
    private boolean passed;

    public QuizResultDTO() {}

    public QuizResultDTO(String quizNo, String category, int score, int total, boolean passed) {
        this.quizNo = quizNo;
        this.category = category;
        this.score = score;
        this.total = total;
        this.passed = passed;
    }

    // Getters and Setters
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
}
