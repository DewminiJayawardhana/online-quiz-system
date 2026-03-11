package com.quiz.backend.dto;



import java.util.List;

public class StudentProfileDTO {
    private String name;
    private String email;
    private List<QuizResultDTO> quizResults;

    // Default Constructor
    public StudentProfileDTO() {}

    // All Arguments Constructor
    public StudentProfileDTO(String name, String email, List<QuizResultDTO> quizResults) {
        this.name = name;
        this.email = email;
        this.quizResults = quizResults;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<QuizResultDTO> getQuizResults() {
        return quizResults;
    }

    public void setQuizResults(List<QuizResultDTO> quizResults) {
        this.quizResults = quizResults;
    }
}
