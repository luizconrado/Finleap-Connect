@isTest
public class DatabaseUtilityTest {
	
    @isTest
    static void insertRecordsSingleTest(){
        Account testAccount=TestDataFactory.getStandardAccount(false);
        List<DatabaseResponse> response= DatabaseUtility.insertRecords(testAccount);
        System.assert(response.get(0).success);
        Account insertedAccount=[SELECT id FROM Account LIMIT 1];
        System.assert(response.get(0).Id==insertedAccount.Id);
    }
    @isTest
    static void insertRecordsMulitpleTest(){
        Account testAccount=TestDataFactory.getStandardAccount(false);
        List<DatabaseResponse> response= DatabaseUtility.insertRecords(new List<Account>{testAccount});
        System.assert(response.size()>0);
        Account insertedAccount=[SELECT id FROM Account LIMIT 1];
        System.assert(response.get(0).Id==insertedAccount.Id);
    }
    
    @isTest
    static void updateRecordSingleTest(){
        Account testAccount=TestDataFactory.getStandardAccount(true);
        Contact testContact=TestDataFactory.getStandardContact(testAccount.Id,true);
        testContact.Suffix='Assert Me';
        List<DatabaseResponse> response = DatabaseUtility.updateRecords(testContact);
        System.assert(response.get(0).success);
        Contact updatedContact=[select Suffix from Contact LIMIT 1];
        System.assert(updatedContact.Suffix=='Assert Me');
    }
    @isTest
    static void updateRecordMultipleTest(){
        Account testAccount=TestDataFactory.getStandardAccount(true);
        Contact testContact=TestDataFactory.getStandardContact(testAccount.Id,true);
        testContact.Suffix='Assert Me';
        List<DatabaseResponse> response = DatabaseUtility.updateRecords(new List<Contact>{testContact});
        System.assert(response.get(0).success);
        Contact updatedContact=[select Suffix from Contact LIMIT 1];
        System.assert(updatedContact.Suffix=='Assert Me');
    }
    
    @isTest 
    static void insertFailedTest(){
        Account testAccount=TestDataFactory.getStandardAccount(true);
        Contact testContact=TestDataFactory.getStandardContact(testAccount.Id,false);
        testContact.Email='';
        List<DatabaseResponse> response = DatabaseUtility.insertRecords(new List<Contact>{testContact});
        System.assert(!response.get(0).success);
        System.assert(response.get(0).errorMsg.contains('Email'));
    }
    @isTest
    static void updateFailedTest(){
        Account testAccount=TestDataFactory.getStandardAccount(false);
        List<DatabaseResponse> response = DatabaseUtility.updateRecords(testAccount); 
        System.assert(!response.get(0).success);
        DatabaseResponse.logError(response, 'DatabaseUtilityTest');
        Log__c log=[select id,Source__c from Log__c LIMIT 1];
        System.assert(log.source__c=='DatabaseUtilityTest');
        
    }
}