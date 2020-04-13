@isTest
public class AccountTriggerHandlerTest {

    @TestSetup
    static void testSetup(){
        Account a=TestDataFactory.getStandardAccount(true);
        TestDataFactory.setAccountTeamMember(userinfo.getUserId(),a.Id);
    }
    @isTest
    static void changeOwnerTest(){
        User u=TestDataFactory.getCommunicationsUser(true);
        System.runAs(u){
            Test.startTest();
            Account a=[SELECT Id,OwnerId FROM Account LIMIT 1];
            a.OwnerId=Userinfo.getUserId();
            update a;
            List<AccountTeamMember> atms=[select id from AccountTeamMember where AccountId=:a.Id];
            System.assertEquals(1,atms.size());
            Test.stopTest();
        }
    }
}