public class EventTriggerHandler extends TriggerHandler {
    
    private Map<Id, Event> newTaskMap;
    private List<Event> newTask;
   
    public EventTriggerHandler() {
        this.setMaxLoopCount(1);
        this.newTaskMap = (Map<Id, Event>) Trigger.newMap;
        this.newTask=(List<Event>) Trigger.new;
    }

    public override void afterInsert(){
        EventTriggerHelper.changeStandardContactsToInvesetmentContacts(newTaskMap.keySet());
    }
    
    public override void afterUpdate(){
       	EventTriggerHelper.changeStandardContactsToInvesetmentContacts(newTaskMap.keySet());
    }
    
}