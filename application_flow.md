# Electricity Bill Management System - Flowcharts

The following flowcharts outline the detailed application flow for all three user roles: **Admin**, **Staff (Meter Reader)**, and **Customer**, as well as the main entry point to the system.

## Main Application Entry

```mermaid
flowchart TD
    Start([Start Application]) --> MainMenu{"Main Menu (startScreen)"}
    
    MainMenu -->|Choice 1| AdminLogin[Admin Login]
    MainMenu -->|Choice 2| StaffLogin[Staff Login]
    MainMenu -->|Choice 3| CustomerLogin[Customer Login]
    MainMenu -->|Choice 4| Register[New Customer Self-Registration]
    MainMenu -->|Choice 5| Exit([Exit System])
    
    AdminLogin -->|Success| AdminDash
    StaffLogin -->|Success| StaffDash
    CustomerLogin -->|Success| CustDash
    Register -->|Success| MainMenu
```

***

## 1. Admin Application Flow

The Admin has full control over the system, handling staff assignments, managing tariffs dynamically, resolving escalated complaints, and viewing high-level analytics.

```mermaid
flowchart TD
    AdminDash{"Admin Dashboard"}
    
    AdminDash --> C1[1. Customer Management]
    AdminDash --> C2[2. Staff Management]
    AdminDash --> C3[3. Tariff Management]
    AdminDash --> C4[4. Service Requests & Complaints]
    AdminDash --> C5[5. Analytics & Reports]
    AdminDash --> C6([6. Logout])
    
    %% Customer Management
    C1 --> C1a(Add Customer)
    C1 --> C1b(Update Email/Load)
    C1 --> C1c(Delete Customer)
    C1 --> C1d(View All Customers)
    
    %% Staff Management
    C2 --> C2a(Register New Staff)
    C2a --> C2a1[Assign Specific Area]
    C2 --> C2b(View All Staff)
    
    %% Tariff Management
    C3 --> C3a(View Current Tariffs)
    C3a --> C3a1[Shows Residential & Commercial Rates]
    C3 --> C3b(Update Base Rate)
    C3b --> C3b1[System updates TariffConfig statically]
    
    %% Requests & Complaints
    C4 --> C4a(View All Complaints)
    C4 --> C4b(Resolve Complaint)
    C4b --> C4b1[Updates Status & Notifies Customer]
    C4 --> C4c(View Pending Service Requests)
    C4 --> C4d(Approve/Reject Request)
    C4d --> C4d1[Updates Status & Notifies Customer]
    
    %% Analytics
    C5 --> C5a(General Summary)
    C5a --> C5a1[Shows Total Revenue, Pending Dues, etc.]
    C5 --> C5b(Defaulters Report)
    C5b --> C5b1[Scans all pending bills past due date]
```

***

## 2. Staff (Meter Reader) Application Flow

Staff members are assigned to specific geographical areas. Their primary job is entering meter readings to automatically generate new bills for the customers.

```mermaid
flowchart TD
    StaffDash{"Staff Dashboard"}
    
    StaffDash --> S1[1. Enter Meter Readings]
    StaffDash --> S2[2. View Area Complaints]
    StaffDash --> S3([3. Logout])
    
    %% Meter Reading Workflow
    S1 --> S1a[Input Consumer ID]
    S1a --> S1b{Check Area?}
    S1b -->|Mismatch| S1b1[Display Warning Message]
    S1b -->|Match| S1c[Display Previous Meter Reading]
    S1b1 --> S1c
    
    S1c --> S1d[Input Current Reading]
    S1d --> S1e{Current >= Previous?}
    
    S1e -->|Yes| S1f[Calculate Units Consumed]
    S1f --> S1g[Trigger calculateBillAmount]
    S1g --> S1h[Generate New Bill & Notify Customer]
    S1h --> S1i[Update Customer's Previous Reading]
    
    S1e -->|No| S1Error[Error: Invalid Reading]
    
    %% View Complaints
    S2 --> S2a[Scan all system complaints]
    S2a --> S2b[Filter by Customer Area == Staff Area]
    S2b --> S2c[Display relevant complaints]
```

***

## 3. Customer Application Flow

Customers can manage their own profiles, track their usage, pay bills through simulated gateways, and submit requests for load/category changes.

```mermaid
flowchart TD
    CustDash{"Customer Dashboard"}
    
    CustDash --> U1[1. View Profile]
    CustDash --> U2[2. View & Pay Bills]
    CustDash --> U3[3. View Payment History]
    CustDash --> U4[4. Raise Complaint]
    CustDash --> U5[5. Service Requests]
    CustDash --> U6[6. View Notifications]
    CustDash --> U7[7. Change Password]
    CustDash --> U8([8. Logout])
    
    %% View & Pay Bills
    U2 --> U2a[Display PENDING Bills]
    U2a --> U2b{Pay Bill?}
    U2b -->|Yes| U2c[Input Exact Amount]
    U2c --> U2d{Amount Correct?}
    U2d -->|No| U2dErr[Payment Rejected]
    U2d -->|Yes| U2e[Select Payment Gateway]
    
    U2e --> U2f{Method?}
    U2f -->|Card| U2g1[Validate 16-digit Card]
    U2f -->|UPI| U2g2[Validate '@' Symbol]
    U2f -->|Net Banking| U2g3[Input Bank Name]
    
    U2g1 --> U2h[Mark Bill PAID, Log Method/Date]
    U2g2 --> U2h
    U2g3 --> U2h
    U2h --> U2i[Move Bill to Payment History]
    U2i --> U2j[Generate Receipt & Notification]
    
    %% Service Requests
    U5 --> U5a[1. Request Load Change]
    U5 --> U5b[2. Request Category Change]
    U5 --> U5c[3. View Request Status]
    
    U5a --> U5d[Submit form to Admin Queue]
    U5b --> U5d
```
