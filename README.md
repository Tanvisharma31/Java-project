# Electricity Bill Management System

A core Java console-based application designed for managing electricity consumer details, billing, and complaints. This project is built as a PBL (Project-Based Learning) assignment, keeping strict constraints in mind, such as using **pure Arrays** instead of advanced collections (like `ArrayList`) for data management.

## 🚀 Features

*   **Role-Based Access Control:** Separate dashboards for Admin and Customers.
*   **Customer Management:** Admin can add, update, delete, and view customers. Customers can self-register.
*   **Bill & Payment Management:** Admin can generate bills. Customers can view and pay their due bills.
*   **Complaint Registration:** Customers can log complaints, and Admin can view and resolve them.
*   **Strict Validations:** Prevents duplicate Consumer IDs, enforces valid email formats, 10-digit mobile numbers, and handles incorrect data types gracefully without crashing.
*   **Dummy Data Injection:** Application auto-loads sample data on startup for immediate testing.

## 🛠️ Technology Stack
*   **Language:** Java (JDK 8 or higher)
*   **Paradigm:** Object-Oriented Programming (OOP)
*   **Data Structure:** Fixed-Size Arrays (No Collections API)

## 📂 Project Structure

```text
src/
├── MainApp.java     # Main execution class with Menu loops & validations
├── Customer.java    # Customer entity model
├── Bill.java        # Bill entity model
└── Complaint.java   # Complaint entity model
```

## ⚙️ How to Compile and Run

1. Open your terminal or command prompt.
2. Navigate to the root directory of the project.
3. **Compile all Java files:**
   ```bash
   javac src/*.java
   ```
4. **Run the Application:**
   ```bash
   java -cp src MainApp
   ```

## 🔐 Default Credentials (Dummy Data)

When the application starts, it automatically injects dummy records so you can test it immediately.

**Admin Credentials:**
*   **Username:** `admin`
*   **Password:** `admin123`

**Sample Customer Credentials:**
1.  **User ID:** `amit123` | **Password:** `pass123`
2.  **User ID:** `priya123` | **Password:** `pass123`

## 💡 Key Implementations
*   **Array Handling:** Adding limits (`MAX_SIZE = 100`), sequential tracking using counter variables (`customerCount`, `billCount`), and left-shifting array elements during a `delete` operation to fill `null` gaps.
*   **Exception Safety:** Replaced simple `Scanner.nextInt()` with a more robust `Scanner.nextLine()` parsing approach via try-catch blocks to completely eliminate `InputMismatchException` crashes.
