# A4-01 - Main Authentication & User Flow (Simplified for Hand Drawing)

## User-Consumer Relationship
- **One User** → Can have **Multiple Consumer IDs**
- **One Consumer ID** → Belongs to **Only One User**

```mermaid
flowchart TD
    START([Start]) --> ENTRY{Application Entry}
    
    ENTRY -->|New User| REGISTER[Registration Form]
    ENTRY -->|Existing User| LOGIN{Select Role}
    
    REGISTER --> INPUT[Enter: Name, Email, Mobile, User ID, Consumer ID, Password, Address, Category, Load]
    INPUT --> VALIDATE{Validate Form}
    VALIDATE -->|Invalid| ERROR[Show Error] --> INPUT
    VALIDATE -->|Valid| CHECK_DB{Check Database}
    CHECK_DB -->|Duplicate| ERROR
    CHECK_DB -->|Unique| SAVE[Save to DB with ACTIVE Status]
    SAVE --> SUCCESS[Show Registration Success] --> LOGIN
    
    LOGIN -->|Admin| ADMIN_LOGIN[Admin Login]
    LOGIN -->|Staff| STAFF_LOGIN[Staff Login]
    LOGIN -->|Customer| CUST_LOGIN[Customer Login]
    
    ADMIN_LOGIN --> ADMIN_AUTH{Check Credentials}
    ADMIN_AUTH -->|Invalid| ADMIN_ERR[Show Error] --> ADMIN_LOGIN
    ADMIN_AUTH -->|Valid| ADMIN_DASH[Admin Dashboard]
    
    STAFF_LOGIN --> STAFF_AUTH{Check Credentials}
    STAFF_AUTH -->|Invalid| STAFF_ERR[Show Error] --> STAFF_LOGIN
    STAFF_AUTH -->|Valid| STAFF_DASH[Staff Dashboard]
    
    CUST_LOGIN --> CUST_AUTH{Check Credentials}
    CUST_AUTH -->|Invalid| CUST_ERR[Show Error] --> CUST_LOGIN
    CUST_AUTH -->|Valid| CUST_STATUS{Check Status}
    CUST_STATUS -->|Deactivated| CUST_DEACT[Show Deactivated] --> CUST_LOGIN
    CUST_STATUS -->|Active| CUST_DASH[Customer Dashboard]
    
    ADMIN_DASH --> ADMIN_FLOW[Admin Module Flow]
    STAFF_DASH --> STAFF_FLOW[Staff Module Flow]
    CUST_DASH --> CUST_FLOW[Customer Module Flow]
```

## Key Points for Drawing:
1. **Diamond shapes** for decisions/conditions
2. **Rectangle shapes** for processes/actions
3. **Cylinder/Database shape** for database operations
4. **Arrows** showing flow direction
5. **Different colors** for different user types (Admin=Red, Staff=Blue, Customer=Green)
