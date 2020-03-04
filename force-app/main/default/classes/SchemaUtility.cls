public inherited  sharing class SchemaUtility {
    
    public static string getRecordTypeId(String recordTypeDevName,String objectAPIName){
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

}