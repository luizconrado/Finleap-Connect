@isTest
public class TrackHistoryTest {
    
    @testSetup
    static void setupData(){
        Account a=TestDataFactory.getStandardAccount(true);
        Opportunity o=TestDataFactory.getFinleapInvestmentOpportunity(a.Id,true);
    }
    
    @isTest
    static void trackTest(){
        Test.startTest();
        List<Account> o=[select Id,Name FROM Account];
        String newList=JSON.serialize(o);
        Map<Id,Account> oldO=new Map<Id,Account>(o);
        oldO.get(o.get(0).Id).Name='Changed';
        TrackHistory.track('Account',newList,JSON.serialize(oldO));
        Test.stopTest();
        List<Field_History_Tracker__c> newRecords=[SELECT id FROM Field_History_Tracker__c];
        System.assert(newRecords.size()==1);
    }
    
    @isTest
    static void publishChangesTest(){
        Test.startTest();
        List<Account> o=[select Id,Name FROM Account];
        Map<Id,Account> oldO=new Map<Id,Account>(o);
        oldO.get(o.get(0).Id).Name='Changed';
        TrackHistory.publishChanges('Account',o,oldO);
        Test.stopTest();
    }
     @isTest
    static void captureChangesTest(){
        Test.startTest();
        Account  a=[select Id,Name FROM Account LIMIT 1];
        Tracking_Events__e e=New Tracking_Events__e();
        e.Field__c='Name';
        e.Object__c='Account';
        e.Record_Id__c=a.Id;
        e.Record_Name__c=a.Name;
        e.New_Value__c=a.Name;
        e.Old_Value__c='Changed';
        e.User_Id__c=Userinfo.getUserId();
        TrackHistory.captureChanges(new List<Tracking_Events__e>{e});
        Test.stopTest();
        List<Field_History_Tracker__c> newRecords=[SELECT id FROM Field_History_Tracker__c];
        System.assert(newRecords.size()==1);
    }
    
}