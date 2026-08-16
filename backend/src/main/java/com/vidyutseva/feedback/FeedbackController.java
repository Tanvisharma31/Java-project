package com.vidyutseva.feedback;

import com.vidyutseva.common.ApiResponse;
import com.vidyutseva.entity.FeedbackEntity;
import com.vidyutseva.entity.FeedbackEntity.FeedbackStatus;
import com.vidyutseva.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/feedback")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class FeedbackController {
    
    @Autowired
    private FeedbackRepository feedbackRepository;
    
    // Customer submit feedback
    @PostMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse> submitFeedback(@RequestBody Map<String, Object> feedbackData) {
        try {
            String consumerId = (String) feedbackData.get("consumerId");
            String type = (String) feedbackData.get("type");
            String category = (String) feedbackData.get("category");
            String subject = (String) feedbackData.get("subject");
            String details = (String) feedbackData.get("details");
            Integer rating = ((Number) feedbackData.get("rating")).intValue();
            String contactInfo = (String) feedbackData.get("contactInfo");
            
            // Generate feedback number
            String feedbackNumber = "FB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            
            FeedbackEntity feedback = new FeedbackEntity();
            feedback.setFeedbackNumber(feedbackNumber);
            feedback.setConsumerId(consumerId);
            feedback.setType(type);
            feedback.setCategory(category);
            feedback.setSubject(subject);
            feedback.setDetails(details);
            feedback.setRating(rating);
            feedback.setContactInfo(contactInfo);
            feedback.setStatus(FeedbackStatus.SUBMITTED);
            
            FeedbackEntity savedFeedback = feedbackRepository.save(feedback);
            
            Map<String, Object> data = new HashMap<>();
            data.put("feedbackId", savedFeedback.getFeedbackId());
            data.put("feedbackNumber", savedFeedback.getFeedbackNumber());
            data.put("status", savedFeedback.getStatus());
            
            return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", data));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error submitting feedback: " + e.getMessage()));
        }
    }
    
    // Customer view their feedback
    @GetMapping("/customer/{consumerId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse> getCustomerFeedback(@PathVariable String consumerId) {
        try {
            List<FeedbackEntity> feedbacks = feedbackRepository.findByConsumerId(consumerId);
            return ResponseEntity.ok(ApiResponse.success("Feedback retrieved successfully", feedbacks));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error retrieving feedback: " + e.getMessage()));
        }
    }
    
    // Admin view all feedback
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAllFeedback() {
        try {
            List<FeedbackEntity> feedbacks = feedbackRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(ApiResponse.success("All feedback retrieved successfully", feedbacks));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error retrieving feedback: " + e.getMessage()));
        }
    }
    
    // Admin respond to feedback
    @PostMapping("/admin/respond/{feedbackId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> respondToFeedback(@PathVariable Long feedbackId, @RequestBody Map<String, String> responseData) {
        try {
            FeedbackEntity feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
            
            String adminResponse = responseData.get("adminResponse");
            feedback.setAdminResponse(adminResponse);
            feedback.setStatus(FeedbackStatus.RESOLVED);
            feedback.setRespondedAt(LocalDateTime.now());
            
            FeedbackEntity updatedFeedback = feedbackRepository.save(feedback);
            
            return ResponseEntity.ok(ApiResponse.success("Response submitted successfully", updatedFeedback));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error submitting response: " + e.getMessage()));
        }
    }
    
    // Admin filter feedback by status
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getFeedbackByStatus(@PathVariable FeedbackStatus status) {
        try {
            List<FeedbackEntity> feedbacks = feedbackRepository.findByStatusOrderByCreatedAtDesc(status);
            return ResponseEntity.ok(ApiResponse.success("Feedback retrieved successfully", feedbacks));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error retrieving feedback: " + e.getMessage()));
        }
    }
}