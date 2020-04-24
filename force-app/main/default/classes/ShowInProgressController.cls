public with sharing class ShowInProgressController {

    private static WithoutSharing db{set;get{
        if(db==null) db=new WithoutSharing();
        return db;
    }}

    @AuraEnabled
    public static string getAllInProgressOpportunties(Final String recordTypeId,Final String accountId,Final String recordId) {
        Map<String,List<Object>> returnValue=new Map<String,List<Object>>();
        FieldSet[] fieldDetails=SchemaUtility.getFieldSetMembers('Opportunity',Constant.OPPORTUNITY_GLOBAL_RELATED_FIELDSET);
        returnValue.put('Fields',fieldDetails);
        String query='SELECT Id,';
        for(FieldSet fd:fieldDetails){
            if(fd.fieldType=='REFERENCE' || fd.fieldType=='reference' ){
                query+=(fd.fieldAPIName.contains('__c'))?fd.fieldAPIName.substringBefore('__c')+'__r.Name,':fd.fieldAPIName.substringBefore('Id')+'.Name,';
            }
             query+=fd.fieldAPIName+',';
        }
        if(query.contains('Limited_Access_Name__c')) query=query.removeEnd(',');
        else query+='Limited_Access_Name__c';
        query+=' FROM Opportunity WHERE IsClosed =false AND ';
        String publicQuery=query+'AccountId=:accountId AND ';
        if(String.isBlank(recordTypeId))  publicQuery+=' Id!=:recordId';
        else publicQuery+='RecordTypeId!=:recordTypeId AND Id!=:recordId';
        List<Opportunity> oppList=Database.query(publicQuery);
        returnValue.put('Global',oppList);
        returnValue.put('Private',db.queryOpportunity(query,accountId,recordId,recordTypeId,oppList));
        return  JSON.serialize(returnValue);
    }
    
    private without sharing class WithoutSharing{
        public List<Opportunity> queryOpportunity(Final String query,
        Final String accountId,Final string recordId,final String recordTypeId,Final List<Opportunity> oppList){
            String privateQuery=query+'AccountId=:accountId AND ';
            if(String.isBlank(recordTypeId))  privateQuery+=' Id!=:recordId';
            else privateQuery+='RecordTypeId!=:recordTypeId AND Id!=:recordId';
            privateQuery+=' AND Id NOT IN: oppList';
            return Database.query(privateQuery);
        }
    }
}