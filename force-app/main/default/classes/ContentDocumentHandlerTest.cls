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
            Test.startTest();
            try{
                ContentVersion cv=TestDataFactory.getContentDocument('csv','',false);
                insert cv;
                ContentVersion cvNew=[SELECT ContentDocumentId FROM ContentVersion WHERE id=:cv.Id];
                TestDataFactory.setContentDocumentLink(cvNew.ContentDocumentId,a.Id,true);
                ContentVersion cv2=TestDataFactory.getContentDocument('csv',cvNew.ContentDocumentId,false);
                insert cv2;
                ContentDocument cd=[SElect id from ContentDocument WHERE id=:cvNew.ContentDocumentId];
            	delete cd;
            }
            catch(Exception e){
                System.assert(e.getMessage().contains('FIELD_CUSTOM_VALIDATION_EXCEPTION'));
            }
            Test.stopTest();
        }
        
    }
}