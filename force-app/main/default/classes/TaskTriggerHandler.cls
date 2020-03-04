public with  sharing class TaskTriggerHandler extends TriggerHandler {
    private Map<Id, Task> newTaskMap;
    private List<Task> newTask;
    
    public TaskTriggerHandler() {
        this.setMaxLoopCount(1);
        this.newTaskMap = (Map<Id, Task>) Trigger.newMap;
        this.newTask=(List<Task>) Trigger.new;
    
    }
    
    public override void afterInsert(){
        List<String> investmentTaskIds=new List<String>();
        For(Task t:newTask){
            if(t.RecordTypeId==Constant.TASK_FINLEAP_INVESTMENT_RECORDTYPE_ID){
                investmentTaskIds.add(t.Id);
            }
        }
        processInvestmentTask(investmentTaskIds);
    }
    
    @future
    private static void processInvestmentTask(Final List<String> investmentTasks){
        if(investmentTasks.isEmpty()) return;
        
        String CONTACT_INVESTMENT='Investment';
        Map<Id,TaskRelation> investmentOpportunitys=new Map<Id,TaskRelation>();
        Map<Id,List<TaskRelation>> contactRelations=new Map<Id,List<TaskRelation>>();
        Map<String,List<String>> taskContactMap=new Map<String,List<String>>();
        List<Contact> toChangeRecordType=new List<Contact>();
    
        //Getting investment Opportunity Task and respective Contacts
        for(TaskRelation tr:[SELECT Id,RelationId, TaskId,Relation.RecordTypeId FROM TaskRelation WHERE TaskId IN:investmentTasks AND (Relation.Type='Opportunity' OR Relation.Type='Contact')]){
            
            if(tr.Relation.RecordTypeId==Constant.OPPORTUNITY_FINLEAP_INVESTMENT_RECORDTYPE_ID){
                investmentOpportunitys.put(tr.TaskId,tr);
            }
            
            if(tr.Relation.RecordTypeId==Constant.CONTACT_FINLEAP_INVESTMENT_RECORDTYPE_ID || tr.Relation.RecordTypeId==Constant.CONTACT_STANDARD_RECORDTYPE_ID){
                if(!contactRelations.containsKey(tr.TaskId)){
                    contactRelations.put(tr.TaskId,new List<TaskRelation>());
                }
                contactRelations.get(tr.TaskId).add(tr);
            }
        }
        
        //Getting Standard Contacts for the investment opportunity
        for(Id taskId:investmentOpportunitys.keySet()){
            if(contactRelations.containsKey(taskId)){
                for(TaskRelation contact:contactRelations.get(taskId)){
                    if(contact.Relation.RecordTypeId==Constant.CONTACT_STANDARD_RECORDTYPE_ID){
                        if(!taskContactMap.containsKey(taskId)){
                            taskContactMap.put(taskId,new List<String>());
                        }
                        taskContactMap.get(taskId).add(contact.RelationId);
                    }
                }
            }
        }
        
        //Converting Standard Contacts to investment Contact
        For(String taskId:taskContactMap.keySet()){
            for(String contactId:taskContactMap.get(taskId)){
                toChangeRecordType.add(new Contact(Id=contactId,Finleap_Contact_Type__c=CONTACT_INVESTMENT));
            }
        }
        
        List<DatabaseResponse> response=DatabaseUtility.updateRecords(toChangeRecordType);
        DatabaseResponse.logError(response,'TaskTriggerHandler');
       	
    }
}