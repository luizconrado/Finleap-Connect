public with  sharing class TaskTriggerHandler extends TriggerHandler {
    private Map<Id, Task> newTaskMap;
    private List<Task> newTask;
   
    public TaskTriggerHandler() {
        this.setMaxLoopCount(1);
        this.newTaskMap = (Map<Id, Task>) Trigger.newMap;
        this.newTask=(List<Task>) Trigger.new;
    }
    
    public override void afterInsert(){
        TaskTriggerHelper.changeStandardContactsToInvesetmentContacts(newTaskMap.keySet());
    }
    
    public override void afterUpdate(){
       	TaskTriggerHelper.changeStandardContactsToInvesetmentContacts(newTaskMap.keySet());
    }
    
  
    
    
}