# 19 - State Machine Diagrams

## Bill State Machine

```mermaid
stateDiagram-v2
    [*] --> GENERATED: Meter Reading Submitted
    GENERATED --> PENDING: Bill Created & Due Date Set
    PENDING --> OVERDUE: Due Date Passed (> 15 days)
    PENDING --> PAID: Payment Successful
    OVERDUE --> LATE_FEE_APPLIED: Late Fee Calculated
    OVERDUE --> PAID: Payment Successful (with late fee)
    LATE_FEE_APPLIED --> PAID: Payment Successful
    PAID --> [*]: Payment Complete
    PENDING --> CANCELLED: Bill Disputed/Cancelled
    OVERDUE --> CANCELLED: Bill Disputed/Cancelled
    LATE_FEE_APPLIED --> CANCELLED: Bill Disputed/Cancelled
```

## Payment State Machine

```mermaid
stateDiagram-v2
    [*] --> INITIATED: User Clicks Pay
    INITIATED --> VALIDATING: Form Validation Passed
    VALIDATING --> PROCESSING: Amount Verified
    VALIDATING --> FAILED: Amount Mismatch
    PROCESSING --> SUCCESS: Payment Gateway Approved
    PROCESSING --> FAILED: Payment Gateway Rejected
    PROCESSING --> TIMEOUT: Gateway Timeout
    FAILED --> RETRY: User Clicks Retry
    TIMEOUT --> RETRY: User Clicks Retry
    RETRY --> INITIATED: Retry Payment
    SUCCESS --> COMPLETED: Receipt Generated
    COMPLETED --> [*]: Transaction Complete
    FAILED --> [*]: Max Retries Exceeded
    TIMEOUT --> [*]: Max Retries Exceeded
```

## Complaint State Machine

```mermaid
stateDiagram-v2
    [*] --> OPEN: Complaint Registered
    OPEN --> ASSIGNED: Staff Assigned
    OPEN --> REJECTED: Invalid Complaint
    ASSIGNED --> IN_PROGRESS: Staff Starts Work
    IN_PROGRESS --> RESOLVED: Issue Fixed
    IN_PROGRESS --> REJECTED: Cannot Resolve
    RESOLVED --> CLOSED: Customer Acknowledged
    REJECTED --> CLOSED: Customer Acknowledged
    CLOSED --> [*]: Complaint Complete
    OPEN --> CLOSED: Customer Withdraws
    IN_PROGRESS --> OPEN: Reassigned
```

## Service Request State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: Request Submitted
    PENDING --> UNDER_REVIEW: Admin Review Started
    UNDER_REVIEW --> APPROVED: Admin Approves
    UNDER_REVIEW --> REJECTED: Admin Rejects
    APPROVED --> COMPLETED: Changes Applied
    REJECTED --> [*]: Request Closed
    COMPLETED --> [*]: Request Complete
    PENDING --> CANCELLED: Customer Cancels
    UNDER_REVIEW --> CANCELLED: Customer Cancels
    CANCELLED --> [*]: Request Closed
```

## Customer State Machine

```mermaid
stateDiagram-v2
    [*] --> ACTIVE: Registration Successful
    ACTIVE --> INACTIVE: Self-Deactivation
    ACTIVE --> INACTIVE: Admin Deactivation
    ACTIVE --> SUSPENDED: Non-Payment (> 30 days)
    INACTIVE --> ACTIVE: Reactivation Request
    SUSPENDED --> ACTIVE: Payment Settled
    SUSPENDED --> INACTIVE: Service Disconnected
    INACTIVE --> [*]: Account Closed
```

## Notification State Machine

```mermaid
stateDiagram-v2
    [*] --> UNREAD: Notification Created
    UNREAD --> READ: User Opens Notification
    READ --> [*]: Notification Archived
    UNREAD --> [*]: Auto-Archive (30 days)
    READ --> [*]: Auto-Archive (30 days)
```

## Meter Reading State Machine

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED: Staff Enters Reading
    SUBMITTED --> VALIDATING: Area & Range Validation
    VALIDATING --> APPROVED: All Validations Passed
    VALIDATING --> REJECTED: Validation Failed
    APPROVED --> BILLED: Bill Generated
    REJECTED --> [*]: Reading Discarded
    BILLED --> [*]: Process Complete
```

## Tariff State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT: New Tariff Created
    DRAFT --> ACTIVE: Admin Activates
    ACTIVE --> INACTIVE: Admin Deactivates
    ACTIVE --> SUPERSEDED: New Tariff Activated
    INACTIVE --> ACTIVE: Admin Reactivates
    SUPERSEDED --> [*]: Historical Record
    INACTIVE --> [*]: Deleted
```
