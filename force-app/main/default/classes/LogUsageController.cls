public with sharing class LogUsageController {
    
    @AuraEnabled 
    public static void logEntry(String recordId,String objectName){
        if(recordId==null && objectName==null) logHomePageEntry();
        //Check for status
        List<History_Tracker__mdt> fieldConfig=[SELECT Id FROM History_Tracker__mdt WHERE Object__c=:objectName AND Track_Usage__c=True];
        if(fieldConfig.size()==0) return;
        //Check if record created in past 5 min
        DateTime pastFiveMin=DateTime.now();
        pastFiveMin=pastFiveMin.addMinutes(-5);  
        List<Field_History_Tracker__c> exsists=[SELECT id FROM Field_History_Tracker__c WHERE Record_Id__c=:recordId AND CreatedDate>=:pastFiveMin];
        if(exsists.size()>0) return;
        //query record name 
        String name='Name';
        if(objectName=='Task' || objectName=='Event' ) name='Subject';
        if(objectName=='Case') name='CaseNumber';
        if(objectName=='Contact') name='LastName';

        String query='SELECT Id,'+name+' FROM '+objectName+' WHERE Id=:recordId';
        List<Sobject> result=database.query(query);
        if(result.size()==0) return;
        //get object details
        DescribeSobjectResult objectDetails=SchemaUtility.getSobjectType(objectName);
        Field_History_Tracker__c log=new Field_History_Tracker__c();
        //insert log
        log.Object_Label__c=objectDetails.getLabel();
        log.Object__c=objectName;
        log.Record_Id__c=String.valueOf(result.get(0).get('Id'));
        log.Record_Name__c=String.valueOf(result.get(0).get(name));
        log.User__c=Userinfo.getUserId();
        log.RecordTypeId=Constant.TRACK_USAGE_HISTORY_RECORDTYPE_ID;
		insert log;
    }
    
    private static void logHomePageEntry(){
        Field_History_Tracker__c log=new Field_History_Tracker__c();
        //insert log
        log.Object_Label__c='Home';
        log.Object__c='HomePage';
        log.User__c=Userinfo.getUserId();
        log.RecordTypeId=Constant.TRACK_USAGE_HISTORY_RECORDTYPE_ID;
        insert log;
    }

}