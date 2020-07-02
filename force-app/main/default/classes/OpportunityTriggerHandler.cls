public class OpportunityTriggerHandler extends Triggerhandler {
    
    public OpportunityTriggerHandler() {
        this.setMaxLoopCount(10);
    }
    
    public override void beforeupdate(){
        List<Opportunity> opportunityOwnerChanged=new List<Opportunity>();
        List<Opportunity> opportunityApproved=new List<Opportunity>();

        
		Map<String,List<String>> campaingAndOpportunity=new Map<String,List<String>>();
        
        Map<Id,Opportunity> newOpportunityMap=(Map<Id,Opportunity>) Trigger.newMap;
        Map<Id,Opportunity> oldOpportunityMap=(Map<Id,Opportunity>) Trigger.oldMap;
        
        
        for(Opportunity o:newOpportunityMap.values()){
            //filtering all opportuntitys whose owner is changed
            if(o.OwnerId!=oldOpportunityMap.get(o.Id).OwnerId)  opportunityOwnerChanged.add(o);
            //filtering all opportuntitys whose has no camaping name set
            if(o.CampaignId!=null && (o.Primary_Campaign_Name__c==null || String.isEmpty(o.Primary_Campaign_Name__c))){
                if(!campaingAndOpportunity.containsKey(o.CampaignId)){
                    campaingAndOpportunity.put(o.CampaignId,new List<String>());
                }
                campaingAndOpportunity.get(o.CampaignId).add(o.Id);
            }
            //filtering all opportuntiys whose approver ids are changed
            if((o.Compliance_Approved_User_Id__c!=oldOpportunityMap.get(o.Id).Compliance_Approved_User_Id__c) 
               || (o.Finance_Approved_User_Id__c!=oldOpportunityMap.get(o.Id).Finance_Approved_User_Id__c)){
				opportunityApproved.add(o);                
            } 
            
        }
        
        
        //set campaing name if campaing is associated
        if(campaingAndOpportunity.size()>0) setCampaingName(campaingAndOpportunity,newOpportunityMap);
        //preserve team members if owner changed
        if(opportunityOwnerChanged.size()>0) setTeamMembers(opportunityOwnerChanged);
        //set approved users id
        if(opportunityApproved.size()>0) setApproverUsers(opportunityApproved);
        
    }
    
    public override void afterupdate(){
        List<Opportunity> newOpportunityList=(List<Opportunity>) Trigger.new;
        Map<Id,Opportunity> oldOpportunityMap=(Map<Id,Opportunity>) Trigger.oldMap;
        
        List<Opportunity> finleapConnectApprovedOpportuntiyList=new List<Opportunity>();
        
        Map<String,String> contractIdAndStage=new Map<String,String>();
        
        /*
        for(Opportunity o:newOpportunityList){
            if(o.RecordTypeId==Constant.OPPORTUNITY_FINLEAP_CONNECT_RECORDTYPE_ID){
                //check if opportuntiy is approved and update contract stage to approved and create product instance
                if(o.StageName=='Closed Won' 
                   && oldOpportunityMap.get(o.Id).StageName!=o.StageName 
                   && o.Compliance_Approved_Date__c!=null 
                   && o.Finance_Approved_Date__c!=null
                   && o.ContractId!=null ){
                   	   finleapConnectApprovedOpportuntiyList.add(o);
                       contractIdAndStage.put(o.ContractId,'Activated');
                }
                //update contract stage to in approval if first stage of apporval is accepted
                else if(o.StageName=='Confirmed' 
                   && oldOpportunityMap.get(o.Id).StageName==o.StageName 
                   && oldOpportunityMap.get(o.Id).Compliance_Approved_Date__c!=o.Compliance_Approved_Date__c
                   && o.Compliance_Approved_Date__c!=null 
                   && o.ContractId!=null ){
                       contractIdAndStage.put(o.ContractId,'In Approval Process');
                }
                //update contract stage to draft if approval process is rejected
                else if(o.StageName=='Confirmed' 
                   && oldOpportunityMap.get(o.Id).StageName==o.StageName 
                   && oldOpportunityMap.get(o.Id).Compliance_Approved_Date__c!=o.Compliance_Approved_Date__c
                   && o.Compliance_Approved_Date__c==null 
                   && o.ContractId!=null ){
                       contractIdAndStage.put(o.ContractId,'Draft');
                }
            }
        }
        
        //create product instance
        if(finleapConnectApprovedOpportuntiyList.size()>0) createProductInstanceInContract(finleapConnectApprovedOpportuntiyList);
        //update contract stage
        if(contractIdAndStage.size()>0) updateContractStage(contractIdAndStage);
        */
        //track changes
        if(!System.Label.Track_History_Exclusion.contains(Userinfo.getUserEmail()))
        TrackHistory.publishChanges('Opportunity', newOpportunityList, oldOpportunityMap);
    }
    
    private static void setCampaingName(Map<String,List<String>> opportunityAndCampaingMap,Map<Id,Opportunity> newOpportunityMap){
        for(Campaign camp:[select id,name from Campaign where id IN:opportunityAndCampaingMap.keySet()]){
            for(String oppId:opportunityAndCampaingMap.get(camp.Id)){
            	newOpportunityMap.get(oppId).Primary_Campaign_Name__c=camp.name;
            }
        }
    }
    
    private static void setTeamMembers(List<Opportunity> opportunityOwnerChanged){
        List<OpportunityTeamMember> teamMemebers=[SELECT  TeamMemberRole, OpportunityAccessLevel, UserId, OpportunityId,Title, Name, PhotoUrl 
                                                  FROM OpportunityTeamMember WHERE OpportunityId IN: opportunityOwnerChanged];
        
        if(teamMemebers.size()>0) insertTeamMemebers(JSON.serialize(teamMemebers));
    }
    
    private static void setApproverUsers(List<Opportunity> opportunityApproved){
        for(Opportunity o:opportunityApproved){
            o.Finance_Approved_User__c=o.Finance_Approved_User_Id__c;
            o.Compliance_Approved_User__c=o.Compliance_Approved_User_Id__c;
        }
    }
    /*
    private static void createProductInstanceInContract(List<Opportunity> finleapConnectApprovedOpportuntiyList){
        List<Product_Instance__c> toInsert=new List<Product_Instance__c>();
        List<OpportunityLineItem> opportunityLineItemList=[SELECT Id,Pricing_Type__c,Percentage_Per_Usage__c,Product2Id,Product2.Name,OpportunityId,Opportunity.ContractId,UnitPrice,One_Time_Setup_Price__c,Base_Limit__c,
                                                           Excess_Limit_Tier_1__c,Excess_Limit_Tier_2__c,Excess_Limit_Tier_3__c,Excess_Limit_Tier_4__c,Excess_Limit_Tier_5__c,
                                                           Excess_Price_Tier_1__c,Excess_Price_Tier_2__c,Excess_Price_Tier_3__c,Excess_Price_Tier_4__c,Excess_Price_Tier_5__c
                                                           FROM OpportunityLineItem 
                                                           WHERE OpportunityId IN:finleapConnectApprovedOpportuntiyList];
        List<Product_Instance__c> prodInstaceList=[SELECT id,Product__c,Opportunity__c
                                                  FROM Product_Instance__c
                                                  WHERE Opportunity__c  IN:finleapConnectApprovedOpportuntiyList];
        Map<String,List<String>> oppAndProdInstaceMap=new  Map<String,List<String>>();
        for(Product_Instance__c pi:prodInstaceList){
            if(!oppAndProdInstaceMap.containsKey(pi.Opportunity__c)){
                oppAndProdInstaceMap.put(pi.Opportunity__c,new List<String>());
            }
            oppAndProdInstaceMap.get(pi.Opportunity__c).add(pi.Product__c);
        }
        for(OpportunityLineItem oli:opportunityLineItemList){
            if(!(oppAndProdInstaceMap.containskey(oli.OpportunityId) 
                && oppAndProdInstaceMap.get(oli.OpportunityId).indexOf(oli.Product2Id)>-1)){
                    Product_Instance__c x=new Product_Instance__c();
                    x.Name=oli.Product2.Name;
                    x.Percentage_Per_Usage__c=oli.Percentage_Per_Usage__c;
                    x.Pricing_Type__c=oli.Pricing_Type__c;
                    x.Contract__c=oli.Opportunity.ContractId;
                    x.Base_Limit__c=oli.Base_Limit__c;
                    x.Base_Price__c=oli.UnitPrice;
                    x.Product__c=oli.Product2Id;
                    x.Status__c='Active';
                    x.Opportunity__c=oli.OpportunityId;
                    x.One_Time_Setup_Price__c=oli.One_Time_Setup_Price__c;
                    x.Excess_Limit_Tier_1__c=oli.Excess_Limit_Tier_1__c;
                    x.Excess_Limit_Tier_2__c=oli.Excess_Limit_Tier_2__c;
                    x.Excess_Limit_Tier_3__c=oli.Excess_Limit_Tier_3__c;
                    x.Excess_Limit_Tier_4__c=oli.Excess_Limit_Tier_4__c;
                    x.Excess_Limit_Tier_5__c=oli.Excess_Limit_Tier_5__c;
                    x.Excess_Price_Tier_1__c=oli.Excess_Price_Tier_1__c;
                    x.Excess_Price_Tier_2__c=oli.Excess_Price_Tier_2__c;
                    x.Excess_Price_Tier_3__c=oli.Excess_Price_Tier_3__c;
                    x.Excess_Price_Tier_4__c=oli.Excess_Price_Tier_4__c;
                    x.Excess_Price_Tier_5__c=oli.Excess_Price_Tier_5__c;
                    toInsert.add(x);
                }
        }
        insert toInsert;
        
    }
    private static void updateContractStage(Map<String,String> contractIdAndStageMap){
        List<Contract> toUpdateContracts=new List<Contract>();
        for(String contractId:contractIdAndStageMap.keySet()){
            toUpdateContracts.add(new Contract(Id=contractId,Status=contractIdAndStageMap.get(contractId)));
        }
        if (toUpdateContracts.size()>0) update toUpdateContracts;
    }
    */
    @future
    private static void insertTeamMemebers(String teamJson){
        System.debug('OpportunityTriggerHandler=>insertTeamMemebers');
        List<OpportunityTeamMember> teamMemebers=( List<OpportunityTeamMember>) JSON.deserialize(teamJson,  List<OpportunityTeamMember>.class);
        for(OpportunityTeamMember otm:teamMemebers) otm.Id=null;
        insert teamMemebers;
    }
    
}