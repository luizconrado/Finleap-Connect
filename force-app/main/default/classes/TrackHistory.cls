public inherited sharing class TrackHistory {
    
    public static void track(String objectName,List<sObject> newRecords,Map<id,sObject> oldRecords){
        List<String> fields=getFieldsToTrack(objectName);
        if(fields.size()==0) return;
        List<Field_History_Tracker__c> toInsertRecords=new List<Field_History_Tracker__c>();
        //Obtaining schema of object and fields
        DescribeSobjectResult objectDetails=SchemaUtility.getSobjectType(objectName);
        Map<String,DescribeFieldResult> fieldDetails=SchemaUtility.getAllObjectFields(objectDetails);
        
        for(sObject record:newRecords){
            sObject oldRecord=oldRecords.get((Id)record.get('Id'));
            for(String field:fields){
                //checking if field value is changed 
                if(record.get(field)!=oldRecord.get(field)){
                    Field_History_Tracker__c change=new Field_History_Tracker__c();
                    change.Field__c=field;
                    change.Field_Label__c=fieldDetails.get(field).getLabel();
                    change.Object_Label__c=objectDetails.getLabel();
                    change.Object__c=objectName;
                    change.Record_Id__c=(Id)record.get('Id');
                    change.Old_Value__c=String.valueOf(oldRecord.get(field));
                    change.New_Value__c=String.valueOf(record.get(field));
                    change.Record_Name__c=String.valueOf(record.get('Name'));
                    change.Relation__c='On Record';
                    toInsertRecords.add(change);
                }
            }
        }
        if(toInsertRecords.size()>0) insert toInsertRecords;
    }
    
       
    private static List<String> getFieldsToTrack(String ObjectName){
        //get field names that needs to be tracked
        List<Filed_History_Tracker__mdt> fieldConfig=[SELECT Fields__c FROM Filed_History_Tracker__mdt WHERE DeveloperName=:ObjectName];
        List<String> fields=new List<String>();
        if(fieldConfig.size()>0) fields=fieldConfig.get(0).Fields__c.split(',');
        return fields;
    }

    
    
}