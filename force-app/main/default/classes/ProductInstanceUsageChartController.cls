public class ProductInstanceUsageChartController {
    
    @AuraEnabled(cacheable=true)
    public static List<Product_Instance_Usage__c> fetchAllUsageRecords(string insatnceId){
        List<Product_Instance_Usage__c> usageRecords=[SELECT Id,Product_Instance__c, Usage_Count__c, Usage_Period__c, Name FROM Product_Instance_Usage__c where Product_Instance__c=:insatnceId];
        return usageRecords;
    }

}