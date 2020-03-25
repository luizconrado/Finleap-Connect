public with sharing class RelatedOpportunityController {
    private static WithoutSharing db{set;get{
        if(db==null) db=new WithoutSharing();
        return db;
    }}
    
    @AuraEnabled
    Public static Map<String,List<Object>> getHiddenOpportunitys(String recordId,String ObjectName){
        Map<String,List<Object>> returnValue=new Map<String,List<Object>>();
        FieldSet[] fieldDetails=SchemaUtility.getFieldSetMembers('Opportunity',Constant.OPPORTUNITY_GLOBAL_RELATED_FIELDSET);
        returnValue.put('fields',fieldDetails);
        String query='SELECT Id,';
        for(FieldSet fd:fieldDetails){
            if(fd.fieldType=='REFERENCE' || fd.fieldType=='reference' ){
                query+=(fd.fieldAPIName.contains('__c'))?fd.fieldAPIName.substringBefore('Id')+'__r.Name,':fd.fieldAPIName.substringBefore('Id')+'.Name,';
            }
             query+=fd.fieldAPIName+',';
        }
        query=query.removeEnd(',');
        query+=' FROM Opportunity WHERE ';
        
        
        List<Opportunity> oppList=new List<Opportunity>();
        if(objectName=='Account'){
            query+=' AccountId =: recordId ';
            oppList=Database.query(query);
            oppList=db.queryOpportunity(recordId,oppList,query);
        }
        if(ObjectName=='Contact'){
            List<OpportunityContactRole> oppContactRoleList=[SELECT Id, OpportunityId, ContactId FROM OpportunityContactRole WHERE ContactId=:recordId];
            oppList=db.queryOpportunityFromContactRole(recordId,oppContactRoleList,query);
        }
        returnValue.put('OppList',oppList);
        return returnValue;
    }

    private without sharing class WithoutSharing{
     
        public List<Opportunity> queryOpportunity(String recordId,List<Opportunity> oppList,String query){
            query+=' AND Id NOT IN: oppList';
            return Database.query(query);
        }
        public List<Opportunity> queryOpportunityFromContactRole(String recordId,List<OpportunityContactRole> oppContactRoleList,String query){
            List<String> oppListId=new List<String>();
            for(OpportunityContactRole ocr:[SELECT Id, OpportunityId, ContactId FROM OpportunityContactRole WHERE ContactId=:recordId AND id NOT IN:oppContactRoleList]){
                oppListId.add(ocr.OpportunityId);
            }
            query+='  Id IN: oppListId ';
            return Database.query(query);
        }
    }
    
}