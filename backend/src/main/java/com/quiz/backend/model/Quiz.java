package com.quiz.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("quizzes")
public class Quiz {

    public enum Status {
        SCHEDULED,
        DRAFT,
        READY
    }

    @Id
    private String id;

    @Indexed(unique = true)
    private String quizNo;

    private String category;

    private Integer timeLimitMinutes;
    private Integer noOfQuestions;
    private Integer totalMarks;
    private Integer passingMark;

    private Instant startAt;
    private Instant endAt;

    private Status status = Status.SCHEDULED;

    // ✅ approvals
    private boolean contentCompleted = false; // quiz admin tick
    private boolean scheduleVerified = false; // schedule admin tick

    private String createdByEmail;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public Quiz() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getQuizNo() { return quizNo; }
    public void setQuizNo(String quizNo) { this.quizNo = quizNo; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }

    public Integer getNoOfQuestions() { return noOfQuestions; }
    public void setNoOfQuestions(Integer noOfQuestions) { this.noOfQuestions = noOfQuestions; }

    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }

    public Integer getPassingMark() { return passingMark; }
    public void setPassingMark(Integer passingMark) { this.passingMark = passingMark; }

    public Instant getStartAt() { return startAt; }
    public void setStartAt(Instant startAt) { this.startAt = startAt; }

    public Instant getEndAt() { return endAt; }
    public void setEndAt(Instant endAt) { this.endAt = endAt; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public boolean isContentCompleted() { return contentCompleted; }
    public void setContentCompleted(boolean contentCompleted) { this.contentCompleted = contentCompleted; }

    public boolean isScheduleVerified() { return scheduleVerified; }
    public void setScheduleVerified(boolean scheduleVerified) { this.scheduleVerified = scheduleVerified; }

    public String getCreatedByEmail() { return createdByEmail; }
    public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}


/*package com.quiz.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("quizzes")
public class Quiz {

    public enum Status { SCHEDULED, DRAFT, READY }

    @Id
    private String id;

    @Indexed(unique = true)
    private String quizNo;

    private String category;

    private Integer timeLimitMinutes;  // 10..120
    private Integer noOfQuestions;
    private Integer totalMarks;
    private Integer passingMark;

    private Instant startAt;
    private Instant endAt;

    private Status status = Status.SCHEDULED;

    // audit
    private String createdByEmail;  // schedule admin email
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    // getters/setters ...
    public String getId() { return id; }
    public String getQuizNo() { return quizNo; }
    public String getCategory() { return category; }
    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public Integer getNoOfQuestions() { return noOfQuestions; }
    public Integer getTotalMarks() { return totalMarks; }
    public Integer getPassingMark() { return passingMark; }
    public Instant getStartAt() { return startAt; }
    public Instant getEndAt() { return endAt; }
    public Status getStatus() { return status; }
    public String getCreatedByEmail() { return createdByEmail; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setId(String id) { this.id = id; }
    public void setQuizNo(String quizNo) { this.quizNo = quizNo; }
    public void setCategory(String category) { this.category = category; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }
    public void setNoOfQuestions(Integer noOfQuestions) { this.noOfQuestions = noOfQuestions; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public void setPassingMark(Integer passingMark) { this.passingMark = passingMark; }
    public void setStartAt(Instant startAt) { this.startAt = startAt; }
    public void setEndAt(Instant endAt) { this.endAt = endAt; }
    public void setStatus(Status status) { this.status = status; }
    public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}*/