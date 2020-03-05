public with  sharing class TaskTriggerHandler extends TriggerHandler {
    private Map<Id, Task> newTaskMap;
    private List<Task> newTask;
    
    public TaskTriggerHandler() {
        this.setMaxLoopCount(1);
        this.newTaskMap = (Map<Id, Task>) Trigger.newMap;
        this.newTask=(List<Task>) Trigger.new;
    
    }
    
    public override void afterInsert(){
        Map<Id,Task> investmentTasks=new Map<Id,Task>();
        For(Task t:newTask){
            if(t.RecordTypeId==Constant.TASK_FINLEAP_INVESTMENT_RECORDTYPE_ID){
                investmentTasks.put(t.Id,t);
            }
        }
		TaskTriggerHelper.processInvestmentTasks(investmentTasks);
    }
    
    
}