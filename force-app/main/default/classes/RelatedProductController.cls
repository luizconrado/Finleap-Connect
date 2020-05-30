public with sharing class RelatedProductController {
    
    @AuraEnabled
    public static List<OpportunityLineItem> getRelatedProducts(String recordId){
        return [SELECT Id,Product2Id,Product2.Name, ProductCode, Name, UnitPrice,Base_Limit__c,
                Excess_Limit_Bucket_1__c,Excess_Limit_Bucket_2__c,Excess_Limit_Bucket_3__c,Excess_Limit_Bucket_4__c,
                Excess_Price_Bucket_1__c,Excess_Price_Bucket_2__c,Excess_Price_Bucket_3__c,Excess_Price_Bucket_4__c
                FROM OpportunityLineItem 
                WHERE OpportunityId=:recordId ORDER BY Product2.Family Asc];
    }
    
    @AuraEnabled(Cacheable=true)
    public static List<Product2> fetchProducts(String productName,String targetCountries,Boolean showAll){
        List<Product2> allProducts=new List<Product2>();
        if(String.isNotEmpty(productName)) productName='%'+productName+'%';
        String productQuery='SELECT Id, Name, ProductCode, Description, Family, Countries_Covered__c FROM Product2 ';
        productQuery +=' WHERE isActive=true';
        if(String.isNotEmpty(productName)){
            productQuery += ' AND Name LIKE:productName ';
        }
        if(String.isNotEmpty(targetCountries) && showAll==false){
            productQuery += ' AND Countries_Covered__c includes '+getTargetCountriesQueryList(targetCountries.split(';'))+' ORDER BY Family Asc LIMIT 50';
        }
        else if(showAll==false && String.isEmpty(targetCountries)){
           return allProducts;
        }
        allProducts = Database.query(productQuery);
        return allProducts;
    }
    private static string getTargetCountriesQueryList(List<String> targetCountries){
        String temp = '(';
        for(String count:targetCountries){
            temp += '\''+String.escapeSingleQuotes(count)+'\',';
        }
        temp=temp.removeEnd(',');
        temp +=')';
        return temp;
    }
    
    
    //TODO
	@AuraEnabled    
    public static void insertOpportuntiyLineItems(String opportunityLineItemJSON){
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
    public static void updateOpportuntiyLineItems(String updateList,String deleteList){
        List<OpportunityLineItem> toUpdate=(List<OpportunityLineItem>) JSON.deserialize(updateList, List<OpportunityLineItem>.class);
        List<OpportunityLineItem> toDelete=(List<OpportunityLineItem>) JSON.deserialize(deleteList, List<OpportunityLineItem>.class);
        if(toUpdate.size()>0) update toUpdate;
        if(toDelete.size()>0) delete toDelete;

    }
}