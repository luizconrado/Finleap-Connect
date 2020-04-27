public class ContentDocumentHandler extends Triggerhandler {

    public ContentDocumentHandler() {
        this.setMaxLoopCount(1);
    }
    public override void beforedelete() {
        List<ContentDocument> files=(List<ContentDocument>) Trigger.old;
        //TODO: Think Again about user exclusion
        if(!System.Label.Users_Exclusion.contains(Userinfo.getUserEmail())) validateDelete(files);
    }
    
    private void validateDelete(List<ContentDocument> files){
        List<String> contentDocumentIds=new List<String>();
        for(ContentDocument cd:files){
            contentDocumentIds.add(cd.Id);
        }
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