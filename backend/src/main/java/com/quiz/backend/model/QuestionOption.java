package com.quiz.backend.model;

public class QuestionOption {

    private String text;
    private boolean correct;

    public QuestionOption() {}

    public QuestionOption(String text, boolean correct) {
        this.text = text;
        this.correct = correct;
    }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
}