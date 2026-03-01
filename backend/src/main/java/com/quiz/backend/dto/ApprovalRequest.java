package com.quiz.backend.dto;

public class ApprovalRequest {
    private String type; // "content" or "schedule"

    public ApprovalRequest() {}

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}