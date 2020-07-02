public class ContactTriggerHandler  extends Triggerhandler {
    
    public ContactTriggerHandler() {
        this.setMaxLoopCount(10);
    }
    public override void afterupdate(){
        List<Contact> newContactList=(List<Contact>) Trigger.new;
        Map<Id,Contact> oldContactMap=(Map<Id,Contact>) Trigger.oldMap;
        
        //track record changes
        if(!System.Label.Track_History_Exclusion.contains(Userinfo.getUserName()))
        TrackHistory.publishChanges('Contact', newContactList,oldContactMap);
    }

}