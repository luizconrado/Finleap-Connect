@isTest
public class RelatedOpportunityControllerTest {

    @TestSetup
    static void testData(){
        Account acc=TestDataFactory.getStandardAccount(true);
        Contact con=TestDataFactory.getStandardContact(acc.Id,true);
        Opportunity opp=TestDataFactory.getFinleapInvestmentOpportunity(acc.Id,true);
        Opportunity stdOpp=TestDataFactory.getFinleapEcosystemOpportunity(acc.Id,true);
        
        TestDataFactory.addOpportunityToContact(opp.Id,con.Id);
       

    }
    
    @isTest 
    static void getHiddenOpportunitys_Account(){
        User u=TestDataFactory.getCommunicationsUser(true);
        
        System.runAs(u){
            Account a=[SELECT id FROM Account Limit 1];
            Map<String,Object> oppList=(Map<String,Object>)JSON.deserializeUntyped(RelatedOpportunityController.getHiddenOpportunitys(a.Id,'Account'));
            System.assert(oppList.containsKey('Private'));
        }
    }
    @isTest 
    static void getHiddenOpportunitys_Contact(){
        User u=TestDataFactory.getCommunicationsUser(true);
        System.runAs(u){
            Contact c=[SELECT id FROM Contact Limit 1];
            Map<String,Object> oppList=(Map<String,Object>)JSON.deserializeUntyped(RelatedOpportunityController.getHiddenOpportunitys(c.Id,'Contact'));
            System.assert(oppList.containsKey('Private'));
        }
    }
}