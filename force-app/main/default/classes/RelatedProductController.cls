public with sharing class RelatedProductController {
    
    @AuraEnabled
    public static List<OpportunityLineItem> getRelatedProducts(String recordId){
        return [SELECT Id,Product2Id,Product2.Name,Product2.Family,ProductCode, Name,OpportunityId, UnitPrice,Base_Limit__c,
                Excess_Limit_Bucket_1__c,Excess_Limit_Bucket_2__c,Excess_Limit_Bucket_3__c,Excess_Limit_Bucket_4__c,Excess_Limit_Bucket_5__c,
                Excess_Price_Bucket_1__c,Excess_Price_Bucket_2__c,Excess_Price_Bucket_3__c,Excess_Price_Bucket_4__c,Excess_Price_Bucket_5__c,
                One_Time_Setup_Price__c
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
       	Map<String,List<String>> oppAndProductMap=new Map<String,List<String>>();
        List<String> productIds=new List<String>();
        for(OpportunityLineItem o:oli){
            productIds.add(o.Product2Id );
            
            
        }
        Map<String,PriceBookEntry> productAndPriceBookMap=getStdPriceBook(productIds);
        for(OpportunityLineItem o:oli){
            o.PricebookEntryId =productAndPriceBookMap.get(o.Product2Id ).Id;
            if(!oppAndProductMap.containsKey(o.OpportunityId)){
            	oppAndProductMap.put(o.OpportunityId,new List<String>());    
            }
            oppAndProductMap.get(o.OpportunityId).add(productAndPriceBookMap.get(o.Product2Id).Product2.Family+' - '+productAndPriceBookMap.get(o.Product2Id).Product2.Name);
        }
        
        
        List<Opportunity> opportunityList=[SELECT id,Product__c FROM Opportunity WHERE Id IN:oppAndProductMap.keySet()];
        for(Opportunity o:opportunityList){
            o.Product__c = (o.Product__c!=null)?o.Product__c+';'+String.join(oppAndProductMap.get(o.Id),';'):String.join(oppAndProductMap.get(o.Id),';');
            System.debug('KING '+o.Product__c);
        }
        
        update opportunityList;
        insert oli;
    }
   
    private static Map<String,PriceBookEntry> getStdPriceBook(List<String> productId) {
		Map<String,PriceBookEntry> productAndPriceBookMap=new Map<String,PriceBookEntry>();        
        List<PriceBookEntry> pbe= [select Id,Product2Id,Product2.Name,Product2.Family  from PriceBookEntry where Product2Id IN:productId AND PriceBook2.isStandard=true];    
        for(PriceBookEntry p:pbe){
            productAndPriceBookMap.put(p.Product2Id,p);
        }
        return productAndPriceBookMap;
    }
    
    @AuraEnabled
    public static void updateOpportuntiyLineItems(String updateList,String deleteList){
        List<OpportunityLineItem> toUpdate=(List<OpportunityLineItem>) JSON.deserialize(updateList, List<OpportunityLineItem>.class);
        List<OpportunityLineItem> toDelete=(List<OpportunityLineItem>) JSON.deserialize(deleteList, List<OpportunityLineItem>.class);
       	Map<String,List<String>> oppAndProductMap=new Map<String,List<String>>();
        for(OpportunityLineItem oli:toDelete){
            if(!oppAndProductMap.containsKey(oli.OpportunityId)){
                oppAndProductMap.put(oli.OpportunityId,new List<String>());    
            }
            oppAndProductMap.get(oli.OpportunityId).add(oli.Name);
        }        
        List<Opportunity> opportunityList=[SELECT id,Product__c FROM Opportunity WHERE Id IN:oppAndProductMap.keySet()];
        for(Opportunity o:opportunityList){
            List<String> allProducts=o.Product__c.split(';');
            for(String prodName:oppAndProductMap.get(o.Id)){
                if(allProducts.indexOf(prodName)>-1){
                    allProducts.remove(allProducts.indexOf(prodName));
                }
            }
            o.Product__c=String.join(allProducts, ';');
        }
        
        update opportunityList;
        System.debug('KING '+oppAndProductMap);
        if(toUpdate.size()>0) update toUpdate;
        if(toDelete.size()>0) delete toDelete;

    }
}