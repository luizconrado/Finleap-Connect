public class ContentDocumentHandler extends Triggerhandler {

    public ContentDocumentHandler() {
        this.setMaxLoopCount(1);
    }
    public override void beforedelete() {
        List<ContentDocument> files=(List<ContentDocument>) Trigger.old;
        if(!System.Label.File_Delete_Users_Exclusion.contains(Userinfo.getUserEmail())) validateDelete(files);
    }
    
    private void validateDelete(List<ContentDocument> files){
        List<String> contentDocumentIds=new List<String>();
        for(ContentDocument cd:files){
            contentDocumentIds.add(cd.Id);
        } 
        //Retriving entitys to which attachment is linked and filtering based on specifed object mentiond in label
        List<ContentDocumentLink> links=[SELECT LinkedEntity.Type,ContentDocumentId, Id FROM ContentDocumentLink where ContentDocumentId IN:contentDocumentIds  ];
        Map<Id,ContentDocumentLink> contentLinksMap=new Map<Id,ContentDocumentLink>();
        for(ContentDocumentLink cdl:links){
            if(System.Label.Restricted_Edit_Upload_Files_Objects.contains(cdl.LinkedEntity.Type)){
                contentLinksMap.put(cdl.ContentDocumentId,cdl);
            }
        }
        for(ContentDocument file:files){ 
            if(contentLinksMap.containsKey(file.Id)){
                file.addError('Insufficient access');
            }
        }
    }
 
}