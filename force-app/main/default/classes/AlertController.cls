public with sharing class AlertController {

    private static WithoutSharing db{set;get{
        if(db==null) db=new WithoutSharing();
        return db;
    }}

    @AuraEnabled 
    public static Boolean getApprovalProcessStatus(String recordId){
        List<ProcessInstanceWorkitem> aprovalStatus=db.queryProcessIntance(recordId);
        if(aprovalStatus.size()>0 && aprovalStatus.get(0).ProcessInstance.STATUS=='Pending') return true;
        return false;
        
    }
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
		publicQuery+=' Id!=:recordId ORDER BY CreatedDate Desc';
        List<Opportunity> oppList=Database.query(publicQuery);
        returnValue.put('Global',oppList);
        returnValue.put('Private',db.queryOpportunity(query,accountId,recordId,recordTypeId,oppList));
        returnValue.put('FilterIds',getFilterRecordTypeIds());
        return  JSON.serialize(returnValue);
    }
    private static List<string> getFilterRecordTypeIds(){
        List<String> returnValue=new List<String>();
        List<Constant__mdt> recordtypes=[SELECT id,value__c FROM Constant__mdt WHERE DeveloperName='Opportunity_Alert_Filters'];
        if(recordtypes.size()>0){
            List<String> recordTypeNames=recordtypes.get(0).value__c.split(','); 
            for(String recordTypeDevName:recordTypeNames){
                String id=SchemaUtility.getRecordTypeId(recordTypeDevName, 'Opportunity');
                if(String.isNotEmpty(id))returnValue.add(id);
            }
            
            
        }
        return returnValue;
    }
   
    
    private without sharing class WithoutSharing{
        public List<Opportunity> queryOpportunity(Final String query,
        Final String accountId,Final string recordId,final String recordTypeId,Final List<Opportunity> oppList){
            String privateQuery=query+'AccountId=:accountId AND ';
            privateQuery+=' Id!=:recordId';
            privateQuery+=' AND Id NOT IN: oppList ORDER BY CreatedDate Desc';
            return Database.query(privateQuery);
        }
        
        public List<ProcessInstanceWorkitem> queryProcessIntance(String recordId){
            return [SELECT ProcessInstance.STATUS,ActorId FROM ProcessInstanceWorkitem WHERE ProcessInstance.TargetObjectId=:recordId LIMIT 40];
        }
        
    }
}