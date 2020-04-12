@isTest
public class RelatedAttachmentsControllerTest {
    
    @TestSetup
    static void setupData(){
        Account a=TestDataFactory.getStandardAccount(true);
    }

    @isTest
    static void getAllOptionsTest(){
        Account a=[Select id from account limit 1];
        User u=TestDataFactory.getCommunicationsUser(true);
        System.runAs(u){
            List<String> options=RelatedAttachmentsController.getAllOptions(a.Id,'Account'); 
            RelatedAttachmentsController.uploadContentVersion(EncodingUtil.base64Encode(Blob.valueOf(Randomutility.getString(6))),options.get(options.size()-1),'',Randomutility.getString(4), a.Id);
            RelatedAttachmentsController.getAllAttachments(a.Id,'Account');
            List<ContentVersion> duplicates=RelatedAttachmentsController.checkDuplicateFile(a.Id,options.get(options.size()-1));
            RelatedAttachmentsController.uploadContentVersion(EncodingUtil.base64Encode(Blob.valueOf(Randomutility.getString(6))),options.get(options.size()-1),duplicates.get(0).ContentDocumentId,Randomutility.getString(4), a.Id);
            duplicates=RelatedAttachmentsController.checkDuplicateFile(a.Id,options.get(options.size()-1));
            System.assertEquals(2,duplicates.size());
            
        }
        
    }
}