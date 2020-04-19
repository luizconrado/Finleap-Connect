@isTest
public class OpportunityTriggerHandlerTest {

   
    @isTest
    static void changeOwnerTest(){
        User u=TestDataFactory.getStandardUser(true);
        User u2=TestDataFactory.getCommunicationsUser(true);
        System.runAs(u){
            Test.startTest();
            Account a=TestDataFactory.getStandardAccount(true);
            Opportunity o=TestDataFactory.getFinleapEcosystemOpportunity(a.Id,true);
            TestDataFactory.setOpportunityTeamMemeber(Userinfo.getUserId(),o.Id);
            Opportunity oNew=[Select id,OwnerId FROM Opportunity LIMIT 1];
            
            oNew.OwnerId=u2.Id;
            update oNew;
            List<OpportunityTeamMember> otms=[select id from OpportunityTeamMember where OpportunityId=:o.Id];
           	System.assertEquals(1,otms.size());
            Test.stopTest();
        }
    }
}