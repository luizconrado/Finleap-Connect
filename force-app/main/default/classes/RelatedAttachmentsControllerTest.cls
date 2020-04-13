@isTest
public class RelatedAttachmentsControllerTest {
    
    @TestSetup
    static void setupData(){
        Account a=TestDataFactory.getStandardAccount(true);
    }

    @isTest
    static void getAllOptions_SuccessTest(){
        Account a=[Select id from account limit 1];
        User u=TestDataFactory.getCommunicationsUser(true);
        System.runAs(u){
            Test.startTest();
            List<String> options=RelatedAttachmentsController.getAllOptions(a.Id,'Account'); 
            RelatedAttachmentsController.uploadContentVersion(EncodingUtil.base64Encode(Blob.valueOf(Randomutility.getString(6))),options.get(options.size()-1),'',Randomutility.getString(4), a.Id);
            RelatedAttachmentsController.getAllAttachments(a.Id,'Account');
            List<ContentVersion> duplicates=RelatedAttachmentsController.checkDuplicateFile(a.Id,options.get(options.size()-1));
            RelatedAttachmentsController.uploadContentVersion(EncodingUtil.base64Encode(Blob.valueOf(Randomutility.getString(6))),options.get(options.size()-1),duplicates.get(0).ContentDocumentId,Randomutility.getString(4), a.Id);
            duplicates=RelatedAttachmentsController.checkDuplicateFile(a.Id,options.get(options.size()-1));
            System.assertEquals(2,duplicates.size());
            Test.stopTest();
        }
        
    }
    @isTest
    static void getAllOptions_FailTest(){
        Account a=[Select id from account limit 1];
        User u=TestDataFactory.getCommunicationsUser(true);
        System.runAs(u){
            Test.startTest();
            try{
                ContentVersion cv=TestDataFactory.getContentDocument('csv','',false);
                cv.Upload__c=false;
				insert cv;
                ContentVersion cvNew=[SELECT ContentDocumentId FROM ContentVersion WHERE id=:cv.Id];
                TestDataFactory.setContentDocumentLink(cvNew.ContentDocumentId,a.Id,true);
                ContentVersion cv2=TestDataFactory.getContentDocument('csv',cvNew.ContentDocumentId,false);
                cv2.Upload__c=false;
				insert cv2;
            }
            catch(Exception e){
                System.assert(e.getMessage().contains('FIELD_CUSTOM_VALIDATION_EXCEPTION'));
            }
            try{
                ContentVersion cv=TestDataFactory.getContentDocument('csv','',true);
                ContentVersion cvNew=[SELECT ContentDocumentId FROM ContentVersion WHERE id=:cv.Id];
                TestDataFactory.setContentDocumentLink(cvNew.ContentDocumentId,a.Id,true);
                ContentVersion cv2=TestDataFactory.getContentDocument('csv',cvNew.ContentDocumentId,true);
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