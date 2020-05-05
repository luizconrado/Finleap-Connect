public class OpportunityTriggerHandler extends Triggerhandler {
    
    public OpportunityTriggerHandler() {
        this.setMaxLoopCount(10);
    }
    
    public override void beforeupdate(){
        List<Opportunity> opportunityOwnerChanged=new List<Opportunity>();
        Map<Id,Opportunity> newOpportunityMap=(Map<Id,Opportunity>) Trigger.newMap;
        Map<Id,Opportunity> oldOpportunityMap=(Map<Id,Opportunity>) Trigger.oldMap;
        
        //filtering all opportuntitys whose owner is changed
        for(Opportunity o:newOpportunityMap.values()){
            if(o.OwnerId!=oldOpportunityMap.get(o.Id).OwnerId)  opportunityOwnerChanged.add(o);
        }
        
        
        if(opportunityOwnerChanged.size()>0) setTeamMembers(opportunityOwnerChanged);
        
    }
    
    public override void afterupdate(){
        List<Opportunity> newOpportunityList=(List<Opportunity>) Trigger.new;
        Map<Id,Opportunity> oldOpportunityMap=(Map<Id,Opportunity>) Trigger.oldMap;
        TrackHistory.track('Opportunity', newOpportunityList, oldOpportunityMap);
    }
      
    private static void setTeamMembers(List<Opportunity> opportunityOwnerChanged){
        List<OpportunityTeamMember> teamMemebers=[SELECT  TeamMemberRole, OpportunityAccessLevel, UserId, OpportunityId,Title, Name, PhotoUrl 
                                                  FROM OpportunityTeamMember WHERE OpportunityId IN: opportunityOwnerChanged];
        
        if(teamMemebers.size()>0) insertTeamMemebers(JSON.serialize(teamMemebers));
    }
    
    @future
    private static void insertTeamMemebers(String teamJson){
        List<OpportunityTeamMember> teamMemebers=( List<OpportunityTeamMember>) JSON.deserialize(teamJson,  List<OpportunityTeamMember>.class);
        for(OpportunityTeamMember otm:teamMemebers) otm.Id=null;
        insert teamMemebers;
    }
    
}