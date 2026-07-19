public class Complaint {
    private String complaintId;
    private String consumerId;
    private String description;
    private String priority; // LOW, MEDIUM, HIGH
    private String status;   // OPEN, IN_PROGRESS, RESOLVED

    public Complaint(String complaintId, String consumerId, String description, String priority, String status) {
        this.complaintId = complaintId;
        this.consumerId = consumerId;
        this.description = description;
        this.priority = priority;
        this.status = status;
    }

    public String getComplaintId() { return complaintId; }
    public void setComplaintId(String complaintId) { this.complaintId = complaintId; }

    public String getConsumerId() { return consumerId; }
    public void setConsumerId(String consumerId) { this.consumerId = consumerId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "Complaint ID: " + complaintId + " | Consumer ID: " + consumerId + 
               "\nDescription: " + description + 
               "\nPriority: " + priority + " | Status: " + status;
    }
}
