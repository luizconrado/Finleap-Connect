public with sharing class ActivityTimelineController {
    
    private static WithoutSharing db{set;get{
        if(db==null)db=new WithoutSharing();
        return db;
    }}
    private static Map<Id, Opportunity> mapHiddenOpportunities = new Map<Id, Opportunity>();
    
    
    @AuraEnabled
    public static List<ActivityTimelineGroup> getActivityTimeline(Id recordId, Boolean includeChildren) {
        //Find out the Sobject type of the recordId passed
        Schema.SObjectType sobjType = recordId.getSobjectType();

        Set<Id> whatIdSet = new Set<Id>();
        Set<Id> whoIdSet = new Set<Id>();

        //Add the record passed
        if(sobjType == Schema.Contact.SObjectType) {
			whoIdSet.add(recordId);
        } else {
        	whatIdSet.add(recordId);
        }
        
        //Process Other 'Child' Objects
        if(includeChildren){
            //Process Accounts
            if(sobjType == Schema.Account.SObjectType) {
                //Contacts
                Map<Id, Contact> mapDirectContacts = new Map<Id, Contact>([SELECT Id FROM Contact WHERE AccountId =: recordId]);
                whoIdSet.addAll(mapDirectContacts.keySet());
                
                //Opportunities
                List<Opportunity> opps=[SELECT Id FROM Opportunity WHERE AccountId =: recordId];
                Map<Id, Opportunity> mapVisibleOpportunities = new Map<Id, Opportunity>(opps);
                mapHiddenOpportunities = new Map<Id, Opportunity>(db.queryOpportunity(recordId,opps));
                whatIdSet.addAll(mapHiddenOpportunities.keySet());
				whatIdSet.addAll(mapVisibleOpportunities.keySet());
               
                //Cases
                Map<Id, Case> mapDirectCases = new Map<Id, Case>([SELECT Id FROM Case WHERE AccountId =: recordId]);
                whatIdSet.addAll(mapDirectCases.keySet());
            }
            
            if(sobjType == Schema.Contact.SObjectType){
                List<OpportunityContactRole> oppContactRoleList=[SELECT Id, OpportunityId, ContactId FROM OpportunityContactRole WHERE ContactId=:recordId];
                for(OpportunityContactRole ocr:oppContactRoleList){
                    whatIdSet.add(ocr.OpportunityId);
                }
                mapHiddenOpportunities = new Map<Id, Opportunity>(db.queryOpportunityFromContactRole(recordId,oppContactRoleList));
                whatIdSet.addAll(mapHiddenOpportunities.keySet());
                
                Map<Id, Case> mapDirectCases = new Map<Id, Case>([SELECT Id FROM Case WHERE ContactId =: recordId]);
                whatIdSet.addAll(mapDirectCases.keySet());
            }
        }

        // Create a return List
        List<ActivityTimelineModel> lstAllActivities = new List<ActivityTimelineModel>();

        // Add Tasks, Emails & Events
        addTasksAndEmails(lstAllActivities, recordId, whatIdSet, whoIdSet);
        addEvents(lstAllActivities, recordId, whatIdSet, whoIdSet);
            
        return generateGroups(lstAllActivities);
    }

    private static List<ActivityTimelineGroup> generateGroups(List<ActivityTimelineModel> lstAllActivities) {
        // Sort List
        lstAllActivities.sort();

        //Filter Out Open Tasks & Activties
        List<ActivityTimelineModel> lstOpenActivities = new List<ActivityTimelineModel>();
        for(ActivityTimelineModel item : lstAllActivities){
            if(!item.isComplete){
                lstOpenActivities.add(item);
            }
        }

        //Prepare Map of grouped activities
        Map<Long, List<ActivityTimelineModel>> mapActivityTimeline = new Map<Long, List<ActivityTimelineModel>>();
        for(ActivityTimelineModel item : lstAllActivities){
            //Only Completed items
            if(item.isComplete){
                List<ActivityTimelineModel> lstActivities = new List<ActivityTimelineModel>();
                DateTime firstDayOfMonth = Datetime.newInstance(item.activityDate.year(), item.activityDate.month(), 1, 0, 0, 0);
                Long mapKey = firstDayOfMonth.getTime();
                if(mapActivityTimeline.containsKey(mapKey)){
                    lstActivities = mapActivityTimeline.get(mapKey);
                }

                lstActivities.add(item);
                mapActivityTimeline.put(mapKey, lstActivities);
            }
        }

        List<ActivityTimelineGroup> lstActivityGroups = new List<ActivityTimelineGroup>();
        //Open Activities
        lstActivityGroups.add(new ActivityTimelineGroup(System.Label.Upcoming_Overdue, lstOpenActivities));

        //Closed Activities
        For(Long dateAsLong: mapActivityTimeline.keySet()){
            ActivityTimelineGroup activityGroup = new ActivityTimelineGroup(dateAsLong, mapActivityTimeline.get(dateAsLong));
            lstActivityGroups.add(activityGroup);
        }
        
        return lstActivityGroups;
    }    
    
    private static void addTasksAndEmails(List<ActivityTimelineModel> returnList, Id recordId, Set<Id> whatIdSet, Set<Id> whoIdSet) {
        List<Task> taskList = [SELECT Id, ActivityDate, Description, IsRecurrence, OwnerId, Owner.Name, Priority, Status, Subject, 
                               				TaskSubtype, Type, WhatId, What.Name, WhoId, Who.Name
                               	FROM Task
                               	WHERE WhatId IN: whatIdSet OR WhoId IN: whoIdSet
                               		ORDER BY ActivityDate DESC NULLS LAST];
        //get not accessable records
		Map<Id,Task> privateTaskMap=new Map<Id,Task>(db.queryTask(whatIdSet,whoIdSet,taskList));
        taskList.addAll(privateTaskMap.values());
        //generate a map of Task Status to get Closed Status
        Map<String, TaskStatus> mapTaskStatus = new Map<String, TaskStatus>();
		for(TaskStatus ts: [SELECT MasterLabel, IsClosed FROM TaskStatus]){
            mapTaskStatus.put(ts.MasterLabel, ts);
		}
        
        //generate a map of Task Priority to get High Priority
        Map<String, TaskPriority> mapTaskPriority = new Map<String, TaskPriority>();
		for(TaskPriority tp: [SELECT MasterLabel, IsHighPriority FROM TaskPriority]){
            mapTaskPriority.put(tp.MasterLabel, tp);
		}
        
        //genrate map of event and whatid
        Map<String,String> taskAndWhatId=new Map<String,String>();
        for(Task t:taskList){
            taskAndWhatId.put(t.Id,t.WhatId);
        }
         

        //generate a map of Email tasks
        //The Enhanced Emails are stored in the Email Message object but they have a corresponding Task with SubType Email.
        //You need to filter those out in order to prevent duplicate records being displayed
        Map<Id, Task> mapEmailTasks = new Map<Id, Task>();
        
        if(taskList.size() > 0) {
            for(Task taskObj: taskList) {
                if(taskObj.TaskSubtype == 'Email'){
                    //Collect tasks for handling email messages separately
                    mapEmailTasks.put(taskObj.Id, taskObj);
                } else {
                    ActivityTimelineModel taskItem = new ActivityTimelineModel();
                    taskItem.recordId = taskObj.Id;
                    taskItem.sobjectName = String.valueOf(Task.SobjectType);
                    taskItem.activityTimelineType = taskObj.TaskSubtype;
                    taskItem.activityDate = taskObj.ActivityDate;
                    taskItem.subject = taskObj.Subject;
                    taskItem.detail = taskObj.Description;

                    //Assigned To
                    taskItem.assignedTo = new ActivityTimelineModel.RecordReference(taskObj.OwnerId, taskObj.Owner.Name);

                    //Recipients
                    if(String.isNotEmpty(taskObj.WhoId)){
                        //Dont add the current record in Task Contact
                        if(taskObj.WhoId != recordId){
                            taskItem.recipients = new List<ActivityTimelineModel.RecordReference>();
                            taskItem.recipients.add(new ActivityTimelineModel.RecordReference(taskObj.WhoId, taskObj.Who.Name));
                        }
                    }

                    //Related To
                    if(String.isNotEmpty(taskObj.WhatId)){
                        //Dont add the current record in related to
                        if(taskObj.WhatId != recordId){
                        	taskItem.relatedTo = new ActivityTimelineModel.RecordReference(taskObj.WhatId, taskObj.What.Name);
                        }
                    }

                    taskItem.isComplete = mapTaskStatus.get(taskObj.Status).IsClosed;
                    taskItem.isOverdue = taskObj.ActivityDate < Date.today() && !taskItem.isComplete;
                    taskItem.isRecurring = taskObj.IsRecurrence;
                    taskItem.isPriority = mapTaskPriority.get(taskObj.Priority).IsHighPriority;

                    //handle record access
                    taskItem.access=!privateTaskMap.containsKey(taskObj.Id);
                    if(!taskItem.access){
                        taskItem.subject  = 'Task - Of '+ taskObj.Owner.Name + ((String.isNotEmpty(taskObj.WhoId))?'related to '+taskObj.Who.Name:'');
                        //Related To
                        if(String.isNotEmpty(taskObj.WhatId)){
                            //Dont add the current record in related to
                            if(taskObj.WhatId != recordId){
                                taskItem.relatedTo = new ActivityTimelineModel.RecordReference((mapHiddenOpportunities.containsKey(taskObj.WhatId))?mapHiddenOpportunities.get(taskObj.WhatId).Limited_Access_Name__c:'');    
                            }
                        }
                    }
                    returnList.add(taskItem);
                }
            }

            //Process Email Tasks
            if(mapEmailTasks.size() > 0) {
                List<EmailMessage> lstEmailMessages = [SELECT Id, ActivityId, HasAttachment, MessageDate, Status, Subject, TextBody,
                                                       		(SELECT Id, RelationType, RelationId, Relation.Name, RelationAddress
                                                            	FROM EmailMessageRelations)
                                                       	FROM EmailMessage
                                                       	WHERE ActivityId IN: mapEmailTasks.keySet()];
                Map<Id,EmailMessage> privateLstEmailMessagesMap=new Map<Id,EmailMessage>(db.queryEmail(mapEmailTasks.keySet(),lstEmailMessages));

                lstEmailMessages.addAll(privateLstEmailMessagesMap.values());
                For(EmailMessage emailMsg : lstEmailMessages){
                    Task taskObj = mapEmailTasks.get(emailMsg.ActivityId);
					String limitedAccessSubject = 'Email - From ';
                    ActivityTimelineModel emailItem = new ActivityTimelineModel();
                    
                    emailItem.recordId = emailMsg.Id;
                    emailItem.sobjectName = String.valueOf(EmailMessage.SobjectType);
                    emailItem.activityTimelineType = 'Email';
                    emailItem.activityDate = emailMsg.MessageDate;
                    emailItem.subject = emailMsg.Subject;
                    emailItem.detail = emailMsg.TextBody;
                    
                    //Assigned To & Recipients
                    emailItem.recipients = new List<ActivityTimelineModel.RecordReference>();
                    For(EmailMessageRelation relationObj : emailMsg.EmailMessageRelations){
                        //Assigned To
                        if(relationObj.RelationType == 'FromAddress'){
                            
                            if(String.isNotEmpty(relationObj.relationId)){
                                emailItem.assignedTo = new ActivityTimelineModel.RecordReference(relationObj.relationId, relationObj.Relation.Name);
                                limitedAccessSubject += emailItem.assignedTo.recordName +' ';
                            } else {
                                emailItem.fromEmail = new ActivityTimelineModel.EmailReference(relationObj.RelationAddress);
                                limitedAccessSubject += emailItem.fromEmail.address +' ';
                            }
                        } else if(relationObj.RelationType == 'ToAddress'){
                            if(String.isNotEmpty(relationObj.relationId)){
                                emailItem.recipients.add(new ActivityTimelineModel.RecordReference(relationObj.relationId, relationObj.Relation.Name));
                                limitedAccessSubject +='To '+ emailItem.recipients[0].recordName +' ';
                            } else {
                                emailItem.toEmail = new ActivityTimelineModel.EmailReference(relationObj.RelationAddress);
                                limitedAccessSubject +='To '+ emailItem.toEmail.address +' ';
                            }
                        }
                    }

                    //Related To
                    if(String.isNotEmpty(taskObj.WhatId)){
                        //Dont add the current record in Related To
                        if(taskObj.WhatId != recordId){
                        	emailItem.relatedTo = new ActivityTimelineModel.RecordReference(taskObj.WhatId, taskObj.What.Name);
                        }
                    }

                    emailItem.isComplete = true;
                    emailItem.hasAttachments = emailMsg.HasAttachment;
                    
                    //handle access
                    emailItem.access=!privateLstEmailMessagesMap.containsKey(emailMsg.Id);
                    if(!emailItem.access){
                       emailItem.subject=limitedAccessSubject;
                        //Related To
                        if(String.isNotEmpty(taskObj.WhatId)){
                            //Dont add the current record in Related To
                            if(taskObj.WhatId != recordId){
                                emailItem.relatedTo = new ActivityTimelineModel.RecordReference((mapHiddenOpportunities.containsKey(taskObj.WhatId))?mapHiddenOpportunities.get(taskObj.WhatId).Limited_Access_Name__c:'');
                            }
                        }
                    }

                    returnList.add(emailItem);
                }
            }
        }
        
    }

    private static void addEvents(List<ActivityTimelineModel> returnList, Id recordId, Set<Id> whatIdSet, Set<Id> whoIdSet) {
        List<Event> eventList = [SELECT Id, ActivityDate, Description, EndDateTime, EventSubtype, IsRecurrence, OwnerId, Owner.Name, 
                                 		StartDateTime, Subject, Type, WhatId, What.Name, WhoId, Who.Name
                                	FROM Event
                                	WHERE WhatId IN: whatIdSet OR WhoId IN: whoIdSet];
        Map<Id,Event> privateEventMap=new Map<Id,Event>(db.queryEvent(whatIdSet,whoIdSet,eventList));
		eventList.addAll(privateEventMap.values());        
        //genrate map of event and whatid
        Map<String,String> eventAndWhatId=new Map<String,String>();
        for(Event e:eventList){
            eventAndWhatId.put(e.Id,e.WhatId);
        }
        
        
        if(eventList.size() > 0) {
            for(Event eventObj: eventList) {
                ActivityTimelineModel eventItem = new ActivityTimelineModel();
                eventItem.recordId = eventObj.Id;
                eventItem.sobjectName = String.valueOf(Event.SobjectType);
                eventItem.activityTimelineType = 'Event';
                eventItem.activityDate = eventObj.ActivityDate;
                eventItem.subject = eventObj.Subject;
                eventItem.detail = eventObj.Description;

                //Assigned To
                eventItem.assignedTo = new ActivityTimelineModel.RecordReference(eventObj.OwnerId, eventObj.Owner.Name);

                //Recipients
                if(String.isNotEmpty(eventObj.WhoId)){
                    if(eventObj.WhoId != recordId){
                        eventItem.recipients = new List<ActivityTimelineModel.RecordReference>();
                        eventItem.recipients.add(new ActivityTimelineModel.RecordReference(eventObj.WhoId, eventObj.Who.Name));
                    }
                }

                //Related To
                if(String.isNotEmpty(eventObj.WhatId)){
                    if(eventObj.WhatId != recordId){
                    	eventItem.relatedTo = new ActivityTimelineModel.RecordReference(eventObj.WhatId, eventObj.What.Name);
                    }
                }

                eventItem.startDateTime = eventObj.StartDateTime;
                eventItem.endDateTime = eventObj.EndDateTime;
                eventItem.isComplete = eventObj.StartDateTime < System.now();

                //handle record access
                eventItem.access=!privateEventMap.containsKey(eventObj.Id);
                if(!eventItem.access){ 
                    eventItem.subject  = 'Event - Of '+ eventObj.Owner.Name + ((String.isNotEmpty(eventObj.WhoId))?'related to '+eventObj.Who.Name:'');
                    //Related To
                    if(String.isNotEmpty(eventObj.WhatId)){
                        //Dont add the current record in related to
                        if(eventObj.WhatId != recordId){
                            
                            eventItem.relatedTo = new ActivityTimelineModel.RecordReference((mapHiddenOpportunities.containsKey(eventObj.WhatId))?mapHiddenOpportunities.get(eventObj.WhatId).Limited_Access_Name__c:'');    
                        }
                    }
                }
                returnList.add(eventItem);
            }
        }
    }	
	   
    private without sharing class WithoutSharing{
        public List<Task> queryTask(Set<Id> whatIdSet, Set<Id> whoIdSet,List<Task> taskIds){
            return [SELECT Id, ActivityDate, Description, IsRecurrence, OwnerId, Owner.Name, Priority, Status, Subject, 
                               				TaskSubtype, Type, WhatId, What.Name, WhoId, Who.Name
                               	FROM Task
                               	WHERE (WhatId IN: whatIdSet OR WhoId IN: whoIdSet)
                    			AND Id NOT IN: taskIds
                               		ORDER BY ActivityDate DESC NULLS LAST];
        }
        public List<Event> queryEvent(Set<Id> whatIdSet, Set<Id> whoIdSet,List<Event> eventIds){
            return [SELECT Id, ActivityDate, Description, EndDateTime, EventSubtype, IsRecurrence, OwnerId, Owner.Name, 
                    StartDateTime, Subject, Type, WhatId, What.Name, WhoId, Who.Name
                    FROM Event
                    WHERE (WhatId IN: whatIdSet OR WhoId IN: whoIdSet)
                    AND
                    Id NOT IN:eventIds ORDER BY ActivityDate DESC NULLS LAST
                   ];
        }
        public List<EmailMessage> queryEmail(Set<Id> mapEmailTasks,List<EmailMessage> emailIds){
            return [SELECT Id, ActivityId, HasAttachment, MessageDate, Status, Subject, TextBody,
                    (SELECT Id, RelationType, RelationId, Relation.Name, RelationAddress
                     FROM EmailMessageRelations)
                    FROM EmailMessage
                    WHERE ActivityId IN: mapEmailTasks
                    AND Id NOT IN: emailIds];
        }
        public List<Opportunity> queryOpportunity(Id accountId,List<Opportunity> oppList){
            return [SELECT Id,Limited_Access_Name__c FROM Opportunity WHERE AccountId =: accountId AND Id NOT IN:oppList];
        }
        public List<Opportunity> queryOpportunityFromContactRole(Id recordId,List<OpportunityContactRole> oppContactRoleList){
            Set<Id> oppSetId=new Set<Id>();
            for(OpportunityContactRole ocr:[SELECT Id, OpportunityId, ContactId FROM OpportunityContactRole WHERE ContactId=:recordId AND id NOT IN:oppContactRoleList]){
                oppSetId.add(ocr.OpportunityId);
            }
            return [SELECT Id,Limited_Access_Name__c FROM Opportunity WHERE Id  IN:oppSetId];
        }
    }
    
   
}