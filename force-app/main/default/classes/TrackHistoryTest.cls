@isTest
public class TrackHistoryTest {
    
    @testSetup
    static void setupData(){
        Account a=TestDataFactory.getStandardAccount(true);
        Opportunity o=TestDataFactory.getFinleapInvestmentOpportunity(a.Id,true);
    }
    
    @isTest
    static void trackOppChangeByTrigger(){
        Opportunity o=[select id,Fact_Sheet_Sent__c FROM Opportunity LIMIT 1];
        o.Fact_Sheet_Sent__c =DateTime.now();
        update o;
        Field_History_Tracker__c history=[SELECT id,Object__c FROM Field_History_Tracker__c LIMIT 1];
        System.assertEquals('Opportunity',history.Object__c);
        
    }
    
}