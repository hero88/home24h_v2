package com.devcamp.home24h.Request;

import com.devcamp.home24h.model.ESecretQuestion;

public class ForgotPasswordRequest {
    private String username;

    private ESecretQuestion  secretQuestion;

    private String secretAnswer;

    public ForgotPasswordRequest() {
    }

    public ForgotPasswordRequest(String username, ESecretQuestion  secretQuestion, String secretAnswer) {
        this.username = username;
        this.secretQuestion = secretQuestion;
        this.secretAnswer = secretAnswer;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String email) {
        this.username = email;
    }

    public ESecretQuestion  getSecretQuestion() {
        return secretQuestion;
    }

    public void setSecretQuestion(ESecretQuestion  secretQuestion) {
        this.secretQuestion = secretQuestion;
    }

    public String getSecretAnswer() {
        return secretAnswer;
    }

    public void setSecretAnswer(String secretAnswer) {
        this.secretAnswer = secretAnswer;
    }

    
    
}
