package com.quiz.backend.dto;

import com.quiz.backend.model.QuestionOption;

import java.util.List;

public class UpdateQuestionRequest {
    private String text;
    private List<QuestionOption> options;
    private Integer marks;

    public UpdateQuestionRequest() {}

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public List<QuestionOption> getOptions() { return options; }
    public void setOptions(List<QuestionOption> options) { this.options = options; }

    public Integer getMarks() { return marks; }
    public void setMarks(Integer marks) { this.marks = marks; }
}