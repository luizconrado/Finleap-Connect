public class OpportunityTriggerHandler extends Triggerhandler {

    public OpportunityTriggerHandler() {
        this.setMaxLoopCount(5);
    }
    
    public override void beforeupdate(){
        List<Opportunity> opportunityOwnerChanged=new List<Opportunity>();
        Map<Id,Opportunity> newOpportunityMap=(Map<Id,Opportunity>) Trigger.newMap;
        Map<Id,Opportunity> oldOpportunityMap=(Map<Id,Opportunity>) Trigger.oldMap;
        //filtering all opportuntitys whose owner is changed
        for(Opportunity o:newOpportunityMap.values()){
            if(o.OwnerId!=oldOpportunityMap.get(o.Id).OwnerId)  opportunityOwnerChanged.add(o);
        }
        List<OpportunityTeamMember> teamMemebers=[SELECT  TeamMemberRole, OpportunityAccessLevel, UserId, OpportunityId,Title, Name, PhotoUrl 
                                                  FROM OpportunityTeamMember WHERE OpportunityId IN: opportunityOwnerChanged];
        
        insertTeamMemebers(JSON.serialize(teamMemebers));
        
    }
    
    @future
    private static void insertTeamMemebers(String teamJson){
        List<OpportunityTeamMember> teamMemebers=( List<OpportunityTeamMember>) JSON.deserialize(teamJson,  List<OpportunityTeamMember>.class);
        for(OpportunityTeamMember otm:teamMemebers) otm.Id=null;
        insert teamMemebers;
    }

}