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
    
    @isTest
    static void setApproverUsersTest(){
        Test.startTest();
        Account a=TestDataFactory.getStandardAccount(true);
        Opportunity o=TestDataFactory.getFinleapSalesOpportunity(a.Id,true);
        o.Compliance_Approved_User_Id__c=Userinfo.getUserId();
        update o;
        Test.stopTest();
    }
    
    @isTest
    static void setCampaingNameUpdateTest(){
        Account a=TestDataFactory.getStandardAccount(true);
        Contact c=TestDataFactory.getStandardContact(a.Id,true);
        Campaign camp=TestDataFactory.getCampaing(true);
        Opportunity o=TestDataFactory.getFinleapInvestmentOpportunity(a.Id,true);
        o.CampaignId=camp.Id;
        update o;
        o=[SELECT id,Primary_Campaign_Name__c FROM Opportunity LIMIT 1];
        System.assertEquals(camp.Name, o.Primary_Campaign_Name__c);
    }
}