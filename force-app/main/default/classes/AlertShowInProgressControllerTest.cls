@isTest
public class AlertShowInProgressControllerTest {

    @TestSetup
    public static void setupData(){
        Account a=TestDataFactory.getStandardAccount(true);
    }
    @isTest
    public static void testsameRecord(){
        User u=TestDataFactory.getStandardUser(true);
        System.runAs(u){
            Test.startTest();
            Account a=[select id from account limit 1];
            Opportunity op1=TestDataFactory.getFinleapInvestmentOpportunity(a.Id,true);
            Opportunity op2=TestDataFactory.getFinleapInvestmentOpportunity(a.Id,true);
            Opportunity o=[select id,recordtypeid,accountid from Opportunity LIMIT 1];
            String response=AlertShowInProgressController.getAllInProgressOpportunties(o.recordtypeid,o.AccountId,o.id);
            Map<String,Object> oppList=(Map<String,Object>)JSON.deserializeUntyped(response);
            System.assert(oppList.containsKey('Global'));
            Test.stopTest();
        }
    }
     @isTest
    public static void testdiffrentRecord(){
        User u=TestDataFactory.getStandardUser(true);
        System.runAs(u){
            Test.startTest();
            Account a=[select id from account limit 1];
            Opportunity op1=TestDataFactory.getFinleapInvestmentOpportunity(a.Id,true);
            Opportunity op2=TestDataFactory.getFinleapInvestmentOpportunity(a.Id,true);
            Opportunity op3=TestDataFactory.getFinleapEcosystemOpportunity(a.Id,true);
            Opportunity op4=TestDataFactory.getFinleapEcosystemOpportunity(a.Id,true);
            Opportunity o=[select id,recordtypeid,accountid from Opportunity LIMIT 1];
            String response=AlertShowInProgressController.getAllInProgressOpportunties(o.recordtypeid,o.AccountId,o.id);
            Map<String,Object> oppList=(Map<String,Object>)JSON.deserializeUntyped(response);
            System.assert(oppList.containsKey('Private'));
            Test.stopTest();
        }
    }
}