@isTest
public class TrackHistoryTest {
    
    @testSetup
    static void setupData(){
        Account a=TestDataFactory.getStandardAccount(true);
        Opportunity o=TestDataFactory.getFinleapInvestmentOpportunity(a.Id,true);
    }
    
    @isTest
    static void trackOppChangeByTrigger(){
        Test.startTest();
        Opportunity o=[select id,Fact_Sheet_Sent__c FROM Opportunity LIMIT 1];
        o.Fact_Sheet_Sent__c =DateTime.now();	
        update o;
        Test.stopTest();
    }
    
}