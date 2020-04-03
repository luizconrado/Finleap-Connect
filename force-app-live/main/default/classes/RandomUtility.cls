public inherited sharing class RandomUtility {
    
    public static Integer getInteger(Final Integer maxValue) {
        return Integer.valueOf(Math.random() * maxValue);
    }
    
    public static String getString(Final Integer length) {
        Final String chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
        String result = ''; 
        while (result.length() < length) {
            Integer i = Math.mod(Math.abs(Crypto.getRandomInteger()), chars.length());
            result += chars.substring(i, i + 1);
        }
        return result;
    }
}