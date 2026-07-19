public class TariffConfig {
    // Residential Tariffs
    public static double resFixedChargePerKw = 50.0;
    public static double resSlab1Rate = 3.5; // 0-100 units
    public static double resSlab2Rate = 5.0; // 101-300 units
    public static double resSlab3Rate = 7.0; // 301+ units

    // Commercial Tariffs
    public static double comFixedChargePerKw = 100.0;
    public static double comSlab1Rate = 6.0; // 0-100 units
    public static double comSlab2Rate = 8.0; // 101-300 units
    public static double comSlab3Rate = 10.0; // 301+ units
    
    // Taxes
    public static double electricityDutyPercent = 0.05; // 5%
}
