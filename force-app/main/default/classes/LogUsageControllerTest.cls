@isTest
public class LogUsageControllerTest {

    @isTest
    static void logEntryTest(){
        
        Account a=TestDataFactory.getStandardAccount(true);
        Opportunity o=TestDataFactory.getFinleapEcosystemOpportunity(a.Id,true);
        LogUsageController.logEntry(o.Id,'Opportunity');
        List<Field_History_Tracker__c> track=[select id from Field_History_Tracker__c LIMIT 1];
        System.assertEquals(1, track.size());
    }
}