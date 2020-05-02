public inherited  sharing class SchemaUtility {
    
    public static string getRecordTypeName(Final String recordTypeId,Final String objectAPIName){
        Schema.DescribeSObjectResult sobjectResult = Schema.getGlobalDescribe().get(objectAPIName).getDescribe();
        if(sobjectResult!=null){
            List<Schema.RecordTypeInfo> recordTypeInfo = sobjectResult.getRecordTypeInfos();
            for(Schema.RecordTypeInfo info : recordTypeInfo){
                if(info.getRecordTypeId()==recordTypeId){
                    return info.getDeveloperName();
                }
            }    
        }
        return '';
    }
   
    public static string getRecordTypeId(Final String recordTypeDevName,Final String objectAPIName){
        Schema.DescribeSObjectResult sobjectResult = Schema.getGlobalDescribe().get(objectAPIName).getDescribe();
        if(sobjectResult!=null){
            List<Schema.RecordTypeInfo> recordTypeInfo = sobjectResult.getRecordTypeInfos();
            for(Schema.RecordTypeInfo info : recordTypeInfo){
                if(info.getDeveloperName()==recordTypeDevName){
                    return info.getRecordTypeId();
                }
            }    
        }
        return '';
    }
    
    public static FieldSet[] getFieldSetMembers(String objectName , String fieldSetName){
        List<FieldSet> wrapperList = new List<FieldSet>();
        Schema.SObjectType sObj = Schema.getGlobalDescribe().get(objectName);
        for(Schema.FieldSetMember fieldMember : sObj.getDescribe().fieldSets.getMap().get(fieldSetName).getFields()){
            FieldSet wrapper = new FieldSet();
            wrapper.isDBRequired = fieldMember.getDbRequired();
            wrapper.isRequired = fieldMember.getRequired();
            wrapper.fieldType = String.valueOf(fieldMember.getType());
            wrapper.fieldLabel = fieldMember.getLabel();
            wrapper.fieldAPIName = fieldMember.getFieldPath();
            if(String.valueOf(fieldMember.getType()) == 'PICKLIST' || 
               String.valueOf(fieldMember.getType()) == 'MULTIPICKLIST'){
                   wrapper.pickListValues = sObj.getDescribe().fields.getMap().get(fieldMember.getFieldPath())
                       .getDescribe().getPicklistValues();
               }
            wrapperList.add(wrapper);
        }
        
        return wrapperList;
    }
    
    public static Map<String,PicklistEntry[]> getObjectPicklistFileds(String objectAPIName){
        Schema.DescribeSObjectResult sObjectName = Schema.getGlobalDescribe().get(objectAPIName).getDescribe();
        Map<String,PicklistEntry[]> picklistValues=new Map<String,PicklistEntry[]>();
        for (SObjectField f : sObjectName.fields.getMap().values()) {
            DescribeFieldResult field = f.getDescribe();
            if(field.getType()===Schema.DisplayType.Picklist){
                picklistValues.put(field.getName(),field.getPicklistValues());
            }
        }
        return picklistValues;
    }
    
    public static Map<String,DescribeFieldResult> getAllObjectFields(DescribeSObjectResult sObjectName){
        Map<String,DescribeFieldResult> listOfObjectFields=new Map<String,DescribeFieldResult>();
        
        for (SObjectField f : sObjectName.fields.getMap().values()) {
            DescribeFieldResult field = f.getDescribe();
            listOfObjectFields.put(field.getName(),field);
        }   
        return listOfObjectFields; 
    }
    public static DescribeSobjectResult getSobjectType(String objectApiName){
        Schema.DescribeSobjectResult[] results = Schema.describeSObjects(new String[] { objectApiName });
        return results[0];
    }

}