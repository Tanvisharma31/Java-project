import java.util.Scanner;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.regex.Pattern;

public class MainApp {
    static final int MAX_SIZE = 100;
    
    // Arrays
    static Customer[] customers = new Customer[MAX_SIZE];
    static int customerCount = 0;

    static Bill[] bills = new Bill[MAX_SIZE];
    static int billCount = 0;

    static Complaint[] complaints = new Complaint[MAX_SIZE];
    static int complaintCount = 0;

    static Staff[] staffList = new Staff[MAX_SIZE];
    static int staffCount = 0;

    static ServiceRequest[] requests = new ServiceRequest[MAX_SIZE];
    static int requestCount = 0;

    static Scanner sc = new Scanner(System.in);
    
    // Tracking
    static Customer loggedInCustomer = null;
    static Staff loggedInStaff = null;
    static int failedAttempts = 0;

    public static void main(String[] args) {
        loadDummyData();
        startScreen();
    }

    // ==========================================
    // DUMMY DATA LOADER
    // ==========================================
    private static void loadDummyData() {
        System.out.println("[System] Loading Dummy Data...");
        
        customers[0] = new Customer("C101", "Amit Sharma", "amit@test.com", "9876543210", "pass123", "Delhi North", "RESIDENTIAL", 2.0, 1500);
        customers[1] = new Customer("C102", "Priya Singh", "priya@test.com", "8765432109", "pass123", "Delhi South", "COMMERCIAL", 5.0, 5000);
        customerCount = 2;

        staffList[0] = new Staff("S101", "Ramesh Kumar", "staff123", "Delhi North");
        staffList[1] = new Staff("S102", "Suresh Verma", "staff123", "Delhi South");
        staffCount = 2;

        LocalDate today = LocalDate.now();
        String oldDate = today.minusDays(20).toString();
        String pastDue = today.minusDays(5).toString();
        
        bills[0] = new Bill("B1001", "C101", 1255, 1500, 245, 1225.00, 0.0, 1225.00, oldDate, pastDue, "PENDING");
        bills[1] = new Bill("B1002", "C102", 4850, 5000, 150, 600.00, 0.0, 600.00, today.toString(), today.plusDays(15).toString(), "PENDING");
        billCount = 2;
        
        customers[0].addNotification("Welcome to Electricity Board.");

        complaints[0] = new Complaint("COMP1001", "C101", "Meter reading incorrect", "HIGH", "OPEN");
        complaintCount = 1;

        requests[0] = new ServiceRequest("REQ1001", "C101", "LOAD_CHANGE", "Increase load to 4.0 kW", "PENDING");
        requestCount = 1;
        
        System.out.println("[System] Dummy Data Loaded.");
        System.out.println("Admin Credentials -> Username: admin | Password: admin123");
        System.out.println("Staff Credentials -> ID: S101 | Password: staff123");
        System.out.println("Customer Credentials -> ID: C101 | Password: pass123");
    }

    // ==========================================
    // LOGIN & REGISTRATION
    // ==========================================
    private static void startScreen() {
        int choice = -1;
        do {
            System.out.println("\n=== Welcome to Electricity Bill Management System ===");
            System.out.println("1. Admin Login");
            System.out.println("2. Staff Login");
            System.out.println("3. Customer Login");
            System.out.println("4. Register as New Customer");
            System.out.println("5. Exit");
            choice = readInt("Enter your choice: ");

            switch (choice) {
                case 1: adminLogin(); break;
                case 2: staffLogin(); break;
                case 3: customerLogin(); break;
                case 4: customerSelfRegistration(); break;
                case 5: System.out.println("Exiting System. Goodbye!"); break;
                default: System.out.println("Invalid choice. Please try again.");
            }
        } while (choice != 5);
    }

    private static void handleLockout() {
        failedAttempts++;
        if (failedAttempts >= 3) {
            System.out.println("Too many failed attempts. Locking out for 10 seconds...");
            try {
                Thread.sleep(10000);
            } catch (InterruptedException e) {
                System.out.println("Wait interrupted.");
            }
            failedAttempts = 0; // reset after timeout
        }
    }

    private static void adminLogin() {
        System.out.println("\n--- Admin Login ---");
        String uname = readString("Enter Admin Username: ");
        String pass = readString("Enter Admin Password: ");
        
        if (uname.equals("admin") && pass.equals("admin123")) {
            System.out.println("Admin login successful!");
            failedAttempts = 0;
            adminMenu();
        } else {
            System.out.println("Error: Invalid Admin Credentials!");
            handleLockout();
        }
    }

    private static void staffLogin() {
        System.out.println("\n--- Staff Login ---");
        String userId = readString("Enter Staff ID: ");
        String pass = readString("Enter Password: ");
        
        for (int i = 0; i < staffCount; i++) {
            if (staffList[i].getStaffId().equals(userId) && staffList[i].getPassword().equals(pass)) {
                loggedInStaff = staffList[i];
                System.out.println("Login successful! Welcome, " + loggedInStaff.getName());
                failedAttempts = 0;
                staffMenu();
                return;
            }
        }
        System.out.println("Error: Invalid Staff ID or Password!");
        handleLockout();
    }

    private static void customerLogin() {
        System.out.println("\n--- Customer Login ---");
        String userId = readString("Enter Consumer ID: ");
        String pass = readString("Enter Password: ");
        
        for (int i = 0; i < customerCount; i++) {
            if (customers[i].getConsumerId().equals(userId) && customers[i].getPassword().equals(pass)) {
                loggedInCustomer = customers[i];
                System.out.println("Login successful! Welcome, " + loggedInCustomer.getName());
                failedAttempts = 0;
                applyLateFeesForCustomer(userId);
                customerMenu();
                return;
            }
        }
        System.out.println("Error: Invalid Consumer ID or Password!");
        handleLockout();
    }

    private static void customerSelfRegistration() {
        System.out.println("\n--- New Customer Registration ---");
        if (customerCount >= MAX_SIZE) {
            System.out.println("Error: System capacity reached!");
            return;
        }
        String id = readString("Enter a new Consumer ID (Alphanumeric): ");
        if (findCustomerIndex(id) != -1) {
            System.out.println("Error: Consumer ID already exists!");
            return;
        }
        
        String name = readName("Enter your Name: ");
        String email = readEmail("Enter your Email: ");
        String mobile = readMobile("Enter your Mobile Number: ");
        String pass = readPassword("Create a Password (min 6 chars, at least 1 digit): ");
        String address = readString("Enter your Area/City: ");
        String connType = readConnType("Enter Connection Type (RESIDENTIAL/COMMERCIAL): ");
        double load = readDouble("Enter Sanctioned Load in kW (e.g., 2.0): ");

        customers[customerCount] = new Customer(id, name, email, mobile, pass, address, connType, load, 0);
        customers[customerCount].addNotification("Registration successful. Connection is active.");
        customerCount++;
        System.out.println("Registration successful! You can now login.");
    }
    
    // ==========================================
    // CUSTOMER MENU (Role: Customer)
    // ==========================================
    private static void customerMenu() {
        int choice = -1;
        do {
            System.out.println("\n=== Customer Dashboard ===");
            System.out.println("1. View My Profile");
            System.out.println("2. View & Pay Bills");
            System.out.println("3. View Payment History");
            System.out.println("4. Raise a Complaint");
            System.out.println("5. Service Requests (Load/Category Change)");
            System.out.println("6. View Notifications");
            System.out.println("7. Change Password");
            System.out.println("8. Logout");
            choice = readInt("Enter choice: ");

            switch (choice) {
                case 1: System.out.println(loggedInCustomer); break;
                case 2: viewAndPayBills(); break;
                case 3: viewPaymentHistory(); break;
                case 4: raiseComplaint(); break;
                case 5: serviceRequests(); break;
                case 6: viewNotifications(); break;
                case 7: changePassword(); break;
                case 8: 
                    loggedInCustomer = null;
                    System.out.println("Logged out successfully.");
                    break;
                default: System.out.println("Invalid choice.");
            }
        } while (choice != 8 && loggedInCustomer != null);
    }

    private static void viewAndPayBills() {
        boolean found = false;
        for (int i = 0; i < billCount; i++) {
            if (bills[i].getConsumerId().equals(loggedInCustomer.getConsumerId()) && bills[i].getStatus().equals("PENDING")) {
                System.out.println(bills[i]);
                found = true;
                
                String ans = readString("Do you want to pay this bill? (Y/N): ");
                if (ans.equalsIgnoreCase("Y")) {
                    double amount = readDouble("Enter exact amount to pay (" + bills[i].getTotalPayable() + "): ");
                    if (Math.abs(amount - bills[i].getTotalPayable()) < 0.01) {
                        simulatePaymentGateway(bills[i]);
                    } else {
                        System.out.println("Error: Payment rejected. Amount must exactly match the total payable.");
                    }
                }
            }
        }
        if (!found) System.out.println("You have no pending bills.");
    }

    private static void simulatePaymentGateway(Bill bill) {
        System.out.println("\n--- Payment Gateway ---");
        System.out.println("1. Credit/Debit Card");
        System.out.println("2. UPI");
        System.out.println("3. Net Banking");
        int choice = readInt("Select Payment Method: ");
        
        String method = "N/A";
        boolean success = false;
        
        if (choice == 1) {
            String card = readString("Enter 16-digit Card Number: ");
            if (card.matches("\\d{16}")) {
                method = "CARD"; success = true;
            } else System.out.println("Invalid Card Number.");
        } else if (choice == 2) {
            String upi = readString("Enter UPI ID (e.g. user@bank): ");
            if (upi.contains("@")) {
                method = "UPI"; success = true;
            } else System.out.println("Invalid UPI ID.");
        } else if (choice == 3) {
            readString("Enter Bank Name: ");
            method = "NET_BANKING"; success = true;
        } else {
            System.out.println("Invalid choice.");
        }

        if (success) {
            System.out.println("Processing Payment...");
            try { Thread.sleep(1500); } catch (Exception e) {}
            bill.setStatus("PAID");
            bill.setPaymentMethod(method);
            bill.setPaymentDate(LocalDate.now().toString());
            loggedInCustomer.addBillToHistory(bill);
            printReceipt(bill, loggedInCustomer);
            loggedInCustomer.addNotification("Payment successful via " + method + " for Bill ID: " + bill.getBillId());
        } else {
            System.out.println("Payment Failed.");
        }
    }
    
    private static void printReceipt(Bill bill, Customer customer) {
        System.out.println("================================");
        System.out.println("      ELECTRICITY BILL RECEIPT  ");
        System.out.println("================================");
        System.out.println("Bill ID       : " + bill.getBillId());
        System.out.println("Consumer ID   : " + customer.getConsumerId());
        System.out.println("Name          : " + customer.getName());
        System.out.println("Units         : " + bill.getUnitsConsumed());
        System.out.printf("Amount        : Rs %.2f\n", bill.getAmount());
        System.out.printf("Late Fee      : Rs %.2f\n", bill.getLateFee());
        System.out.printf("Total Paid    : Rs %.2f\n", bill.getTotalPayable());
        System.out.println("Method        : " + bill.getPaymentMethod());
        System.out.println("Date Paid     : " + bill.getPaymentDate());
        System.out.println("================================");
    }

    private static void viewPaymentHistory() {
        Bill[] history = loggedInCustomer.getBillHistory();
        int count = loggedInCustomer.getBillCount();
        if (count == 0) {
            System.out.println("No payment history found.");
            return;
        }
        System.out.println("\n--- Payment History ---");
        for (int i = 0; i < count; i++) {
            System.out.println("Bill ID: " + history[i].getBillId() + " | Amount Paid: Rs " + history[i].getTotalPayable() + " | Date: " + history[i].getPaymentDate() + " | Method: " + history[i].getPaymentMethod());
        }
    }

    private static void raiseComplaint() {
        if (complaintCount >= MAX_SIZE) {
            System.out.println("Error: Complaint capacity reached!");
            return;
        }
        String type = readString("Enter Problem Description: ");
        String priority = readPriority("Enter Priority (LOW/MEDIUM/HIGH): ");
        String complaintId = "COMP" + (1000 + complaintCount + 1);

        complaints[complaintCount] = new Complaint(complaintId, loggedInCustomer.getConsumerId(), type, priority, "OPEN");
        complaintCount++;
        loggedInCustomer.addNotification("Complaint raised successfully: " + complaintId);
        System.out.println("Successfully registered your complaint. ID: " + complaintId);
    }

    private static void serviceRequests() {
        System.out.println("\n--- Service Requests ---");
        System.out.println("1. Request Load Change");
        System.out.println("2. Request Category Change (Res/Com)");
        System.out.println("3. View My Request Status");
        int choice = readInt("Enter choice: ");
        
        if (choice == 1 || choice == 2) {
            if (requestCount >= MAX_SIZE) {
                System.out.println("Capacity reached."); return;
            }
            String reqType = (choice == 1) ? "LOAD_CHANGE" : "CATEGORY_CHANGE";
            String desc = readString("Enter details for request: ");
            String reqId = "REQ" + (1000 + requestCount + 1);
            requests[requestCount] = new ServiceRequest(reqId, loggedInCustomer.getConsumerId(), reqType, desc, "PENDING");
            requestCount++;
            System.out.println("Request submitted. ID: " + reqId);
        } else if (choice == 3) {
            boolean found = false;
            for (int i = 0; i < requestCount; i++) {
                if (requests[i].getConsumerId().equals(loggedInCustomer.getConsumerId())) {
                    System.out.println(requests[i]);
                    found = true;
                }
            }
            if (!found) System.out.println("No requests found.");
        }
    }

    private static void viewNotifications() {
        String[] notifs = loggedInCustomer.getNotifications();
        int count = loggedInCustomer.getNotifCount();
        if (count == 0) {
            System.out.println("No notifications.");
            return;
        }
        System.out.println("\n--- Notifications ---");
        for (int i = 0; i < count; i++) {
            System.out.println("- " + notifs[i]);
        }
    }
    
    private static void changePassword() {
        String current = readString("Enter current password: ");
        if (!current.equals(loggedInCustomer.getPassword())) {
            System.out.println("Error: Incorrect password.");
            return;
        }
        String newPass = readPassword("Enter new password (min 6 chars, 1 digit): ");
        loggedInCustomer.setPassword(newPass);
        System.out.println("Password changed successfully.");
        loggedInCustomer.addNotification("Password changed securely.");
    }

    // ==========================================
    // STAFF MENU (Role: Staff / Meter Reader)
    // ==========================================
    private static void staffMenu() {
        int choice = -1;
        do {
            System.out.println("\n=== Staff Dashboard (" + loggedInStaff.getAreaAssigned() + ") ===");
            System.out.println("1. Enter Meter Readings");
            System.out.println("2. View Complaints in Area");
            System.out.println("3. Logout");
            choice = readInt("Enter choice: ");

            switch (choice) {
                case 1: enterMeterReadings(); break;
                case 2: viewComplaintsByArea(); break;
                case 3: 
                    loggedInStaff = null;
                    System.out.println("Staff logged out.");
                    break;
                default: System.out.println("Invalid choice.");
            }
        } while (choice != 3 && loggedInStaff != null);
    }

    private static void enterMeterReadings() {
        System.out.println("\n--- Meter Reading Entry ---");
        String id = readString("Enter Consumer ID: ");
        int cIndex = findCustomerIndex(id);
        if (cIndex == -1) {
            System.out.println("Customer not found."); return;
        }
        Customer cust = customers[cIndex];
        if (!cust.getAddressArea().equalsIgnoreCase(loggedInStaff.getAreaAssigned())) {
            System.out.println("Warning: This customer is not in your assigned area.");
        }
        
        System.out.println("Previous Reading for " + id + ": " + cust.getPreviousMeterReading());
        int currentReading = readInt("Enter Current Meter Reading: ");
        
        if (currentReading < cust.getPreviousMeterReading()) {
            System.out.println("Error: Current reading cannot be less than previous reading.");
            return;
        }
        
        int units = currentReading - cust.getPreviousMeterReading();
        System.out.println("Units Consumed: " + units);
        
        // Generate Bill automatically upon reading entry
        if (billCount >= MAX_SIZE) {
            System.out.println("Error: Bill capacity reached!");
            return;
        }
        
        double amount = calculateBillAmount(units, cust);
        String billId = "B" + (1000 + billCount + 1);
        String billDate = LocalDate.now().toString();
        String dueDate = LocalDate.now().plusDays(15).toString();

        bills[billCount] = new Bill(billId, id, cust.getPreviousMeterReading(), currentReading, units, amount, 0.0, amount, billDate, dueDate, "PENDING");
        billCount++;
        
        // Update customer's previous reading for next time
        cust.setPreviousMeterReading(currentReading);
        cust.addNotification("New bill generated for amount Rs " + amount + ". Due on " + dueDate);
        
        System.out.println("Bill generated successfully! Bill ID: " + billId + " | Amount: Rs " + amount);
    }
    
    private static void viewComplaintsByArea() {
        System.out.println("\n--- Area Complaints ---");
        boolean found = false;
        for (int i = 0; i < complaintCount; i++) {
            int cIndex = findCustomerIndex(complaints[i].getConsumerId());
            if (cIndex != -1 && customers[cIndex].getAddressArea().equalsIgnoreCase(loggedInStaff.getAreaAssigned())) {
                System.out.println(complaints[i]);
                found = true;
            }
        }
        if (!found) System.out.println("No complaints in your area.");
    }

    // ==========================================
    // ADMIN MENU (Role: Admin)
    // ==========================================
    private static void adminMenu() {
        int choice = -1;
        do {
            System.out.println("\n=== Admin Dashboard ===");
            System.out.println("1. Customer Management");
            System.out.println("2. Staff Management");
            System.out.println("3. Tariff Management");
            System.out.println("4. Service Requests & Complaints");
            System.out.println("5. Analytics & Reports");
            System.out.println("6. Logout");
            choice = readInt("Enter your choice: ");

            switch (choice) {
                case 1: manageCustomers(); break;
                case 2: manageStaff(); break;
                case 3: manageTariffs(); break;
                case 4: manageRequestsAndComplaints(); break;
                case 5: analyticsDashboard(); break;
                case 6: System.out.println("Admin logged out."); break;
                default: System.out.println("Invalid choice.");
            }
        } while (choice != 6);
    }

    // ==========================================
    // ADMIN - CUSTOMER MANAGEMENT
    // ==========================================
    private static void manageCustomers() {
        int choice;
        do {
            System.out.println("\n--- Customer Management ---");
            System.out.println("1. Add Customer");
            System.out.println("2. Update Customer Info");
            System.out.println("3. Delete Customer");
            System.out.println("4. View All Customers");
            System.out.println("5. Back");
            choice = readInt("Enter choice: ");

            switch (choice) {
                case 1: addCustomer(); break;
                case 2: updateCustomer(); break;
                case 3: deleteCustomer(); break;
                case 4: viewCustomers(); break;
                case 5: break;
                default: System.out.println("Invalid choice.");
            }
        } while (choice != 5);
    }

    private static void addCustomer() {
        customerSelfRegistration(); // Reuse logic
    }

    private static void updateCustomer() {
        String id = readString("Enter Consumer ID to update: ");
        int index = findCustomerIndex(id);
        if (index != -1) {
            String newEmail = readEmail("Enter new Email Address: ");
            double newLoad = readDouble("Enter new Sanctioned Load: ");
            customers[index].setEmail(newEmail);
            customers[index].setSanctionedLoadKw(newLoad);
            System.out.println("Customer details updated.");
        } else {
            System.out.println("Error: Customer not found!");
        }
    }

    private static void deleteCustomer() {
        String id = readString("Enter Consumer ID to delete: ");
        int index = findCustomerIndex(id);
        if (index != -1) {
            for (int i = index; i < customerCount - 1; i++) {
                customers[i] = customers[i + 1];
            }
            customers[customerCount - 1] = null;
            customerCount--;
            System.out.println("Customer details deleted.");
        } else {
            System.out.println("Error: Customer not found!");
        }
    }

    private static void viewCustomers() {
        if (customerCount == 0) {
            System.out.println("No customers found.");
            return;
        }
        for (int i = 0; i < customerCount; i++) {
            System.out.println(customers[i]);
            System.out.println("---");
        }
    }

    // ==========================================
    // ADMIN - STAFF MANAGEMENT
    // ==========================================
    private static void manageStaff() {
        int choice;
        do {
            System.out.println("\n--- Staff Management ---");
            System.out.println("1. Add Staff");
            System.out.println("2. View All Staff");
            System.out.println("3. Back");
            choice = readInt("Enter choice: ");

            switch (choice) {
                case 1: 
                    if (staffCount >= MAX_SIZE) { System.out.println("Capacity reached."); break; }
                    String id = readString("Enter Staff ID: ");
                    String name = readName("Enter Name: ");
                    String pass = readPassword("Enter Password: ");
                    String area = readString("Enter Area Assigned: ");
                    staffList[staffCount++] = new Staff(id, name, pass, area);
                    System.out.println("Staff added successfully.");
                    break;
                case 2: 
                    for (int i=0; i<staffCount; i++) System.out.println(staffList[i]);
                    break;
                case 3: break;
                default: System.out.println("Invalid.");
            }
        } while (choice != 3);
    }

    // ==========================================
    // ADMIN - TARIFF CONFIGURATION
    // ==========================================
    private static void manageTariffs() {
        System.out.println("\n--- Tariff Management ---");
        System.out.println("1. View Current Tariffs");
        System.out.println("2. Update Residential Base Rate (Slab 1)");
        System.out.println("3. Back");
        int choice = readInt("Enter choice: ");
        
        if (choice == 1) {
            System.out.println("Residential Fixed: Rs " + TariffConfig.resFixedChargePerKw + "/kW");
            System.out.println("Res Slab 1 (0-100): Rs " + TariffConfig.resSlab1Rate);
            System.out.println("Commercial Fixed: Rs " + TariffConfig.comFixedChargePerKw + "/kW");
            System.out.println("Com Slab 1 (0-100): Rs " + TariffConfig.comSlab1Rate);
        } else if (choice == 2) {
            double newRate = readDouble("Enter new rate for Res Slab 1: ");
            TariffConfig.resSlab1Rate = newRate;
            System.out.println("Tariff updated successfully.");
        }
    }

    private static double calculateBillAmount(int units, Customer cust) {
        double fixedCharge = 0;
        double energyCharge = 0;
        
        if (cust.getConnectionType().equals("RESIDENTIAL")) {
            fixedCharge = TariffConfig.resFixedChargePerKw * cust.getSanctionedLoadKw();
            if (units <= 100) {
                energyCharge = units * TariffConfig.resSlab1Rate;
            } else if (units <= 300) {
                energyCharge = (100 * TariffConfig.resSlab1Rate) + ((units - 100) * TariffConfig.resSlab2Rate);
            } else {
                energyCharge = (100 * TariffConfig.resSlab1Rate) + (200 * TariffConfig.resSlab2Rate) + ((units - 300) * TariffConfig.resSlab3Rate);
            }
        } else {
            // Commercial
            fixedCharge = TariffConfig.comFixedChargePerKw * cust.getSanctionedLoadKw();
            if (units <= 100) {
                energyCharge = units * TariffConfig.comSlab1Rate;
            } else if (units <= 300) {
                energyCharge = (100 * TariffConfig.comSlab1Rate) + ((units - 100) * TariffConfig.comSlab2Rate);
            } else {
                energyCharge = (100 * TariffConfig.comSlab1Rate) + (200 * TariffConfig.comSlab2Rate) + ((units - 300) * TariffConfig.comSlab3Rate);
            }
        }
        
        double total = fixedCharge + energyCharge;
        double tax = total * TariffConfig.electricityDutyPercent;
        return total + tax;
    }

    // ==========================================
    // ADMIN - COMPLAINTS & REQUESTS
    // ==========================================
    private static void manageRequestsAndComplaints() {
        int choice;
        do {
            System.out.println("\n--- Service Requests & Complaints ---");
            System.out.println("1. View All Complaints");
            System.out.println("2. Resolve Complaint");
            System.out.println("3. View Pending Service Requests");
            System.out.println("4. Approve/Reject Request");
            System.out.println("5. Back");
            choice = readInt("Enter choice: ");

            switch (choice) {
                case 1: 
                    for (int i = 0; i < complaintCount; i++) System.out.println(complaints[i]);
                    break;
                case 2: resolveComplaint(); break;
                case 3: 
                    for (int i = 0; i < requestCount; i++) {
                        if (requests[i].getStatus().equals("PENDING")) System.out.println(requests[i]);
                    }
                    break;
                case 4: processRequest(); break;
                case 5: break;
                default: System.out.println("Invalid choice.");
            }
        } while (choice != 5);
    }

    private static void processRequest() {
        String id = readString("Enter Request ID: ");
        int rIndex = -1;
        for (int i=0; i<requestCount; i++) {
            if (requests[i].getRequestId().equals(id)) { rIndex = i; break; }
        }
        if (rIndex != -1) {
            String act = readString("Approve (A) or Reject (R)? ");
            if (act.equalsIgnoreCase("A")) {
                requests[rIndex].setStatus("APPROVED");
                int cIndex = findCustomerIndex(requests[rIndex].getConsumerId());
                if (cIndex != -1) customers[cIndex].addNotification("Your request " + id + " has been approved.");
                System.out.println("Request Approved.");
            } else {
                requests[rIndex].setStatus("REJECTED");
                System.out.println("Request Rejected.");
            }
        } else {
            System.out.println("Request not found.");
        }
    }

    private static void resolveComplaint() {
        String id = readString("Enter Complaint ID to resolve: ");
        int index = findComplaintIndex(id);
        if(index != -1) {
            complaints[index].setStatus("RESOLVED");
            System.out.println("Complaint status updated to RESOLVED!");
            int cIndex = findCustomerIndex(complaints[index].getConsumerId());
            if (cIndex != -1) {
                customers[cIndex].addNotification("Your complaint " + id + " has been marked as RESOLVED.");
            }
        } else {
             System.out.println("Error: Complaint not found!");
        }
    }

    // ==========================================
    // ADMIN - ANALYTICS DASHBOARD
    // ==========================================
    private static void analyticsDashboard() {
        System.out.println("\n--- Analytics Dashboard ---");
        System.out.println("1. General Summary");
        System.out.println("2. Defaulters Report");
        System.out.println("3. Back");
        int choice = readInt("Enter choice: ");
        
        if (choice == 1) {
            System.out.println("Total Registered Customers: " + customerCount);
            System.out.println("Total Bills Generated: " + billCount);
            
            double revenue = 0;
            double pending = 0;
            for (int i = 0; i < billCount; i++) {
                if (bills[i].getStatus().equals("PAID")) revenue += bills[i].getTotalPayable();
                else {
                    applyLateFee(bills[i]);
                    pending += bills[i].getTotalPayable();
                }
            }
            System.out.println("Total Revenue Collected: Rs " + revenue);
            System.out.println("Total Pending Dues: Rs " + pending);
            
            int openC = 0, resC = 0;
            for (int i = 0; i < complaintCount; i++) {
                if (complaints[i].getStatus().equals("OPEN")) openC++;
                else if (complaints[i].getStatus().equals("RESOLVED")) resC++;
            }
            System.out.println("Complaints - Open: " + openC + ", Resolved: " + resC);
        } else if (choice == 2) {
            System.out.println("\n--- Defaulters Report ---");
            boolean found = false;
            LocalDate today = LocalDate.now();
            for (int i = 0; i < billCount; i++) {
                if (bills[i].getStatus().equals("PENDING")) {
                    LocalDate dueDate = LocalDate.parse(bills[i].getDueDate());
                    if (today.isAfter(dueDate)) {
                        applyLateFee(bills[i]);
                        System.out.println("Consumer: " + bills[i].getConsumerId() + " | Bill ID: " + bills[i].getBillId() + " | Due: Rs " + bills[i].getTotalPayable());
                        found = true;
                    }
                }
            }
            if (!found) System.out.println("No defaulters found.");
        }
    }

    // ==========================================
    // UTILITIES & LATE FEE ENGINE
    // ==========================================
    private static void applyLateFeesForCustomer(String consumerId) {
        for (int i = 0; i < billCount; i++) {
            if (bills[i].getConsumerId().equals(consumerId) && bills[i].getStatus().equals("PENDING")) {
                applyLateFee(bills[i]);
            }
        }
    }
    
    private static void applyLateFee(Bill bill) {
        if (!bill.getStatus().equals("PENDING")) return;
        
        LocalDate today = LocalDate.now();
        LocalDate dueDate = LocalDate.parse(bill.getDueDate());
        
        if (today.isAfter(dueDate)) {
            long daysOverdue = ChronoUnit.DAYS.between(dueDate, today);
            int blocks = (int) Math.ceil(daysOverdue / 7.0);
            double penaltyPercent = blocks * 0.02;
            if (penaltyPercent > 0.20) penaltyPercent = 0.20; // capped at 20%
            
            double lateFee = bill.getAmount() * penaltyPercent;
            bill.setLateFee(lateFee);
            bill.setTotalPayable(bill.getAmount() + lateFee);
        }
    }
    
    private static int findCustomerIndex(String id) {
        for (int i = 0; i < customerCount; i++) {
            if (customers[i].getConsumerId().equals(id)) return i;
        }
        return -1;
    }

    private static int findComplaintIndex(String id) {
        for (int i = 0; i < complaintCount; i++) {
            if (complaints[i].getComplaintId().equals(id)) return i;
        }
        return -1;
    }

    // ==========================================
    // VALIDATION HELPERS
    // ==========================================
    private static int readInt(String prompt) {
        while (true) {
            System.out.print(prompt);
            try {
                int val = Integer.parseInt(sc.nextLine().trim());
                return val;
            } catch (NumberFormatException e) {
                System.out.println("Error: Invalid input! Please enter a valid whole number.");
            }
        }
    }

    private static double readDouble(String prompt) {
        while (true) {
            System.out.print(prompt);
            try {
                double val = Double.parseDouble(sc.nextLine().trim());
                if (val < 0) {
                    System.out.println("Error: Amount cannot be negative!");
                    continue;
                }
                return val;
            } catch (NumberFormatException e) {
                System.out.println("Error: Invalid input! Please enter a valid decimal amount.");
            }
        }
    }

    private static String readEmail(String prompt) {
        String emailRegex = "^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$";
        while (true) {
            System.out.print(prompt);
            String email = sc.nextLine().trim();
            if (Pattern.matches(emailRegex, email)) return email;
            System.out.println("Error: Invalid email format (e.g. user@example.com)");
        }
    }

    private static String readMobile(String prompt) {
        while (true) {
            System.out.print(prompt);
            String mobile = sc.nextLine().trim();
            if (mobile.matches("\\d{10}")) return mobile;
            System.out.println("Error: Mobile must be 10 digits and numeric only.");
        }
    }

    private static String readString(String prompt) {
        while (true) {
            System.out.print(prompt);
            String text = sc.nextLine().trim();
            if (!text.isEmpty()) return text;
            System.out.println("Error: Input cannot be empty!");
        }
    }
    
    private static String readName(String prompt) {
        while (true) {
            String name = readString(prompt);
            if (name.matches("^[a-zA-Z\\s]{2,50}$")) return name;
            System.out.println("Error: Name must be 2-50 chars and contain only letters and spaces.");
        }
    }
    
    private static String readPassword(String prompt) {
        while (true) {
            String pass = readString(prompt);
            if (pass.length() >= 6 && pass.matches(".*\\d.*")) return pass;
            System.out.println("Error: Password too weak! Min 6 chars, at least 1 digit.");
        }
    }
    
    private static String readPriority(String prompt) {
        while (true) {
            String prio = readString(prompt).toUpperCase();
            if (prio.equals("LOW") || prio.equals("MEDIUM") || prio.equals("HIGH")) return prio;
            System.out.println("Error: Priority must be LOW, MEDIUM, or HIGH.");
        }
    }

    private static String readConnType(String prompt) {
        while (true) {
            String type = readString(prompt).toUpperCase();
            if (type.equals("RESIDENTIAL") || type.equals("COMMERCIAL")) return type;
            System.out.println("Error: Must be RESIDENTIAL or COMMERCIAL.");
        }
    }
}
