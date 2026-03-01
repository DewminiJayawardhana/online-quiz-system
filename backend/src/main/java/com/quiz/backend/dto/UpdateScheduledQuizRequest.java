package com.quiz.backend.dto;

public class UpdateScheduledQuizRequest {
    public Integer timeLimitMinutes;
    public Integer noOfQuestions;
    public Integer totalMarks;
    public Integer passingMark;
    public String startAt;
    public String endAt;
}