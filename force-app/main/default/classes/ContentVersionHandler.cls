public class ContentVersionHandler  extends Triggerhandler {

    public ContentVersionHandler() {
        this.setMaxLoopCount(10);
    }
    
    public override void afterInsert() {
        List<ContentVersion> files=(List<ContentVersion>) Trigger.new;
        if(!System.Label.File_Delete_Users_Exclusion.contains(Userinfo.getUserEmail()))   
            validateInsert(files);
    }
    
    private void validateInsert(List<ContentVersion> cvs){
        List<Id> updateSuccessFiles=new List<Id>();
        
        List<Id> contentDocumentIds=new List<Id>();
        for(ContentVersion cv:cvs){
            contentDocumentIds.add(cv.ContentDocumentId);
        }
        if(contentDocumentIds.size()>0) updateUploadFeild(contentDocumentIds);
        
        //Retriving entitys to which attachment is linked and filtering based on specifed object mentiond in label
        List<ContentDocumentLink> links=[SELECT LinkedEntity.Type,ContentDocumentId, Id FROM ContentDocumentLink where ContentDocumentId IN:contentDocumentIds  ];
        
        Map<Id,ContentDocumentLink> contentLinksMap=new Map<Id,ContentDocumentLink>();
        for(ContentDocumentLink cdl:links){
            if(System.Label.Restricted_Edit_Upload_Files_Objects.contains(cdl.LinkedEntity.Type)){
                contentLinksMap.put(cdl.ContentDocumentId,cdl);
            }
        }
        //ristrict upload 
        for(ContentVersion cv:cvs){ 
            if(contentLinksMap.containsKey(cv.ContentDocumentId)){
                if(!cv.Upload__c) cv.addError('Please use component to upload file');
            }
        }
        
    }
    
    @future
    private static void updateUploadFeild(List<Id> contentDocumentIds){
        List<Id> updateSuccessFiles=new List<Id>();

        List<ContentVersion> cvs=[SElect id,Upload__c,ContentDocumentId FROM ContentVersion WHERE contentDocumentId IN:contentDocumentIds];
        //Retriving entitys to which attachment is linked and filtering based on specifed object mentiond in label
        List<ContentDocumentLink> links=[SELECT LinkedEntity.Type,ContentDocumentId, Id FROM ContentDocumentLink where ContentDocumentId IN:contentDocumentIds  ];
        
        Map<Id,ContentDocumentLink> contentLinksMap=new Map<Id,ContentDocumentLink>();
        for(ContentDocumentLink cdl:links){
            if(System.Label.Restricted_Edit_Upload_Files_Objects.contains(cdl.LinkedEntity.Type)){
                contentLinksMap.put(cdl.ContentDocumentId,cdl);
            }
        }
        List<ContentVersion> updateFiles=new List<ContentVersion>();
        //get files whose upload flag is true
        for(ContentVersion cv:cvs){ 
            if(contentLinksMap.containsKey(cv.ContentDocumentId)){
                if(cv.Upload__c==true){
                    cv.Upload__c=false;
                    updateFiles.add(cv);
                }
            }
        }
        
        if(updateFiles.size()>0) update updateFiles;
    }

}