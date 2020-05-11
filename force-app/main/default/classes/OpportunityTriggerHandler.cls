public class OpportunityTriggerHandler extends Triggerhandler {
    
    public OpportunityTriggerHandler() {
        this.setMaxLoopCount(10);
    }
    
    public override void beforeupdate(){
        List<Opportunity> opportunityOwnerChanged=new List<Opportunity>();
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
        }
        //set campaing name if campaing is associated
        if(campaingAndOpportunity.size()>0) setCampaingName(campaingAndOpportunity,newOpportunityMap);
        //preserve team members if owner changed
        if(opportunityOwnerChanged.size()>0) setTeamMembers(opportunityOwnerChanged);
        
    }
    
    public override void afterupdate(){
        List<Opportunity> newOpportunityList=(List<Opportunity>) Trigger.new;
        Map<Id,Opportunity> oldOpportunityMap=(Map<Id,Opportunity>) Trigger.oldMap;
        if(!System.Label.Track_History_Exclusion.contains(Userinfo.getUserEmail())){
            //track changes
            TrackHistory.track('Opportunity', JSON.serialize(newOpportunityList), JSON.serialize(oldOpportunityMap));
        }
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
    
    @future
    private static void insertTeamMemebers(String teamJson){
        System.debug('OpportunityTriggerHandler=>insertTeamMemebers');
        List<OpportunityTeamMember> teamMemebers=( List<OpportunityTeamMember>) JSON.deserialize(teamJson,  List<OpportunityTeamMember>.class);
        for(OpportunityTeamMember otm:teamMemebers) otm.Id=null;
        insert teamMemebers;
    }
    
}