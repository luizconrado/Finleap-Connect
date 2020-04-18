public inherited  sharing class SchemaUtility {
    
    
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

}