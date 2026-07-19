public class Customer {
    private String consumerId;
    private String name;
    private String email;
    private String mobile;
    private String password;
    
    // New fields
    private String addressArea;
    private String connectionType; // RESIDENTIAL or COMMERCIAL
    private double sanctionedLoadKw;
    private int previousMeterReading;
    
    private Bill[] billHistory = new Bill[20];
    private int billCount = 0;
    
    private String[] notifications = new String[10];
    private int notifCount = 0;

    public Customer(String consumerId, String name, String email, String mobile, String password, 
                    String addressArea, String connectionType, double sanctionedLoadKw, int previousMeterReading) {
        this.consumerId = consumerId;
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.password = password;
        this.addressArea = addressArea;
        this.connectionType = connectionType;
        this.sanctionedLoadKw = sanctionedLoadKw;
        this.previousMeterReading = previousMeterReading;
    }

    public String getConsumerId() { return consumerId; }
    public void setConsumerId(String consumerId) { this.consumerId = consumerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Bill[] getBillHistory() { return billHistory; }
    public int getBillCount() { return billCount; }

    public void addBillToHistory(Bill bill) {
        if (billCount < billHistory.length) {
            billHistory[billCount++] = bill;
        } else {
            // Shift history to make room for new bill (circular like behavior)
            for (int i = 0; i < billHistory.length - 1; i++) {
                billHistory[i] = billHistory[i + 1];
            }
            billHistory[billHistory.length - 1] = bill;
        }
    }

    public String[] getNotifications() { return notifications; }
    public int getNotifCount() { return notifCount; }

    public void addNotification(String notification) {
        if (notifCount < notifications.length) {
            notifications[notifCount++] = notification;
        } else {
            // Circular buffer behavior for notifications
            for (int i = 0; i < notifications.length - 1; i++) {
                notifications[i] = notifications[i + 1];
            }
            notifications[notifications.length - 1] = notification;
        }
    }

    public String getAddressArea() { return addressArea; }
    public void setAddressArea(String addressArea) { this.addressArea = addressArea; }

    public String getConnectionType() { return connectionType; }
    public void setConnectionType(String connectionType) { this.connectionType = connectionType; }

    public double getSanctionedLoadKw() { return sanctionedLoadKw; }
    public void setSanctionedLoadKw(double sanctionedLoadKw) { this.sanctionedLoadKw = sanctionedLoadKw; }

    public int getPreviousMeterReading() { return previousMeterReading; }
    public void setPreviousMeterReading(int previousMeterReading) { this.previousMeterReading = previousMeterReading; }

    @Override
    public String toString() {
        return "Consumer ID: " + consumerId + " | Name: " + name + " | Area: " + addressArea + " | Mobile: " + mobile + "\nType: " + connectionType + " | Load: " + sanctionedLoadKw + " kW | Prev Reading: " + previousMeterReading;
    }
}
