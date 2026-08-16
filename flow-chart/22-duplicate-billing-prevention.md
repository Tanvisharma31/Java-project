# 22 - Duplicate Billing Cycle Prevention Flowchart

```mermaid
flowchart TD
    StartDupPrevention([Staff Submits Meter Reading]) --> ExtractBillingPeriod["Extract billing period from reading date"]

    ExtractBillingPeriod --> DefineBillingCycle["Define billing cycle (e.g., Monthly: YYYY-MM)"]
    DefineBillingCycle --> CheckExistingBill["SELECT * FROM bills WHERE consumer_id = X AND billing_period = 'YYYY-MM'"]

    CheckExistingBill --> BillExists{"Bill Already Exists for this Period?"}
    BillExists -->|Yes| PreventDuplicate["Prevent duplicate bill generation"]
    BillExists -->|No| ProceedWithBilling["Proceed with bill generation"]

    PreventDuplicate --> FetchExistingBillDetails["Fetch existing bill details"]
    FetchExistingBillDetails --> CheckBillStatus{"Existing Bill Status?"}
    CheckBillStatus -->|PAID| ErrAlreadyPaid["Error: Bill for this billing period already paid. Cannot generate duplicate bill."]
    CheckBillStatus -->|PENDING| ErrAlreadyPending["Error: Bill for this billing period already generated and pending. Cannot generate duplicate."]
    CheckBillStatus -->|OVERDUE| ErrAlreadyOverdue["Error: Bill for this billing period already generated and overdue. Cannot generate duplicate."]

    ErrAlreadyPaid --> DisplayDuplicateError["Display Error: 'Bill for {billing_period} already generated and paid. View existing bill in billing history.'"]
    ErrAlreadyPending --> DisplayDuplicateError
    ErrAlreadyOverdue --> DisplayDuplicateError

    DisplayDuplicateError --> OfferViewExisting["Option: View existing bill details"]
    OfferViewExisting --> NavigateToBillHistory["Navigate to /customer/bills or /admin/bills"]

    ProceedWithBilling --> ValidateReadingDate{"Reading Date within Valid Range?"}
    ValidateReadingDate -->|No| ErrInvalidDate["Error: Reading date must be within current billing cycle"]
    ErrInvalidDate --> EndDupPrevention

    ValidateReadingDate -->|Yes| CheckReadingLock{"Meter Reading Locked for this Period?"}
    CheckReadingLock -->|Yes| ErrReadingLocked["Error: Meter reading for this billing period is locked. Contact admin to unlock."]
    ErrReadingLocked --> EndDupPrevention

    CheckReadingLock -->|No| GenerateNewBill["Generate new bill for billing period"]
    GenerateNewBill --> SetBillingPeriodLock["Set meter_reading_locked = true for this consumer and billing period"]
    SetBillingPeriodLock --> CreateBillRecord["INSERT bill record with unique constraint (consumer_id, billing_period)"]

    CreateBillRecord --> DBConstraintCheck{"Database Unique Constraint Check"}
    DBConstraintCheck -->|Constraint Violation| HandleRaceCondition["Handle race condition (another process generated bill simultaneously)"]
    DBConstraintCheck -->|Success| BillCreatedSuccessfully["Bill created successfully"]

    HandleRaceCondition --> RollbackTransaction["Rollback transaction"]
    RollbackTransaction --> FetchLatestBill["Fetch latest bill for this consumer"]
    FetchLatestBill --> DisplayLatestBillInfo["Display existing bill information to staff"]
    DisplayLatestBillInfo --> EndDupPrevention

    BillCreatedSuccessfully --> CommitTransaction["Commit transaction"]
    CommitTransaction --> LogBillGeneration["Log bill generation in audit_logs"]
    LogBillGeneration --> TriggerBillNotification["Trigger bill notification to customer"]
    TriggerBillNotification --> EndDupPrevention

    %% Admin Override Capability
    EndDupPrevention --> CheckAdminOverride{"Admin Override Requested?"}
    CheckAdminOverride -->|Yes| AdminAuthCheck{"Admin Authorization Check"}
    CheckAdminOverride -->|No| EndProcess

    AdminAuthCheck -->|Unauthorized| ErrAdminUnauthorized["403 Forbidden: Admin authorization required for override"]
    ErrAdminUnauthorized --> EndProcess

    AdminAuthCheck -->|Authorized| RequestOverrideReason["Request override reason from admin"]
    RequestOverrideReason --> InputOverrideReason["Admin enters reason for override (min 20 chars)"]
    InputOverrideReason --> ValOverrideReason{"Validate Override Reason"}
    ValOverrideReason -->|Invalid| ErrOverrideReason["Error: Override reason must be at least 20 characters"]
    ErrOverrideReason --> RequestOverrideReason

    ValOverrideReason -->|Valid| UnlockBillingPeriod["UPDATE meter_reading_locked = false for this consumer and billing period"]
    UnlockBillingPeriod --> LogOverride["Log override in audit_logs with admin ID and reason"]
    LogOverride --> AllowRegenerateBill["Allow bill regeneration"]
    AllowRegenerateBill --> ProceedWithBilling

    EndProcess --> [*]
```
