@isTest
public class EventTriggerHelperTest {
    @testsetup
    static void testData(){
        Account acc=TestDataFactory.getStandardAccount(True);
        Contact investmentContact=TestDataFactory.getInvestmentContact(acc.Id,True);
        Opportunity investmentOpportunity=TestDataFactory.getInvestmentOpportunity(acc.Id,True);
        Event e=TestDataFactory.getStandardEvent(investmentOpportunity.Id,investmentContact.Id,True);
    }
    
    
    @isTest
    static void testInsertWithInvestemntOpp(){
        User investmentUser=TestDataFactory.getFinleapUser(true);
        TestDataFactory.addAccessAllPermissionSet(investmentUser.id);
        System.runAs(investmentUser){
            Account acc=TestDataFactory.getStandardAccount(True);
            Contact standardCon=TestDataFactory.getStandardContact(acc.Id,True);
            Opportunity investmentOpportunity=TestDataFactory.getInvestmentOpportunity(acc.Id,True);
            Test.startTest();
            Event investmentEvent=TestDataFactory.getInvestmentEvent(investmentOpportunity.id,standardCon.id,true);
            Test.stopTest();
            List<Contact> standradContact=[select id from contact where recordtypeid=:Constant.CONTACT_STANDARD_RECORDTYPE_ID];
            System.assertEquals(0, standradContact.size());
        }
    }
    @isTest
    static void testUpdate(){
        User investmentUser=TestDataFactory.getFinleapUser(true);
        TestDataFactory.addAccessAllPermissionSet(investmentUser.id);
        System.runAs(investmentUser){
            Account acc=[select id from account limit 1];
            Contact standardCon=TestDataFactory.getStandardContact(acc.Id,True);
            Test.startTest();
            Event e=[select id,whoId from Event limit 1];
            e.whoId=standardCon.id;
            update e;
            Test.stopTest();
            List<Contact> standradContact=[select id from contact where recordtypeid=:Constant.CONTACT_STANDARD_RECORDTYPE_ID];
            System.assertEquals(0, standradContact.size());
        }
    }
}