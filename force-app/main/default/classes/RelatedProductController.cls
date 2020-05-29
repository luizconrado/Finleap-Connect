public with sharing class RelatedProductController {
    
    @AuraEnabled
    public static List<OpportunityLineItem> getAllRelatedProducts(String recordId){
        return [SELECT Id,Excess_Price__c, Base_Limit__c , Product2Id,Product2.Name, ProductCode, Name, OpportunityId, PricebookEntryId, Quantity, Discount, Subtotal, TotalPrice, UnitPrice, ListPrice 
                FROM OpportunityLineItem 
                WHERE OpportunityId=:recordId];
    }
    
    @AuraEnabled(Cacheable=true)
    public static List<Product2> searchProduct(String productName,String targetCountrie){
        productName='%'+productName+'%';
        if(targetCountrie==null || String.isBlank(targetCountrie))
            return [SELECT Id, Name, ProductCode, Description, Family, Countries_Covered__c FROM Product2 WHERE Name LIKE:productName  AND isActive=true];
        else
            return [SELECT Id, Name, ProductCode, Description, Family, Countries_Covered__c FROM Product2 WHERE Name LIKE:productName  AND isActive=true AND Countries_Covered__c includes (:targetCountrie) ];
    } 
    @AuraEnabled(Cacheable=true) 
    public static List<Product2> getAllProducts(String targetCountrie){
        if(targetCountrie==null || String.isBlank(targetCountrie))
            return [SELECT Id, Name, ProductCode, Description, Family, Countries_Covered__c FROM Product2 WHERE isActive=true LIMIT 50];
        else
            return [SELECT Id, Name, ProductCode, Description, Family, Countries_Covered__c FROM Product2 WHERE  isActive=true AND Countries_Covered__c includes (:targetCountrie) LIMIT 50];
    } 
    
	@AuraEnabled    
    public static void attachProductsToOpportuntiy(String opportunityLineItemJSON){
        List<OpportunityLineItem> oli=(List<OpportunityLineItem>) JSON.deserialize(opportunityLineItemJSON, List<OpportunityLineItem>.class);
        List<String> productIds=new List<String>();
        for(OpportunityLineItem o:oli){
            productIds.add(o.Product2Id );
        }
        Map<String,String> productAndPriceBookMap=getStdPriceBook(productIds);
        for(OpportunityLineItem o:oli){
            o.PricebookEntryId =productAndPriceBookMap.get(o.Product2Id );
        }
        insert oli;
    }
   
    private static Map<String,String> getStdPriceBook(List<String> productId) {
		Map<String,String> productAndPriceBookMap=new Map<String,String>();        
        List<PriceBookEntry> pbe= [select Id,Product2Id  from PriceBookEntry where Product2Id IN:productId AND PriceBook2.isStandard=true];    
        for(PriceBookEntry p:pbe){
            productAndPriceBookMap.put(p.Product2Id,p.Id);
        }
        return productAndPriceBookMap;
    }
    
    @AuraEnabled
    public static void updateProductsAttached(String updateList,String deleteList){
        List<OpportunityLineItem> toUpdate=(List<OpportunityLineItem>) JSON.deserialize(updateList, List<OpportunityLineItem>.class);
        List<OpportunityLineItem> toDelete=(List<OpportunityLineItem>) JSON.deserialize(deleteList, List<OpportunityLineItem>.class);
        if(toUpdate.size()>0) update toUpdate;
        if(toDelete.size()>0) delete toDelete;

    }
}