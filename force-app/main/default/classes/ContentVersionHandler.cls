public class ContentVersionHandler  extends Triggerhandler {

    public ContentVersionHandler() {
        this.setMaxLoopCount(1);
    }
    
    public override void beforeInsert() {
        List<ContentVersion> cvs=(List<ContentVersion>) Trigger.new;
        for(ContentVersion cv:cvs){ 
            if(!System.Label.Users_Exclusion.contains(Userinfo.getUserEmail())){
                if(!cv.Upload__c){
                    cv.addError('Please use component to upload file');
                }
            }
            cv.Upload__c=false;    
        }
    }

}