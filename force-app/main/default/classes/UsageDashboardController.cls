public without sharing class UsageDashboardController {
    
    @AuraEnabled(Cacheable=true)
    public static List<Field_History_Tracker__c> fetchAllTrackingRecords(){
        Date d=Date.today();
        //current Year
        Date rangeStart=Date.newInstance(d.year(), 1, 1);
        Date rangeEnd=Date.newInstance(d.year(), 12, 31);
        return [SELECT Id,CreatedDate, Relation__c,User__r.ProfileId,RecordTypeId,RecordType.Name,User__r.Profile.Name, User__c,User__r.Name, Field_Label__c, Field__c, Object_Label__c, Name, Object__c, Record_Id__c, Record_Name__c, Record__c, New_Value__c, Old_Value__c FROM Field_History_Tracker__c 
                WHERE CreatedDate >:rangeStart AND CreatedDate <:rangeEnd LIMIT 50000];
    }
    
    @AuraEnabled
    public static Map<String,List<Object>> getLoginHistory(){
        List<User> usermap = [Select ProfileId,Profile.Name,Name,Id,Lastname, Firstname from User where  isactive = true];
        List<User> admin=[select id from user where alias IN ('sysadmin','sec','integ','Chatter') LIMIT 1];
        List<LoginHistory> logs= [SELECT LoginUrl ,Application,Browser,LoginTime,LoginType,SourceIp,UserId  FROM LoginHistory WHERE UserId!=:admin ORDER BY LoginTime DESC LIMIT 50000];
        return new Map<String,List<Object>>{'Users'=>usermap,'Logins'=>logs};
	}
}