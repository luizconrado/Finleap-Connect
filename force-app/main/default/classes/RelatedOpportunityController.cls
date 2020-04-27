public with sharing class RelatedOpportunityController {
    private static WithoutSharing db{set;get{
        if(db==null) db=new WithoutSharing();
        return db;
    }}
    
    @AuraEnabled
    Public static String getHiddenOpportunitys(String recordId,String objectName){
       
        Map<String,List<Object>> returnValue=new Map<String,List<Object>>();
        //Getting fileds from field set and creating query
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
        query+=' FROM Opportunity WHERE ';
        //querying records using with and without sharing
        if(objectName=='Account'){
            query+=' AccountId =: recordId ';
            List<Opportunity> oppList=Database.query(query+' ORDER BY CreatedDate Desc');
            returnValue.put('Global',oppList);
			returnValue.put('Private',db.queryOpportunity(recordId,oppList,query));
        }
        if(objectName=='Contact'){
            List<OpportunityContactRole> oppContactRoleList=[SELECT Id, OpportunityId, ContactId FROM OpportunityContactRole WHERE ContactId=:recordId];
            List<String> oppListId=new List<String>();
            for(OpportunityContactRole ocr:oppContactRoleList) oppListId.add(ocr.OpportunityId);
            returnValue.put('Global', Database.query(query+' Id IN:oppListId ORDER BY CreatedDate Desc'));
            returnValue.put('Private',db.queryOpportunityFromContactRole(recordId,oppContactRoleList,query));
        }
        return JSON.serialize(returnValue);
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
            query+='  Id IN: oppListId ORDER BY CreatedDate Desc';
            return Database.query(query);
        }
    }
    
}