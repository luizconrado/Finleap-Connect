public class ContentVersionHandler  extends Triggerhandler {

    public ContentVersionHandler() {
        this.setMaxLoopCount(4);
    }
    
    public override void afterInsert() {
        List<ContentVersion> files=(List<ContentVersion>) Trigger.new;
        //TODO: Think Again about user exclusion
        if(!System.Label.Users_Exclusion.contains(Userinfo.getUserEmail()))   
            validateInsert(files);
    }
    
    private void validateInsert(List<ContentVersion> cvs){
        List<Id> updateSuccessFiles=new List<Id>();
        
        List<String> contentDocumentIds=new List<String>();
        for(ContentVersion cv:cvs){
            contentDocumentIds.add(cv.ContentDocumentId);
        }
        
        List<ContentDocumentLink> links=[SELECT LinkedEntity.Type,ContentDocumentId, Id FROM ContentDocumentLink where ContentDocumentId IN:contentDocumentIds  ];
        Map<Id,ContentDocumentLink> contentLinksMap=new Map<Id,ContentDocumentLink>();
        for(ContentDocumentLink cdl:links){
            if(System.Label.Restricted_Edit_Upload_Files_Objects.contains(cdl.LinkedEntity.Type)){
                contentLinksMap.put(cdl.ContentDocumentId,cdl);
            }
        }
        
        for(ContentVersion cv:cvs){ 
            if(contentLinksMap.containsKey(cv.ContentDocumentId)){
            	if(!cv.Upload__c) cv.addError('Please use component to upload file');
                else updateSuccessFiles.add(cv.Id);
            }
        }
        
        updateUploadFeild(updateSuccessFiles);
    }
    
    @future
    private static void updateUploadFeild(List<Id> cvIds){
        List<ContentVersion> updateFiles=new List<ContentVersion>();
        for(Id id:cvIds){
            ContentVersion cv=new ContentVersion();
            cv.Id=id;
            cv.Upload__c=false;
            updateFiles.add(cv);
        }
        if(updateFiles.size()>0) update updateFiles;
    }

}