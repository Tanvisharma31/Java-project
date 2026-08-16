# A4-03 - Staff Module Flow (Simplified for Hand Drawing)

```mermaid
flowchart TD
    STAFF_START([Staff Dashboard]) --> STAFF_OPT{Select Option}
    
    STAFF_OPT -->|Meter Reading| METER_READ[Meter Reading]
    STAFF_OPT -->|Bill Generation| BILL_GEN[Bill Generation]
    STAFF_OPT -->|Complaints| STAFF_COMP[Handle Complaints]
    STAFF_OPT -->|Service Requests| STAFF_SR[Handle Service Requests]
    STAFF_OPT -->|Customer Search| CUST_SEARCH[Search Customers]
    STAFF_OPT -->|Profile| STAFF_PROF[Staff Profile]
    
    %% Meter Reading Flow
    METER_READ --> SELECT_CUST[Select Customer/Area]
    SELECT_CUST --> ENTER_READING[Enter Current Reading]
    ENTER_READING --> VALIDATE_READ{Validate Reading}
    VALIDATE_READ -->|Invalid| READ_ERR[Show Error] --> ENTER_READING
    VALIDATE_READ -->|Valid| SAVE_READING[Save Reading to DB]
    SAVE_READING --> READ_SUCCESS[Show Success]
    READ_SUCCESS --> STAFF_OPT
    
    %% Bill Generation Flow
    BILL_GEN --> SELECT_BILL_CUST[Select Customer for Billing]
    SELECT_BILL_CUST --> CALC_BILL[Calculate Bill Amount]
    CALC_BILL --> APPLY_TARIFF[Apply Tariff Rates]
    APPLY_TARIFF --> CHECK_DUE{Check Due Date}
    CHECK_DUE -->|Overdue| ADD_LATE[Add Late Fee]
    CHECK_DUE -->|Not Overdue| NO_LATE[No Late Fee]
    ADD_LATE --> GEN_BILL[Generate Bill]
    NO_LATE --> GEN_BILL
    GEN_BILL --> SAVE_BILL[Save Bill to DB]
    SAVE_BILL --> BILL_SUCCESS[Show Success]
    BILL_SUCCESS --> STAFF_OPT
    
    %% Complaint Handling Flow
    STAFF_COMP --> FETCH_COMP[Fetch Open Complaints]
    FETCH_COMP --> SHOW_COMP[Show Complaint List]
    SHOW_COMP --> COMP_ACTION{Complaint Action}
    COMP_ACTION -->|View Details| COMP_DETAIL[Show Complaint Details]
    COMP_ACTION -->|Update Status| UPDATE_STATUS[Update Status]
    COMP_ACTION -->|Resolve| RESOLVE_COMP[Mark as Resolved]
    COMP_ACTION -->|Back| STAFF_OPT
    
    UPDATE_STATUS --> SAVE_STATUS[Save Status to DB]
    SAVE_STATUS --> STAFF_OPT
    
    RESOLVE_COMP --> SAVE_RESOLVE[Save Resolution to DB]
    SAVE_RESOLVE --> STAFF_OPT
    
    %% Service Request Handling Flow
    STAFF_SR --> FETCH_SR[Fetch Pending Requests]
    FETCH_SR --> SHOW_SR[Show Request List]
    SHOW_SR --> SR_ACTION{Request Action}
    SR_ACTION -->|View Details| SR_DETAIL[Show Request Details]
    SR_ACTION -->|Approve| APPROVE_SR[Approve Request]
    SR_ACTION -->|Reject| REJECT_SR[Reject Request]
    SR_ACTION -->|Back| STAFF_OPT
    
    APPROVE_SR --> SAVE_APPROVE[Save Approval to DB]
    SAVE_APPROVE --> STAFF_OPT
    
    REJECT_SR --> SAVE_REJECT[Save Rejection to DB]
    SAVE_REJECT --> STAFF_OPT
    
    %% Customer Search Flow
    CUST_SEARCH --> SEARCH_INPUT[Enter Search Criteria]
    SEARCH_INPUT --> FETCH_CUST[Fetch Customers from DB]
    FETCH_CUST --> SHOW_CUST[Show Customer List]
    SHOW_CUST --> CUST_ACTION{Customer Action}
    CUST_ACTION -->|View Details| CUST_DETAIL[Show Customer Details]
    CUST_ACTION -->|View Bills| CUST_BILLS[Show Customer Bills]
    CUST_ACTION -->|Back| STAFF_OPT
    
    %% Staff Profile Flow
    STAFF_PROF --> SHOW_STAFF_PROF[Show Staff Profile]
    SHOW_STAFF_PROF --> STAFF_PROF_ACTION{Profile Action}
    STAFF_PROF_ACTION -->|Edit| EDIT_STAFF[Edit Profile]
    STAFF_PROF_ACTION -->|Change Password| STAFF_PASS[Change Password]
    STAFF_PROF_ACTION -->|Back| STAFF_OPT
    
    EDIT_STAFF --> UPDATE_STAFF[Update Profile in DB]
    UPDATE_STAFF --> STAFF_OPT
    
    STAFF_PASS --> NEW_STAFF_PASS[Enter New Password]
    NEW_STAFF_PASS --> UPDATE_STAFF_PASS[Update Password in DB]
    UPDATE_STAFF_PASS --> STAFF_OPT
```

## Key Points for Drawing:
1. **Staff Dashboard** as central hub
2. **6 Main Options** for staff operations
3. **Meter Reading**: Select customer → Enter reading → Validate → Save
4. **Bill Generation**: Select customer → Calculate → Apply tariff → Check overdue → Generate
5. **Complaints**: View → Update status → Resolve
6. **Service Requests**: View → Approve/Reject
7. **Customer Search**: Search → View details/bills
8. **Color coding**: Meter Reading=Blue, Bills=Green, Complaints=Orange, Service Requests=Red
