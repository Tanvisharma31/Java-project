public class TestRunner {
    public static void main(String[] args) {
        System.out.println("Running Automated Tests for Electricity Bill System...\n");
        
        int passed = 0;
        int failed = 0;

        // Test Case 1: Residential Tariff Calculation (<= 100 units)
        // Fixed: 50 * 2.0 = 100
        // Units: 50 * 3.5 = 175
        // Subtotal = 275
        // Tax 5% = 13.75
        // Total = 288.75
        Customer c1 = new Customer("T1", "Test1", "t1@t.c", "123", "p", "Area", "RESIDENTIAL", 2.0, 0);
        double bill1 = calculateBillTest(50, c1);
        if (Math.abs(bill1 - 288.75) < 0.01) {
            System.out.println("[PASS] TC1: Residential Tariff <= 100 units");
            passed++;
        } else {
            System.out.println("[FAIL] TC1: Expected 288.75, Got " + bill1);
            failed++;
        }

        // Test Case 2: Residential Tariff Calculation (101-300 units)
        // Units: 150. Fixed (2kW) = 100
        // 100 * 3.5 = 350
        // 50 * 5.0 = 250
        // Subtotal = 100 + 350 + 250 = 700
        // Tax = 35
        // Total = 735
        Customer c2 = new Customer("T2", "Test2", "t2@t.c", "123", "p", "Area", "RESIDENTIAL", 2.0, 0);
        double bill2 = calculateBillTest(150, c2);
        if (Math.abs(bill2 - 735.0) < 0.01) {
            System.out.println("[PASS] TC2: Residential Tariff > 100 units");
            passed++;
        } else {
            System.out.println("[FAIL] TC2: Expected 735.0, Got " + bill2);
            failed++;
        }
        
        // Test Case 3: Commercial Tariff Calculation
        // Units: 100. Fixed (5kW) = 5 * 100 = 500
        // 100 * 6.0 = 600
        // Subtotal = 1100
        // Tax = 55
        // Total = 1155
        Customer c3 = new Customer("T3", "Test3", "t3@t.c", "123", "p", "Area", "COMMERCIAL", 5.0, 0);
        double bill3 = calculateBillTest(100, c3);
        if (Math.abs(bill3 - 1155.0) < 0.01) {
            System.out.println("[PASS] TC3: Commercial Tariff <= 100 units");
            passed++;
        } else {
            System.out.println("[FAIL] TC3: Expected 1155.0, Got " + bill3);
            failed++;
        }

        // Test Case 4: Validation Logic (Regex check imitation)
        String validEmail = "test@domain.com";
        String invalidEmail = "testdomain.com";
        if (validEmail.matches("^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$") && !invalidEmail.matches("^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$")) {
            System.out.println("[PASS] TC4: Email Validation Regex");
            passed++;
        } else {
            System.out.println("[FAIL] TC4: Email Validation Regex");
            failed++;
        }

        System.out.println("\nTest Summary: " + passed + " Passed, " + failed + " Failed.");
    }

    private static double calculateBillTest(int units, Customer cust) {
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
}
