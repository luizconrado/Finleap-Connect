public class EventTriggerHandler extends TriggerHandler {
    
    private Map<Id, Event> newEventMap;
    private List<Event> newEvent;
   
    public EventTriggerHandler() {
        this.setMaxLoopCount(1);
        this.newEventMap = (Map<Id, Event>) Trigger.newMap;
        this.newEvent=(List<Event>) Trigger.new;
    }

    public override void afterInsert(){
        EventTriggerHelper.changeStandardContactsToInvesetmentContacts(newEventMap.keySet());
    }
    
    public override void afterUpdate(){
       	EventTriggerHelper.changeStandardContactsToInvesetmentContacts(newEventMap.keySet());
    }
    
}