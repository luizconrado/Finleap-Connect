public class vegaReportController {
    
    @AuraEnabled
    public static List<ActivityTimelineGroup> getActivitysToday(String recordId){
        
        Set<Id> accountId=new Set<Id>();
        accountId.add(recordId);
        
        Set<Id> whatIdSet = new Set<Id>();
        Set<Id> whoIdSet = new Set<Id>();
		Set<Id> eventIdSet=new Set<id>();
        Set<Id> taskIdSet=new Set<Id>();
        whatIdSet.add(recordId);
        
        //Contacts
        Map<Id, Contact> mapDirectContacts = new Map<Id, Contact>([SELECT Id FROM Contact WHERE AccountId IN: accountId]);
        whoIdSet.addAll(mapDirectContacts.keySet());
        eventIdSet.addAll(queryEventRelation(mapDirectContacts.keySet()));
        taskIdSet.addAll(queryTaskRelation(mapDirectContacts.keySet()));
        
        //Opportunities
        List<Opportunity> opps=[SELECT Id FROM Opportunity WHERE AccountId IN: accountId];
        Map<Id, Opportunity> mapVisibleOpportunities = new Map<Id, Opportunity>(opps);
        whatIdSet.addAll(mapVisibleOpportunities.keySet());
        
        //Cases
        Map<Id, Case> mapDirectCases = new Map<Id, Case>([SELECT Id FROM Case WHERE AccountId IN: accountId]);
        whatIdSet.addAll(mapDirectCases.keySet());
        
        // Create a return List
        List<ActivityTimelineModel> lstAllActivities = new List<ActivityTimelineModel>();
        
        // Add Tasks, Emails & Events
        addTasksAndEmails(lstAllActivities, recordId, whatIdSet, whoIdSet,taskIdSet);
        addEvents(lstAllActivities, recordId, whatIdSet, whoIdSet,eventIdSet);
        List<ActivityTimelineGroup> groups=generateGroups(lstAllActivities);
        for(ActivityTimelineGroup g:groups){
            system.debug(g.name);
        }
        return groups;
    }
    private static  List<ActivityTimelineGroup> generateGroups(List<ActivityTimelineModel> lstAllActivities) {
        // Sort List
        lstAllActivities.sort();

        //Prepare Map of grouped activities
        Map<String, List<ActivityTimelineModel>> mapActivityTimeline = new Map<String, List<ActivityTimelineModel>>();
        for(ActivityTimelineModel item : lstAllActivities){
            System.debug('Item '+item);
            List<ActivityTimelineModel> lstActivities = new List<ActivityTimelineModel>();
            String mapKey ='';
            system.debug('item.relatedTo'+item.relatedTo);
            if(item.relatedTo.sobjectName!=null)
                mapKey += item.relatedTo.sobjectName+'-';
            if(item.relatedTo.recordName!=null)
                mapKey += item.relatedTo.recordName;
            if(mapActivityTimeline.containsKey(mapKey)){
                lstActivities = mapActivityTimeline.get(mapKey);
            }
            
            lstActivities.add(item);
            mapActivityTimeline.put(mapKey, lstActivities);
        }
        
        List<ActivityTimelineGroup> lstActivityGroups = new List<ActivityTimelineGroup>();
       
        For(String recordRefrence: mapActivityTimeline.keySet()){
            ActivityTimelineGroup activityGroup = new ActivityTimelineGroup(recordRefrence, mapActivityTimeline.get(recordRefrence));
            lstActivityGroups.add(activityGroup);
        }
    
        return lstActivityGroups;
    }   
    
    private static void addTasksAndEmails(List<ActivityTimelineModel> returnList, Id recordId, Set<Id> whatIdSet, Set<Id> whoIdSet,Set<Id> taskIdSet) {
        
        
        List<Task> taskList = [SELECT Id, ActivityDate,CreatedDate, Description, IsRecurrence, OwnerId, Owner.Name, Priority, Status, Subject, 
                               TaskSubtype, Type, WhatId, What.Name, WhoId, Who.Name
                               FROM Task
                               WHERE (WhatId IN: whatIdSet OR WhoId IN: whoIdSet OR Id IN:taskIdSet) AND CreatedDate>=:Date.Today()
                               ORDER BY ActivityDate DESC NULLS LAST];
        
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
        
        
        //generate a map of Email tasks
        //The Enhanced Emails are stored in the Email Message object but they have a corresponding Task with SubType Email.
        //You need to filter those out in order to prevent duplicate records being displayed
        Map<Id, Task> mapEmailTasks = new Map<Id, Task>();
        
        if(taskList.size() > 0) {
            for(Task taskObj: taskList) {
                if(taskObj.TaskSubtype == 'Email'){
                    //Collect tasks for handling email messages separately
                    mapEmailTasks.put(taskObj.Id, taskObj);
                }
                else {
                    ActivityTimelineModel taskItem = new ActivityTimelineModel();
                    taskItem.recordId = taskObj.Id;
                    taskItem.createdDate=taskObj.CreatedDate;
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
                            taskItem.relatedTo = new ActivityTimelineModel.RecordReference(taskObj.WhatId, taskObj.What.Name);
                    }
                    
                    taskItem.isComplete = mapTaskStatus.get(taskObj.Status).IsClosed;
                    taskItem.isOverdue = taskObj.ActivityDate < Date.today() && !taskItem.isComplete;
                    taskItem.isRecurring = taskObj.IsRecurrence;
                    taskItem.isPriority = mapTaskPriority.get(taskObj.Priority).IsHighPriority;
                    
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
                For(EmailMessage emailMsg : lstEmailMessages){
                    Task taskObj = mapEmailTasks.get(emailMsg.ActivityId);
                    String limitedAccessSubject = 'Email - from ';
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
                                limitedAccessSubject +='to '+ emailItem.recipients[0].recordName +' ';
                            } else {
                                emailItem.toEmail = new ActivityTimelineModel.EmailReference(relationObj.RelationAddress);
                                limitedAccessSubject +='to '+ emailItem.toEmail.address +' ';
                            }
                        }
                    }
                    
                    //Related To
                    if(String.isNotEmpty(taskObj.WhatId)){
                            emailItem.relatedTo = new ActivityTimelineModel.RecordReference(taskObj.WhatId, taskObj.What.Name);
                    }
                    
                    emailItem.isComplete = true;
                    emailItem.hasAttachments = emailMsg.HasAttachment;
                    
                    returnList.add(emailItem);
                }
            }
        }
        
    }

    private static void addEvents(List<ActivityTimelineModel> returnList, Id recordId, Set<Id> whatIdSet, Set<Id> whoIdSet,Set<Id> eventIdSet) {
        
        
        List<Event> eventList = [SELECT Id, ActivityDate, Description, EndDateTime, EventSubtype, IsRecurrence, OwnerId, Owner.Name,CreatedDate, 
                                 StartDateTime, Subject, Type, WhatId, What.Name, WhoId, Who.Name
                                 FROM Event
                                 WHERE (WhatId IN: whatIdSet OR WhoId IN: whoIdSet OR Id IN: eventIdSet) AND CreatedDate>=:Date.Today()];
        
        
        
        if(eventList.size() > 0) {
            for(Event eventObj: eventList) {
                ActivityTimelineModel eventItem = new ActivityTimelineModel();
                eventItem.recordId = eventObj.Id;
                eventItem.createdDate=eventObj.CreatedDate;
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
                        eventItem.relatedTo = new ActivityTimelineModel.RecordReference(eventObj.WhatId, eventObj.What.Name);
                }
                
                eventItem.startDateTime = eventObj.StartDateTime;
                eventItem.endDateTime = eventObj.EndDateTime;
                eventItem.isComplete = eventObj.StartDateTime < System.now();
                
                returnList.add(eventItem);
            }
        }
    }	
    
    
    private static Set<Id> queryEventRelation(Set<Id> ids){
        Set<Id> eventIdSet=new Set<Id>();
        List<EventRelation> er=[SELECT Id, RelationId, EventId FROM EventRelation WHERE RelationId IN:ids];
        for(EventRelation e:er) eventIdSet.add(e.EventId);
        return eventIdSet;
    }
    private static Set<Id> queryTaskRelation(Set<Id> ids){
        Set<Id> taskIdSet=new Set<Id>();
        List<TaskRelation> tr=[SELECT Id, RelationId, TaskId FROM TaskRelation WHERE RelationId IN:ids];
        for(TaskRelation t:tr) taskIdSet.add(t.TaskId);
        return taskIdSet;
    }

}