@isTest
public class ContentDocumentHandlerTest {

    @TestSetup
    static void setupData(){
        Account a=TestDataFactory.getStandardAccount(true);
    }
   
    @isTest
    static void deletefile_Test(){
        Account a=[Select id from account limit 1];
        User u=TestDataFactory.getCommunicationsUser(true);
        System.runAs(u){
           
            try{
                Test.startTest();
                ContentVersion cv=TestDataFactory.getContentDocument('csv','',false);
                insert cv;
                ContentVersion cvNew=[SELECT ContentDocumentId FROM ContentVersion WHERE id=:cv.Id];
                Test.stopTest();
                TestDataFactory.setContentDocumentLink(cvNew.ContentDocumentId,a.Id,true);
                ContentDocument cd=[SElect id from ContentDocument WHERE id=:cvNew.ContentDocumentId];
            	delete cd;
            }
            catch(Exception e){
                System.assert(e.getMessage().contains('FIELD_CUSTOM_VALIDATION_EXCEPTION'));
            }
            
        }
        
    }
}