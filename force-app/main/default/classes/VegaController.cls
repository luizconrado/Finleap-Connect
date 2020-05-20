public class VegaController {
    @AuraEnabled
    public static Map<String,List<Object>> myactivitys(){
        Date d=Date.today();
        //current Year
        Date rangeStart=Date.newInstance(d.year(), 1, 1);
        Date rangeEnd=Date.newInstance(d.year(), 12, 31);
        List<Task> taskList=[SELECT Id,ActivityDate,WhoId,WhatId,Subject,Type, TaskSubtype
                             FROM Task 
                             WHERE ActivityDate>=:rangeStart AND ActivityDate<=:rangeEnd];
        List<Event> eventList=[SELECT Id,ActivityDate,WhoId,WhatId,Subject,Type, EventSubtype 
                               FROM Event 
                               WHERE ActivityDate>=:rangeStart AND ActivityDate<=:rangeEnd];
        
        Set<String> whatIdSet=new Set<String>();
        Set<String> whoIdSet=new Set<String>();
        for(Task t:taskList){
            whatIdSet.add(t.WhatId);
            whoIdSet.add(t.WhoId);
        }
        for(Event e:eventList){
            whatIdSet.add(e.WhatId);
            whoIdSet.add(e.WhoId);
        }
        
        List<Account> accountList=[SELECT Id,Industry, Rating, Finleap_Rating__c FROM Account WHERE Id IN:whatIdSet];
        Map<String,List<Object>> returnValue=new Map<String,List<Object>>();
        returnValue.put('Task',taskList);
        returnValue.put('Event',eventList);
        returnValue.put('Account',accountList);
        return returnValue;
    }

}