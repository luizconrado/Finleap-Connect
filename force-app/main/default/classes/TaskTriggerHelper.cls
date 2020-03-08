public inherited sharing class TaskTriggerHelper {
    
    //HACK: Future Method is Needed as TaskRelation takes some time to be inserted in database
    @future
    public static void changeStandardContactsToInvesetmentContacts(Final Set<Id> newTaskIds){
        List<TaskRelation> relatedOpportunityAndContact=getOpportunityAndContactRelation(newTaskIds);
        Map<String,List<String>> taskIdAndStandardContacts=getStandardContactsOfInvestmentOpportunity(relatedOpportunityAndContact);
        List<String> contactIds=new List<String>();
        for(String taskId:taskIdAndStandardContacts.keySet()){
            contactIds.addAll(taskIdAndStandardContacts.get(taskId));
        }
        if(!contactIds.isEmpty()) convertStandardContactToInvestmentContact(contactIds);
    }
    private static List<TaskRelation> getOpportunityAndContactRelation(Final Set<Id> newTasks){
        return [SELECT Id,RelationId,Relation.Type,TaskId,Relation.RecordTypeId FROM TaskRelation WHERE TaskId IN:newTasks AND (Relation.Type='Opportunity' OR Relation.Type='Contact')];
    }
    private static Map<String,List<String>> getStandardContactsOfInvestmentOpportunity(Final List<TaskRelation> opportunityAndContactRelation){
        Map<Id,TaskRelation> investmentOpportunitys=new Map<Id,TaskRelation>();
        Map<Id,List<TaskRelation>> contactRelations=new Map<Id,List<TaskRelation>>();
        Map<String,List<String>> taskContactMap=new Map<String,List<String>>();
	
        //Getting Investment Opportunity and Standard Contacts
        for(TaskRelation tr:opportunityAndContactRelation){
            if(tr.Relation.RecordTypeId==Constant.OPPORTUNITY_FINLEAP_INVESTMENT_RECORDTYPE_ID){
                investmentOpportunitys.put(tr.TaskId,tr);
            }
            
            if(tr.Relation.RecordTypeId==Constant.CONTACT_STANDARD_RECORDTYPE_ID){
                if(!contactRelations.containsKey(tr.TaskId)){
                    contactRelations.put(tr.TaskId,new List<TaskRelation>());
                }
                contactRelations.get(tr.TaskId).add(tr);
            }
        }
        
        //Getting Standard Contacts For the Investment opportunity
        for(Id taskId:investmentOpportunitys.keySet()){
            if(contactRelations.containsKey(taskId)){
                for(TaskRelation contact:contactRelations.get(taskId)){
                    if(!taskContactMap.containsKey(taskId)){
                        taskContactMap.put(taskId,new List<String>());
                    }
                    taskContactMap.get(taskId).add(contact.RelationId);
                }
            }
        }
        
        return taskContactMap;
    }
    private static List<DatabaseResponse>  convertStandardContactToInvestmentContact(Final List<String> contactIds){
        List<Contact> toChangeRecordType=new List<Contact>();
        //NOTE:Proccess Builder changes the record type based on Finleap_Contact_Type__c field value
        for(String contactId:contactIds){
            toChangeRecordType.add(new Contact(Id=contactId,Finleap_Contact_Type__c='Investment'));
        }
        List<DatabaseResponse> response=DatabaseUtility.updateRecords(toChangeRecordType);
        DatabaseResponse.logError(response,'TaskTriggerHandler');
        return response;
    }
    
}