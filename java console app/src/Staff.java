public class Staff {
    private String staffId;
    private String name;
    private String password;
    private String areaAssigned;

    public Staff(String staffId, String name, String password, String areaAssigned) {
        this.staffId = staffId;
        this.name = name;
        this.password = password;
        this.areaAssigned = areaAssigned;
    }

    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAreaAssigned() { return areaAssigned; }
    public void setAreaAssigned(String areaAssigned) { this.areaAssigned = areaAssigned; }

    @Override
    public String toString() {
        return "Staff ID: " + staffId + " | Name: " + name + " | Area: " + areaAssigned;
    }
}
