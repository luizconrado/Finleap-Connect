public inherited sharing class TrackHistory {
    @future 
    public static void track(String objectName,String newRecordsListJSON,string oldRecordsMapJSON){
        System.debug('TrackHistory=>track');
        List<sObject> newRecords=(List<sObject>)JSON.deserialize(newRecordsListJSON, List<sObject>.class);
        Map<id,sObject> oldRecords=(Map<id,sObject>)JSON.deserialize(oldRecordsMapJSON, Map<id,sObject>.class);
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
                if(record.getPopulatedFieldsAsMap().containsKey(field) && record.get(field)!=oldRecord.get(field)){
                    Field_History_Tracker__c change=new Field_History_Tracker__c();
                    change.Field__c=field;
                    change.Field_Label__c=fieldDetails.get(field).getLabel();
                    change.Object_Label__c=objectDetails.getLabel();
                    change.Object__c=objectName;
                    change.Record_Id__c=(Id)record.get('Id');
                    change.Old_Value__c=String.valueOf(oldRecord.get(field));
                    change.New_Value__c=String.valueOf(record.get(field));
                    change.Record_Name__c=String.valueOf(record.get(getFieldApiForName(objectName)));
                    change.Relation__c='On Record';
                    change.User__c=Userinfo.getUserId();
                    change.RecordTypeId=Constant.TRACK_FIELD_CHANGE_RECORDTYPE_ID;
                    toInsertRecords.add(change);
                }
            }
        }
        if(toInsertRecords.size()>0) insert toInsertRecords;
    }
    
    public static void captureChanges(List<Tracking_Events__e> changes){
        //creating map of object and schema
        Map<String,DescribeSobjectResult> objectDescriptionMap=new Map<String,DescribeSobjectResult>();
        Map<String,Map<String,DescribeFieldResult>> objectFieldsMap=new Map<String,Map<String,DescribeFieldResult>>();
        for(Tracking_Events__e event:changes){
            if(!objectDescriptionMap.containsKey(event.Object__c)){
                objectDescriptionMap.put(event.Object__c,null);
            }
            if(!objectFieldsMap.containsKey(event.Object__c)){
                objectFieldsMap.put(event.Object__c,null);
            }
        }
        //Obtaining schema of object and fields
        for(String objectName:objectDescriptionMap.keySet()){
            DescribeSobjectResult objectDetails=SchemaUtility.getSobjectType(objectName);
            objectDescriptionMap.put(objectName,objectDetails);
            objectFieldsMap.put(objectName,SchemaUtility.getAllObjectFields(objectDetails));
        }
        List<Field_History_Tracker__c> toInsertRecords=new List<Field_History_Tracker__c>();
        //create Records
        for(Tracking_Events__e event:changes){
            Field_History_Tracker__c change=new Field_History_Tracker__c();
            change.Relation__c='On Record';
            change.RecordTypeId=Constant.TRACK_FIELD_CHANGE_RECORDTYPE_ID;
            change.Field__c=event.Field__c;
            change.Object__c=event.Object__c;
			change.Record_Id__c=event.Record_Id__c;
            change.Old_Value__c=event.Old_Value__c;
            change.New_Value__c=event.New_Value__c;
            change.Record_Name__c=event.Record_Name__c;
            change.User__c=event.User_Id__c;
            if(objectDescriptionMap.containsKey(event.Object__c)) change.Field_Label__c=objectDescriptionMap.get(event.Object__c).getLabel();
            if(objectFieldsMap.containsKey(event.Object__c)) change.Object_Label__c=objectFieldsMap.get(event.Object__c).get(event.Field__c).getLabel();
            toInsertRecords.add(change);
        }
        if(toInsertRecords.size()>0) insert toInsertRecords;
        
    }
    
    public static void publishChanges(String objectName,List<sObject> newRecords,Map<id,sObject> oldRecords){
        //check configuration
        List<String> fields=getFieldsToTrack(objectName);
        if(fields.size()==0) return;
        List<Tracking_Events__e> toPublishRecords=new List<Tracking_Events__e>();
        for(sObject record:newRecords){
            sObject oldRecord=oldRecords.get((Id)record.get('Id'));
            for(String field:fields){
                //checking if field value is changed 
                if(record.getPopulatedFieldsAsMap().containsKey(field) && record.get(field)!=oldRecord.get(field)){
                    Tracking_Events__e e=New Tracking_Events__e();
                    e.Field__c=field;
                    e.Object__c=objectName;
                    e.Record_Id__c=String.valueOf(record.get('Id'));
                    e.Record_Name__c=String.valueOf(record.get(getFieldApiForName(objectName)));
                    e.New_Value__c=String.valueOf(record.get(field));
                    e.Old_Value__c=String.valueOf(oldRecord.get(field));
                    e.User_Id__c=Userinfo.getUserId();
                    toPublishRecords.add(e);
                }
            }
        }
        if(toPublishRecords.size()>0) EventBus.publish(toPublishRecords);
    }
    
       
    private static List<String> getFieldsToTrack(String ObjectName){
        //get field names that needs to be tracked
        List<History_Tracker__mdt> fieldConfig=[SELECT Fields__c FROM History_Tracker__mdt WHERE DeveloperName=:ObjectName AND Track_Fields__c=True];
        List<String> fields=new List<String>();
        if(fieldConfig.size()>0) fields=fieldConfig.get(0).Fields__c.split(',');
        return fields;
    }
    
    private static String getFieldApiForName(String objectName){
        String name='Name';
        if(objectName=='Task' || objectName=='Event' ) name='Subject';
        if(objectName=='Case') name='CaseNumber';
        return name;
    }

    
    
}