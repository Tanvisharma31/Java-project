public class Bill {
    private String billId;
    private String consumerId;
    private int previousReading;
    private int currentReading;
    private int unitsConsumed;
    private double amount;
    private double lateFee;
    private double totalPayable;
    private String billDate;
    private String dueDate;
    private String status; // PENDING, PAID
    private String paymentMethod;
    private String paymentDate;

    public Bill(String billId, String consumerId, int previousReading, int currentReading, int unitsConsumed, 
                double amount, double lateFee, double totalPayable, String billDate, String dueDate, String status) {
        this.billId = billId;
        this.consumerId = consumerId;
        this.previousReading = previousReading;
        this.currentReading = currentReading;
        this.unitsConsumed = unitsConsumed;
        this.amount = amount;
        this.lateFee = lateFee;
        this.totalPayable = totalPayable;
        this.billDate = billDate;
        this.dueDate = dueDate;
        this.status = status;
        this.paymentMethod = "N/A";
        this.paymentDate = "N/A";
    }

    public String getBillId() { return billId; }
    public void setBillId(String billId) { this.billId = billId; }

    public String getConsumerId() { return consumerId; }
    public void setConsumerId(String consumerId) { this.consumerId = consumerId; }

    public int getUnitsConsumed() { return unitsConsumed; }
    public void setUnitsConsumed(int unitsConsumed) { this.unitsConsumed = unitsConsumed; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public double getLateFee() { return lateFee; }
    public void setLateFee(double lateFee) { this.lateFee = lateFee; }

    public double getTotalPayable() { return totalPayable; }
    public void setTotalPayable(double totalPayable) { this.totalPayable = totalPayable; }

    public String getBillDate() { return billDate; }
    public void setBillDate(String billDate) { this.billDate = billDate; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getPreviousReading() { return previousReading; }
    public void setPreviousReading(int previousReading) { this.previousReading = previousReading; }

    public int getCurrentReading() { return currentReading; }
    public void setCurrentReading(int currentReading) { this.currentReading = currentReading; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentDate() { return paymentDate; }
    public void setPaymentDate(String paymentDate) { this.paymentDate = paymentDate; }

    @Override
    public String toString() {
        return "Bill ID: " + billId + " | Consumer ID: " + consumerId + " | Units: " + unitsConsumed + " (" + previousReading + "->" + currentReading + ")" +
               "\nAmount: Rs " + amount + " | Late Fee: Rs " + lateFee + " | Total: Rs " + totalPayable +
               "\nDate: " + billDate + " | Due Date: " + dueDate + " | Status: " + status;
    }
}
