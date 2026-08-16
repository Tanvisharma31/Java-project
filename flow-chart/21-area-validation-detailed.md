# 21 - Area Validation Detailed Flowchart

```mermaid
flowchart TD
    StartAreaValidation([Staff Attempts Operation]) --> GetStaffProfile["GET staff profile from JWT token"]

    GetStaffProfile --> ExtractStaffArea["Extract staff.assigned_area from database"]
    ExtractStaffArea --> CheckStaffActive{"Staff Status = ACTIVE?"}
    CheckStaffActive -->|No| ErrStaffInactive["403 Forbidden: Staff account is inactive. Contact admin."]
    ErrStaffInactive --> EndAreaValidation

    CheckStaffActive -->|Yes| GetTargetConsumerID["Get target Consumer ID from request"]

    GetTargetConsumerID --> FetchCustomerArea["SELECT customer.area FROM customers WHERE consumer_id = X"]
    FetchCustomerArea --> CustomerExists{"Customer Exists?"}
    CustomerExists -->|No| ErrCustomerNotFound["404 Not Found: Consumer ID not found"]
    ErrCustomerNotFound --> EndAreaValidation

    CustomerExists -->|Yes| CheckCustomerActive{"Customer Status = ACTIVE?"}
    CheckCustomerActive -->|No| ErrCustomerInactive["403 Forbidden: Customer account is inactive"]
    ErrCustomerInactive --> EndAreaValidation

    CheckCustomerActive -->|Yes| CompareAreas{"staff.assigned_area == customer.area?"}

    CompareAreas -->|Match| AreaMatchSuccess["Area validation passed"]
    CompareAreas -->|Mismatch| AreaMismatchFailure["Area validation failed"]

    AreaMatchSuccess --> AllowOperation["Allow staff to proceed with operation"]
    AllowOperation --> LogAreaAccessSuccess["Log successful area access in audit_logs"]
    LogAreaAccessSuccess --> EndAreaValidation

    AreaMismatchFailure --> LogAreaAccessFailure["Log failed area access attempt in audit_logs"]
    LogAreaAccessFailure --> GenerateAreaMismatchAlert["Generate security alert for repeated area mismatch attempts"]
    GenerateAreaMismatchAlert --> CheckAttemptCount{"Area mismatch attempts > 5?"}
    CheckAttemptCount -->|Yes| FlagSuspiciousActivity["Flag staff account for suspicious activity (notify admin)"]
    CheckAttemptCount -->|No| DisplayAreaMismatchError

    FlagSuspiciousActivity --> NotifyAdminSecurity["Send security notification to admin: 'Staff X attempting unauthorized area access'"]
    NotifyAdminSecurity --> DisplayAreaMismatchError["Display Error: 'Access Denied. Customer belongs to Area {customer_area}. You are assigned to Area {staff_area}.'"]

    DisplayAreaMismatchError --> EndAreaValidation

    %% Area Hierarchy Support (Optional Enhancement)
    EndAreaValidation --> CheckAreaHierarchy{"Area Hierarchy Enabled?"}
    CheckAreaHierarchy -->|Yes| ValidateParentArea{"Validate if staff_area is parent of customer_area"}
    CheckAreaHierarchy -->|No| EndValidation

    ValidateParentArea --> ParentAreaMatch{"staff_area is parent/ancestor of customer_area?"}
    ParentAreaMatch -->|Yes| AllowOperation
    ParentAreaMatch -->|No| DisplayAreaMismatchError

    EndValidation --> [*]
```
