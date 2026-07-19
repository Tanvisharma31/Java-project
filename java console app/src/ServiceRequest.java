public class ServiceRequest {
    private String requestId;
    private String consumerId;
    private String requestType; // LOAD_CHANGE, CATEGORY_CHANGE, NEW_CONNECTION
    private String description;
    private String status;      // PENDING, APPROVED, REJECTED

    public ServiceRequest(String requestId, String consumerId, String requestType, String description, String status) {
        this.requestId = requestId;
        this.consumerId = consumerId;
        this.requestType = requestType;
        this.description = description;
        this.status = status;
    }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getConsumerId() { return consumerId; }
    public void setConsumerId(String consumerId) { this.consumerId = consumerId; }

    public String getRequestType() { return requestType; }
    public void setRequestType(String requestType) { this.requestType = requestType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "Request ID: " + requestId + " | Consumer ID: " + consumerId + 
               "\nType: " + requestType + " | Desc: " + description + " | Status: " + status;
    }
}
