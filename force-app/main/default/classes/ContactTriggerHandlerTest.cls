@isTest
public class ContactTriggerHandlerTest {
    
    @testSetup
    static void setupData(){
        Account a=TestDataFactory.getStandardAccount(true);
        Contact c=TestDataFactory.getStandardContact(a.Id,true);
    }
    
    @isTest
    static void testAfterUpdateChange(){
        Test.startTest();
       	Contact c=[SELECT id,LastName FROM Contact LIMIT 1];
        c.LastName='Change';
        update c;
        Test.stopTest();
        List<Field_History_Tracker__c> newRecords=[SELECT id FROM Field_History_Tracker__c];
        System.assert(newRecords.size()==1);
    }

}