public class CreateOrderContractAsset {
    
    @AuraEnabled
    public static String createEntitys(Final String quoteId){
        Quote q=[SELECT id,OpportunityId,Opportunity.Name,AccountId,Pricebook2Id,ExpirationDate  FROM Quote WHERE Id=:quoteId];
        List<QuoteLineItem> quoteLineItemList=[SELECT UnitPrice, ListPrice, Subtotal, TotalPrice, ServiceDate, CreatedDate, Quantity, Id, SortOrder, Discount, PricebookEntryId, QuoteId, Product2Id,Product2.Name, LineNumber, OpportunityLineItemId FROM QuoteLineItem WHERE QuoteId=:q.Id];
        
        Contract contract=new Contract();
        contract.AccountId=q.AccountId;
        Contract.StartDate=Date.today();
        contract.ContractTerm=Date.today().monthsBetween(q.ExpirationDate);
        contract.Pricebook2Id=q.Pricebook2Id;
        insert contract;
        
        Order order=new Order();
        Order.Status='Draft';
        order.AccountId=q.AccountId;
        order.ContractId=contract.id;
        order.EffectiveDate=Date.today();
        insert order;
        List<Asset> assetList=new List<Asset>();
        List<OrderItem> orderItemList=new List<OrderItem>();
        for(QuoteLineItem qli:quoteLineItemList){
        	OrderItem orderItem=new OrderItem();
            orderItem.OrderId=order.Id;
            orderItem.Product2Id =qli.Product2Id;
            orderItem.UnitPrice=qli.UnitPrice;
            orderItem.Quantity=qli.Quantity;
            orderItem.PricebookEntryId=qli.PricebookEntryId;
            orderItemList.add(orderItem);
            
            Asset orderAsset=new Asset();
            orderAsset.AccountId=q.AccountId;
            orderAsset.Name=q.Opportunity.Name+'-'+qli.Product2.Name;
            orderAsset.Product2Id=qli.Product2Id;
            orderAsset.Opportunity__c=q.OpportunityId;
            orderAsset.Order__c=order.id;
            orderAsset.Price=qli.UnitPrice;
            orderAsset.Quantity=qli.Quantity;
            assetList.add(orderAsset);
            
        }
        insert orderItemList;
        insert assetList;
        
        return order.Id;
    }

}