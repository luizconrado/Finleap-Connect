@isTest
public class LoggerServiceTest {
	
    @isTest
    static void logExceptionTest(){
        try{
            integer i=1/0;
        }
        catch(Exception e){
            LoggerService.logException('LoggerServiceTest','Expected', e);
        }
        Log__c log=[SELECT id,Source__c FROM Log__c WHERE Source__c='LoggerServiceTest'];
        System.assert(log.Source__c=='LoggerServiceTest');
    }
    @isTest
    static void logErrorTest(){
        LoggerService.logError('LoggerServiceTest','Expected');
        Log__c log=[SELECT id,Source__c FROM Log__c WHERE Source__c='LoggerServiceTest'];
        System.assert(log.Source__c=='LoggerServiceTest');
    }
    @isTest
    static void testRunningUser(){
        User u=TestDataFactory.getFinleapUser(true);
        System.runAs(u){
            LoggerService.logError('LoggerServiceTest','Expected');
            Log__c log=[SELECT id,Source__c,Stack_Trace__c  FROM Log__c WHERE Source__c='LoggerServiceTest'];
            System.assert(log.Source__c=='LoggerServiceTest');    
            System.assert(log.Stack_Trace__c.contains(Userinfo.getUserId()));
        }
        
        
    }
}