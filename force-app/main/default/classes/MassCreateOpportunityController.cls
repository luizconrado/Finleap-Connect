public with sharing class MassCreateOpportunityController {
    
    @AuraEnabled 
    public static Opportunity getDefaultRecordTypeIdForCampaign(String campaingId){
        //get Opportunity details
        if(!String.isEmpty(campaingId)){
            List<Opportunity> opportunityList=[SELECT id,recordTypeId,recordType.Name
                                               FROM Opportunity 
                                               WHERE CampaignId=:campaingId ORDER BY CreatedDate Desc LIMIT 1];
            if(opportunityList.size()>0) return opportunityList.get(0);
        }
            
        return null;
    }
    
    @AuraEnabled(Cacheable=true)
    public static List<FieldSet> getOpportunityRecordTypes(){
        List<Schema.RecordTypeInfo> recordTypes= SchemaUtility.getAllRecordTypesOfObject('Opportunity');
        //repurposeing FieldSet as wrapper class 
        List<FieldSet> recordInfo=new List<FieldSet>();
        for(Schema.RecordTypeInfo info:recordTypes){
            if(!info.isMaster()){
            	FieldSet typeInfo=new FieldSet();
                typeInfo.fieldLabel=info.getName();
                typeInfo.fieldAPIName=info.getRecordTypeId();
                typeInfo.isRequired=info.isDefaultRecordTypeMapping();
                recordInfo.add(typeInfo);    
            }
        }
        return recordInfo;
    }
    
    @AuraEnabled
    public static Integer createOpportunities(String recordTypeId,String campaignId){
        Integer dmlOprationsOnOpportunity=0;
        Set<Id> accountIdSet=new Set<Id>();
        Set<Id> contactIdSet=new Set<Id>();
        Set<Id> opportunityAccountIdSet=new Set<Id>();
        List<Opportunity> toInsertOpportuntiyList=new List<Opportunity>();
        List<OpportunityContactRole> toInsertOpportuntiyContactList=new List<OpportunityContactRole>();

        List<Opportunity> allOpportuntiyList=new List<Opportunity>();
		Map<Id,List<id>> opportunityContactMap=new Map<Id,List<id>>();
        //get members
        List<CampaignMember> campaignMembers=[SELECT Id,Campaign.Name,Campaign.Code_Name__c,Campaign.EndDate,CampaignId,ContactId,Contact.AccountId,Contact.Account.Name,Name FROM CampaignMember WHERE CampaignId=:campaignId];
        for(CampaignMember cm:campaignMembers){
            if(cm.ContactId!=null){
                accountIdSet.add(cm.Contact.AccountId);
                contactIdSet.add(cm.ContactId);
            }
        } 
        //get Opportunity details
        List<Opportunity> opportunityList=[SELECT id,CampaignId,AccountId
                                           FROM Opportunity 
                                           WHERE accountId IN:accountIdSet AND RecordTypeId=:recordTypeId AND CampaignId=:campaignId];
        for(Opportunity opp:opportunityList) opportunityAccountIdSet.add(opp.AccountId);
        
        List<OpportunityContactRole> opportunityContactList=[SELECT Id, OpportunityId, ContactId 
                                                             FROM OpportunityContactRole 
                                                             WHERE OpportunityId IN:opportunityList AND ContactId IN:contactIdSet];
        for(OpportunityContactRole ocr:opportunityContactList){
            if(!opportunityContactMap.containsKey(ocr.OpportunityId)){
                opportunityContactMap.put(ocr.OpportunityId,new List<Id>());
            }    
            opportunityContactMap.get(ocr.OpportunityId).add(ocr.ContactId);
        }
		//create new Opportunities
        for(CampaignMember cm:campaignMembers){
            String tempName=cm.Contact.Account.Name+((cm.campaign.Code_Name__c!=null)?' - '+cm.campaign.Code_Name__c:'');
            Date tempEndDate=cm.Campaign.EndDate;
            if(tempName.length()<120) tempName = tempName+' - '+cm.campaign.Name;
            if(tempName.length()>120) tempName=tempName.substring(0, 120);
            //check if opportunity already exsists using CampaignId
            if(!opportunityAccountIdSet.contains(cm.Contact.AccountId)){
                Opportunity opp=new Opportunity();
                opp.AccountId=cm.Contact.AccountId;
                opp.RecordTypeId=recordTypeId;
                //close date is 2 months from Campaign end date
                opp.CloseDate=Date.newInstance(tempEndDate.year(),tempEndDate.month()+2,tempEndDate.day());
                opp.StageName='Qualifying';
                opp.CampaignId=cm.CampaignId;
                opp.Finleap_Company__c='None';
                opp.Primary_Campaign_Name__c=cm.campaign.Name;
                opp.Name=tempName;
                toInsertOpportuntiyList.add(opp);    
            }
        }
        if(toInsertOpportuntiyList.size()>0) insert toInsertOpportuntiyList;
        
        //getting Opportunities to add contact role
        allOpportuntiyList.addAll(toInsertOpportuntiyList);
        allOpportuntiyList.addAll(opportunityList);
        
        //create contact roles
        for(Opportunity opp:allOpportuntiyList){
            Boolean addContact=false;
            List<Id> contactIds=(opportunityContactMap.containsKey(opp.Id))?opportunityContactMap.get(opp.Id):new List<Id>();
            for(CampaignMember cm:campaignMembers){
                //check CampaignMember and opportuntiy acccount 
                if(cm.ContactId!=null && opp.AccountId==cm.Contact.AccountId && opp.CampaignId==cm.CampaignId){
                    if(!contactIds.contains(cm.ContactId)){
                        OpportunityContactRole role=new OpportunityContactRole();
                        role.ContactId=cm.ContactId;
                        role.OpportunityId=opp.Id;
                        role.Role='Descision Maker';
                        toInsertOpportuntiyContactList.add(role);
                        addContact=true;
                    }
                }
            }	
            dmlOprationsOnOpportunity=(addContact)?dmlOprationsOnOpportunity+1:dmlOprationsOnOpportunity;
        }
        if(toInsertOpportuntiyContactList.size()>0) insert toInsertOpportuntiyContactList;
        
        dmlOprationsOnOpportunity=(toInsertOpportuntiyList.size()>0)?toInsertOpportuntiyList.size():toInsertOpportuntiyContactList.size();
        
        return dmlOprationsOnOpportunity;
    }

    
}