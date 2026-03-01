package com.quiz.backend.dto;

public class CreateQuizRequest {
    public String quizNo;
    public String category;
    public Integer timeLimitMinutes;
    public Integer noOfQuestions;
    public Integer totalMarks;
    public Integer passingMark;
    public String startAt; // ISO string from frontend
    public String endAt;   // ISO string from frontend
}