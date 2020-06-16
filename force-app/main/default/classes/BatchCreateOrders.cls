global class BatchCreateOrders  implements Database.Batchable<sObject> {
    Date todaysDate=Date.today();
    Date nextmonthStartDate=todaysDate.addMonths(1).toStartofMonth();
    Date nextmonthEndDate=todaysDate.addMonths(2).toStartofMonth().addDays(-1);
    global Database.QueryLocator start(Database.BatchableContext BC) {
        
        

        String contractQuery='SELECT Id,ContractNumber,AccountId,Pricebook2Id,StartDate,Status,';
        contractQuery +=' (SELECT Id,EffectiveDate,Status FROM Orders WHERE EffectiveDate>=:nextmonthStartDate AND EffectiveDate<=:nextmonthEndDate ),';
        contractQuery +=' (SELECT Id,Status__c, Product__c,Name,Contract__c  FROM Product_Instances__r WHERE Status__c=\'Active\' ) ';
        contractQuery +=' FROM Contract WHERE ';
        contractQuery +=' Status=\'Activated\' AND StartDate >=: todaysDate ';
        return Database.getQueryLocator(contractQuery);
    }
  
    global void execute(Database.BatchableContext BC, List<Contract> contractList) {
        Map<String,List<OrderItem>> contractIdAndLineItemMap=new Map<String,List<OrderItem>>();
        List<Order> toInsertOrderList=new List<Order>();
        List<String> productIds=new List<String>();
        
        for(Contract contract:contractList){
            if(contract.Orders.size()==0){
                Order nextMonthOrder=new Order();
                nextMonthOrder.ContractId=contract.Id;
                nextMonthOrder.AccountId=contract.AccountId;
                nextMonthOrder.Pricebook2Id=contract.Pricebook2Id;
                nextMonthOrder.EffectiveDate=nextmonthStartDate;
                nextMonthOrder.EndDate=nextmonthEndDate;
                nextMonthOrder.Status='Draft';
               
                contractIdAndLineItemMap.put(nextMonthOrder.ContractId,new List<OrderItem>());
                toInsertOrderList.add(nextMonthOrder);
                
                for(Product_Instance__c productInstances:contract.Product_Instances__r){
                    OrderItem orderLineItem=new OrderItem();
                    orderLineItem.Product2Id=productInstances.Product__c;
                    orderLineItem.Quantity=1;
                    //TODO: Calculate price by usage details and update unitprice for past month
                    orderLineItem.UnitPrice=0;
                    productIds.add(orderLineItem.Product2Id);
                    contractIdAndLineItemMap.get(nextMonthOrder.ContractId).add(orderLineItem);
                }
            }
        }
        
        Map<String,PriceBookEntry> productPirceBookIdsMap=getStdPriceBook(productIds);
        List<OrderItem> toInsertOrderLineItemList=new List<OrderItem>();

        if(toInsertOrderList.size()>0){
            
            insert toInsertOrderList;
            
            for(Order o:toInsertOrderList){
                //map orderid and pricebookid
                for(OrderItem ol:contractIdAndLineItemMap.get(o.ContractId)){
                    ol.OrderId=o.Id;
                    ol.PricebookEntryId=productPirceBookIdsMap.get(ol.Product2Id).Id;
                    toInsertOrderLineItemList.add(ol);
                }
            }
        }
        if(toInsertOrderLineItemList.size()>0){
            insert toInsertOrderLineItemList;
        }
    } 
    
    private Map<String,PriceBookEntry> getStdPriceBook(List<String> productId) {
        Map<String,PriceBookEntry> productAndPriceBookMap=new Map<String,PriceBookEntry>();        
        List<PriceBookEntry> pbe= [select Id,Product2Id,Product2.Name,Product2.Family  from PriceBookEntry where Product2Id IN:productId AND PriceBook2.isStandard=true];    
        for(PriceBookEntry p:pbe){
            productAndPriceBookMap.put(p.Product2Id,p);
        }
        return productAndPriceBookMap;
    }
    
    global void finish(Database.BatchableContext BC) {
        //TODO after batch is finised
        /*
Call batch class in apex/anymonus window
Id batchJobId = Database.executeBatch(new <your batch class name>(),<batch size>);
example
Id batchJobId = Database.executeBatch(new mybatch(),150);
*/
    }
}