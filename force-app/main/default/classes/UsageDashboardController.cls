public class UsageDashboardController {
    
    @AuraEnabled(cacheable=true)
    public static List<DateTime> getPastYearWeeks(){
        Date currentDate=Date.today();
        Date lastyearDate=currentDate.addYears(-1);
        List<DateTime> weeks=new List<DateTime>();
        for(Integer i=0;i<53;i++){
            Date monday=lastyearDate.toStartOfWeek();
            DateTime  week=DateTime.newInstanceGmt(monday.toStartOfWeek(), Time.NewInstance(12,0,0,0));
            weeks.add(week);
            lastyearDate=lastyearDate.addDays(7);
        }
        return weeks;
    }
    
    @AuraEnabled
    public static List<Field_History_Tracker__c> fetchAllTrackingRecords(String startDate,String endDate){
        List<String> s=startDate.split('/');
        DateTime rangeStart=DateTime.newInstance(Integer.valueOf(s[2]), Integer.valueOf(s[0]), Integer.valueOf(s[1]),0,0,0); 
        List<String> e=endDate.split('/');
        DateTime rangeEnd=DateTime.newInstance(Integer.valueOf(e[2]), Integer.valueOf(e[0]), Integer.valueOf(e[1]),24,0,0); 
        return [SELECT Id,CreatedDate, Relation__c,User__r.ProfileId,RecordTypeId,RecordType.Name,User__r.Profile.Name, User__c,User__r.Name, Field_Label__c, Field__c, Object_Label__c, Name, Object__c, Record_Id__c, Record_Name__c, Record__c, New_Value__c, Old_Value__c FROM Field_History_Tracker__c 
                WHERE CreatedDate >=:rangeStart AND CreatedDate <=:rangeEnd LIMIT 25000];
    }
    
    @AuraEnabled
    public static Map<String,List<Object>> getLoginHistory(String startDate,String endDate){
        List<String> s=startDate.split('/');
        DateTime rangeStart=DateTime.newInstance(Integer.valueOf(s[2]), Integer.valueOf(s[0]), Integer.valueOf(s[1]),0,0,0); 
        List<String> e=endDate.split('/');
        DateTime rangeEnd=DateTime.newInstance(Integer.valueOf(e[2]), Integer.valueOf(e[0]), Integer.valueOf(e[1]),24,0,0); 
       String sysAdminId='0052o000009g7TrAAI';
        Integer queryLimit=(Test.isRunningTest())?1:25000;
        List<User> usermap = [Select ProfileId,Profile.Name,Name,Id,Lastname, Firstname from User where  UserType ='Standard' AND isactive = true];
        List<User> exclustionlist=[select id from user where UserType !='Standard' OR Id=:sysAdminId];
        List<LoginHistory> logs= [SELECT LoginUrl ,Application,Browser,LoginTime,LoginType,SourceIp,UserId  
                                  FROM LoginHistory
                                  WHERE UserId NOT IN:exclustionlist 
                                  AND LoginTime>=:rangeStart
                                  AND LoginTime<=:rangeEnd
                                  ORDER BY LoginTime DESC LIMIT :queryLimit];
        return new Map<String,List<Object>>{'Users'=>usermap,'Logins'=>logs};
	}
}