package com.vidyutseva.notification;

import com.vidyutseva.common.ApiResponse;
import com.vidyutseva.entity.*;
import com.vidyutseva.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final CustomerRepository customerRepository;

    // -------------------------------------------------------------------------
    // GET /customer/notifications
    // -------------------------------------------------------------------------
    @GetMapping("/customer/notifications")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<NotificationEntity>>> getNotifications(Authentication auth) {
        CustomerEntity c = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        List<NotificationEntity> list =
                notificationRepository.findByConsumerIdOrderByCreatedAtDesc(c.getConsumerId());
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", list));
    }

    // -------------------------------------------------------------------------
    // PATCH /customer/notifications/{id}/read
    // -------------------------------------------------------------------------
    @PatchMapping("/customer/notifications/{id}/read")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> markAsRead(
            @PathVariable Long id, Authentication auth) {

        CustomerEntity c = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        NotificationEntity n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!n.getConsumerId().equals(c.getConsumerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied"));
        }
        n.setIsRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", "OK"));
    }

    // -------------------------------------------------------------------------
    // GET /customer/notifications/unread-count
    // -------------------------------------------------------------------------
    @GetMapping("/customer/notifications/unread-count")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication auth) {
        CustomerEntity c = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        long count = notificationRepository.countByConsumerIdAndIsRead(c.getConsumerId(), false);
        return ResponseEntity.ok(ApiResponse.success("Unread count", count));
    }
}
