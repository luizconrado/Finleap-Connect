public class Permission {
    
    public static Map<String,Boolean> getActitvityAccess(Map<String,String> activityAndWhatId){
        Map<String,List<Id>> oppAndEvenId=new Map<String,List<Id>>();
        Map<String,Boolean> taskAndAccess=new Map<String,Boolean>();
        Activity_Access__c accessSettings = Activity_Access__c.getInstance(userinfo.getProfileId());
        List<Id> oppIds=new List<Id>();
        for(String activityId:activityAndWhatId.keySet()){
            Id whatId=activityAndWhatId.get(activityId);
            if(whatId.getSObjectType()==Schema.Opportunity.SObjectType){
                if(!oppAndEvenId.containsKey(whatId)){
                    oppAndEvenId.put(whatId,new List<String>());
                }
                oppAndEvenId.get(whatId).add(activityId);
                oppIds.add(whatId);
            }
        }
        List<Opportunity> relatedOpp = [SELECT Id,RecordType.DeveloperName,RecordType.Name From Opportunity WHERE id IN:oppIds];
        for(Opportunity opp:relatedOpp){
            Boolean isAccessable=(Boolean)accessSettings.get((String)opp.RecordType.DeveloperName+'__c');
            for(String taskId:oppAndEvenId.get(opp.id)){
                taskAndAccess.put(taskId,isAccessable);
            }
        }
        return taskAndAccess;
    }

}