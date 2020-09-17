@isTest
public class RelatedProductControllerTest {

    @testSetup
    static void setupData(){
        Product2 p=TestDataFactory.getSwitchkitProduct();
    }
    
    @isTest
    static void fetchProductsTest(){
        Test.startTest();
        RelatedProductController.fetchProducts('prod','DE',false);
        List<Product2> allProducts=RelatedProductController.fetchProducts('','',true);
        System.assert(allProducts.size()==1);
        Test.stopTest();
    }
    
    @isTest
    static void upsertOpportuntiy(){
        Test.startTest();
        Account acc=TestDataFactory.getStandardAccount(true);
        Opportunity opp=TestDataFactory.getFinleapSalesOpportunity(acc.id, true);
        Product2 prod=[select id,Name,Pricing_Type__c from Product2 limit 1];
        
        OpportunityLineItem item=new OpportunityLineItem();
        item.Product2Id=prod.id;
        item.OpportunityId=opp.id;
        item.Pricing_Type__c=prod.Pricing_Type__c;
        item.UnitPrice=RandomUtility.getInteger(100);
        item.Quantity=1;
        RelatedProductController.insertOpportuntiyLineItems('['+JSON.serialize(item)+']');
        List<OpportunityLineItem> oli=RelatedProductController.getRelatedProducts(opp.id);
        System.assert(oli.size()==1);
        RelatedProductController.updateOpportuntiyLineItems(JSON.serialize(oli),'[]');
        RelatedProductController.updateOpportuntiyLineItems('[]',JSON.serialize(oli));
        oli=[SELECT id FROM OpportunityLineItem WHERE OpportunityId=:opp.Id];
        System.assert(oli.size()==0);
        Test.stopTest();
    }
}