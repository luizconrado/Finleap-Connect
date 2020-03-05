@isTest
public class TaskTriggerHelperTest {
    
    @TestSetup
    static void testSetup(){
        Account acc=TestDataFactory.getStandardAccount(True);
        Contact standardCon=TestDataFactory.getStandardContact(acc.Id,True);
        Opportunity investmentOpportunity=TestDataFactory.getInvestmentOpportunity(acc.Id,True);
    }
    
    @isTest
    static void testInvestmentTaskWithOpportunityAndStandardContact(){
        Opportunity investmentOpp=[Select id from Opportunity WHERE recordTypeId=:Constant.OPPORTUNITY_FINLEAP_INVESTMENT_RECORDTYPE_ID LIMIT 1];
        Contact standardCon=[SELECT id FROM Contact WHERE recordTypeId=:Constant.CONTACT_STANDARD_RECORDTYPE_ID LIMIT 1];
        User investmentUser=TestDataFactory.getFinleapUser(true);
        TestDataFactory.addAccessAllPermissionSet(investmentUser.id);
        System.runAs(investmentUser){
            Test.startTest();
            	Task investmentTast=TestDataFactory.getInvestmentTask(investmentOpp.id,standardCon.id,true);
            Test.stopTest();
            List<Contact> investmentContact=[select id,recordTypeId FROM Contact Where recordTypeId=:Constant.CONTACT_FINLEAP_INVESTMENT_RECORDTYPE_ID];
            System.assertEquals(Constant.CONTACT_FINLEAP_INVESTMENT_RECORDTYPE_ID, investmentContact.get(0).recordTypeId);
        }
    }
   
}