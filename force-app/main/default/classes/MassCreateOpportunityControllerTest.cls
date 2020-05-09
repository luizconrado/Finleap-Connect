@isTest
public class MassCreateOpportunityControllerTest {
    
    @TestSetup
    static void testData(){
        Account a=TestDataFactory.getStandardAccount(true);
        Contact c=TestDataFactory.getStandardContact(a.Id,true);
        Campaign camp=TestDataFactory.getCampaing(true);
        TestDataFactory.addCampaingMember(camp.Id,c.Id);
    }
    
    @isTest
    static void getOpportunityRecordTypesTest(){
        User u=TestDataFactory.getCommunicationsUser(true);
        System.runAs(u){
            FieldSet[] recordTypes=MassCreateOpportunityController.getOpportunityRecordTypes();
         	System.assertEquals(1,recordTypes.size());
        }
    }
    @isTest
    static void getDefaultRecordTypeIdForCampaignTest(){
        User u=TestDataFactory.getStandardUser(true);
        System.runAs(u){
            Account a=[Select id from account limit 1];
            Campaign camp=[SELECT id FROM Campaign LIMIT 1];
            Opportunity o=TestDataFactory.getFinleapSalesOpportunity(a.id,false);
            o.CampaignId=camp.Id;
            insert o;
            Opportunity oppRecordTypeId=MassCreateOpportunityController.getDefaultRecordTypeIdForCampaign(camp.Id);
            MassCreateOpportunityController.getDefaultRecordTypeIdForCampaign('');
            System.assertEquals(o.RecordTypeId,oppRecordTypeId.RecordTypeId);
        }
    }
    @isTest
    static void createOpportunitiesTest(){
        Campaign camp=[SELECT id FROM Campaign LIMIT 1];
        MassCreateOpportunityController.createOpportunities(Constant.OPPORTUNITY_INVESTMENT_IN_FINLEAP_RECORDTYPE_ID,camp.id);
        List<Opportunity> o=[SELECT id FROM Opportunity];
        Account a=[SELECT id FROM ACCOUNT LIMIT 1];
        Contact c=TestDataFactory.getStandardContact(a.Id,true);
        TestDataFactory.addCampaingMember(camp.Id,c.Id);
        MassCreateOpportunityController.createOpportunities(Constant.OPPORTUNITY_INVESTMENT_IN_FINLEAP_RECORDTYPE_ID,camp.id);
        System.assertEquals(1,o.size());
    }

}