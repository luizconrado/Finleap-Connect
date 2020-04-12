public class ContentDocumentHandler extends Triggerhandler {

    public ContentDocumentHandler() {
        this.setMaxLoopCount(1);
    }
    public override void beforedelete() {
        List<ContentDocument> files=(List<ContentDocument>) Trigger.old;
        for(ContentDocument file:files){
            if(!System.Label.Users_Exclusion.contains(Userinfo.getUserEmail()))
                file.addError('Insufficient access');
        }
        
    }
 
}