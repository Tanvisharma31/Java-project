# A4-02 - Customer Module Flow (Simplified for Hand Drawing)

```mermaid
flowchart TD
    CUST_START([Customer Dashboard]) --> VIEW_OPT{Select Option}
    
    VIEW_OPT -->|View Bills| VIEW_BILLS[View Bills]
    VIEW_OPT -->|Pay Bill| PAY_BILL[Pay Bill]
    VIEW_OPT -->|Payment History| PAY_HIST[Payment History]
    VIEW_OPT -->|Raise Complaint| COMPLAINT[Raise Complaint]
    VIEW_OPT -->|Service Request| SERVICE[Service Request]
    VIEW_OPT -->|Profile| PROFILE[Profile]
    VIEW_OPT -->|Notifications| NOTIF[Notifications]
    
    %% View Bills Flow
    VIEW_BILLS --> FETCH_BILLS[Fetch Bills from DB]
    FETCH_BILLS --> SHOW_BILLS[Show Bill List with Status]
    SHOW_BILLS --> BILL_ACTION{Bill Action}
    BILL_ACTION -->|View Details| BILL_DETAIL[Show Bill Details]
    BILL_ACTION -->|Download| DOWNLOAD[Download PDF]
    BILL_ACTION -->|Back| VIEW_OPT
    
    %% Pay Bill Flow
    PAY_BILL --> SELECT_BILL[Select Bill to Pay]
    SELECT_BILL --> CHOOSE_METHOD{Payment Method}
    CHOOSE_METHOD -->|UPI| UPI_PAY[UPI Payment]
    CHOOSE_METHOD -->|Card| CARD_PAY[Card Payment]
    CHOOSE_METHOD -->|Net Banking| NET_PAY[Net Banking]
    UPI_PAY --> PROCESS_PAY[Process Payment]
    CARD_PAY --> PROCESS_PAY
    NET_PAY --> PROCESS_PAY
    PROCESS_PAY --> PAY_STATUS{Payment Status}
    PAY_STATUS -->|Success| PAY_SUCCESS[Show Success + Receipt]
    PAY_STATUS -->|Failed| PAY_FAIL[Show Error] --> CHOOSE_METHOD
    PAY_SUCCESS --> UPDATE_BILL[Update Bill Status to PAID]
    UPDATE_BILL --> VIEW_OPT
    
    %% Payment History Flow
    PAY_HIST --> FETCH_HIST[Fetch Payment History]
    FETCH_HIST --> SHOW_HIST[Show Payment List]
    SHOW_HIST --> HIST_ACTION{History Action}
    HIST_ACTION -->|View Receipt| VIEW_RECEIPT[Show Receipt]
    HIST_ACTION -->|Back| VIEW_OPT
    
    %% Complaint Flow
    COMPLAINT --> COMP_FORM[Complaint Form]
    COMP_FORM --> SUBMIT_COMP[Submit Complaint]
    SUBMIT_COMP --> SAVE_COMP[Save to DB with OPEN Status]
    SAVE_COMP --> COMP_SUCCESS[Show Success]
    COMP_SUCCESS --> VIEW_OPT
    
    %% Service Request Flow
    SERVICE --> SR_FORM[Service Request Form]
    SR_FORM --> SUBMIT_SR[Submit Service Request]
    SUBMIT_SR --> SAVE_SR[Save to DB with PENDING Status]
    SAVE_SR --> SR_SUCCESS[Show Success]
    SR_SUCCESS --> VIEW_OPT
    
    %% Profile Flow
    PROFILE --> SHOW_PROFILE[Show Profile Details]
    SHOW_PROFILE --> PROFILE_ACTION{Profile Action}
    PROFILE_ACTION -->|Edit| EDIT_PROFILE[Edit Profile]
    PROFILE_ACTION -->|Change Password| CHANGE_PASS[Change Password]
    PROFILE_ACTION -->|Deactivate| DEACTIVATE[Deactivate Account]
    PROFILE_ACTION -->|Back| VIEW_OPT
    
    EDIT_PROFILE --> UPDATE_PROF[Update Profile in DB]
    UPDATE_PROF --> VIEW_OPT
    
    CHANGE_PASS --> NEW_PASS[Enter New Password]
    NEW_PASS --> UPDATE_PASS[Update Password in DB]
    UPDATE_PASS --> VIEW_OPT
    
    DEACTIVATE --> CONFIRM_DEACT{Confirm Deactivation}
    CONFIRM_DEACT -->|Yes| SET_INACTIVE[Set Status to INACTIVE]
    CONFIRM_DEACT -->|No| VIEW_OPT
    SET_INACTIVE --> LOGOUT[Logout]
    
    %% Notifications Flow
    NOTIF --> FETCH_NOTIF[Fetch Notifications]
    FETCH_NOTIF --> SHOW_NOTIF[Show Notification List]
    SHOW_NOTIF --> MARK_READ[Mark as Read]
    MARK_READ --> VIEW_OPT
```

## Key Points for Drawing:
1. **Customer Dashboard** as central hub
2. **6 Main Options** branching out
3. **Each option** has its own sub-flow
4. **Payment flow** has multiple methods
5. **Profile** includes edit, password change, deactivate
6. **Color coding**: Bills=Blue, Payments=Green, Complaints=Orange, Profile=Purple
