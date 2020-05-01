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
        
        if(opportunityOwnerChanged.size()>0) setTeamMembers(opportunityOwnerChanged);
        
        setSubStage(newOpportunityMap,oldOpportunityMap);
    }
    
    private static void setSubStage(Map<Id,Opportunity> newOpportunityMap,Map<Id,Opportunity> oldOpportunityMap){
        for(Opportunity o:newOpportunityMap.values()){
            Opportunity oldOpp=oldOpportunityMap.get(o.Id);
            if(validateSubStageChange(o,oldOpp)){
                if(o.StageName=='Qualifying'){
                    if(o.Fact_Sheet_Sent__c==null)
                        o.Sub_Stage__c='Awaiting Fact Sheet to be Sent Out';
                }
                else if(o.StageName=='Engage'){
                    if(o.Fact_Sheet_Sent__c==null)
                        o.Sub_Stage__c='Awaiting Fact Sheet to be Sent Out';
                    else if(o.Fact_Sheet_Follow_Up__c==null)
                        o.Sub_Stage__c='Awaiting Follow up after Fact Sheet';
                    else if(o.Short_Deck_Sent__c==null)
                        o.Sub_Stage__c='Awaiting Short Deck to be Sent Out';
                    else
                        o.Sub_Stage__c='';
                }
                else if(o.StageName=='General Interest'){
                    if(o.Intro_Meeting_Scheduled__c==null && o.Intro_Call_Scheduled__c==null)
                        o.Sub_Stage__c='Awaiting Initial Call to be Schedule';
                    else if(o.NDA_Signed__c==null)
                        o.Sub_Stage__c='Awaiting NDA to be Signed';
                    else if(o.Extended_Deck_Sent__c==null)
                        o.Sub_Stage__c='Awaiting Extended Deck to be Sent Out';
                    else
                        o.Sub_Stage__c='';
                }
                else if(o.StageName=='Deep Dive'){
                    if(o.Extended_Deck_Follow_Up__c==null)
                        o.Sub_Stage__c='Awaiting Extended Deck Follow Up';
                    if(o.DD_Light_Access_Granted__c==null)
                        o.Sub_Stage__c='Awaiting Invitation to Due Diligence';
                    else if(o.DD_Light_Follow_Up__c==null)
                        o.Sub_Stage__c='Awaiting Follow up after Due Diligence';
                    else if(o.Term_Sheet_Signed__c==null)
                        o.Sub_Stage__c='Awaiting Term Sheet to be Signed';
                    else if(o.DD_Confirmatory_Access_Granted__c==null)
                        o.Sub_Stage__c='Awaiting Invitation to Due Diligence Confirmatory';
                    else if(o.DD_Confirmatory_Follow_Up__c==null)
                        o.Sub_Stage__c='Awaiting Follow up after Due Diligence Confirmatory';
                    else
                        o.Sub_Stage__c='';
                }
                else if(o.StageName=='Due Diligence'){
                    if(o.Q_A_Answered__c==null)
                        o.Sub_Stage__c='Awaiting Q&A to be Answered';
                    else if(o.Mgmt_Meeting_Scheduled__c==null)
                        o.Sub_Stage__c='Awaiting Invitation for on-site Mgmt. Meeting';
                    else if(o.ISHA_Negotiation_Start_Date__c==null)
                        o.Sub_Stage__c='Awaiting ISHA Negotiation';
                    else
                        o.Sub_Stage__c='';
                }
                else if(o.StageName=='Negotiation'){
                    if(o.ISHA_Negotiation_Signed_Date__c==null)
                        o.Sub_Stage__c='Awaiting ISHA to be Signed';
                    else
                        o.Sub_Stage__c='';
                }
                else if(o.StageName=='Signed'){
                    if(o.ISHA_Negotiation_Signed_Date__c!=null)
                        o.Sub_Stage__c='Awaiting Deal Closure';
                }
            }
        }
    }
    private static Boolean validateSubStageChange(Opportunity newOpp,Opportunity oldOpp){
        //check investment opp
        if(newOpp.RecordTypeId==Constant.OPPORTUNITY_FINLEAP_BUILD_INVESTMENT_RECORDTYPE_ID||newOpp.RecordTypeId==Constant.OPPORTUNITY_INVESTMENT_IN_FINLEAP_RECORDTYPE_ID||newOpp.RecordTypeId==Constant.OPPORTUNITY_FINLEAP_INVESTMENT_IN_VENTURE_RECORDTYPE_ID){
            //check stage is changed
            if(newOpp.StageName!=oldOpp.StageName) return true;
            //check date fields
            if(
                newOpp.Fact_Sheet_Sent__c!=oldOpp.Fact_Sheet_Sent__c ||
                newOpp.Fact_Sheet_Follow_Up__c!=oldOpp.Fact_Sheet_Follow_Up__c ||
                newOpp.Short_Deck_Sent__c!=oldOpp.Short_Deck_Sent__c ||
                newOpp.Intro_Meeting_Scheduled__c!=oldOpp.Intro_Meeting_Scheduled__c ||
                newOpp.Intro_Call_Scheduled__c!=oldOpp.Intro_Call_Scheduled__c ||
                newOpp.NDA_Signed__c!=oldOpp.NDA_Signed__c ||
                newOpp.Extended_Deck_Sent__c!=oldOpp.Extended_Deck_Sent__c ||
                newOpp.Q_A_Answered__c!=oldOpp.Q_A_Answered__c ||
                newOpp.Mgmt_Meeting_Scheduled__c!=oldOpp.Mgmt_Meeting_Scheduled__c ||
                newOpp.ISHA_Negotiation_Start_Date__c!=oldOpp.ISHA_Negotiation_Start_Date__c ||
                newOpp.ISHA_Negotiation_Signed_Date__c!=oldOpp.ISHA_Negotiation_Signed_Date__c  ||
                newOpp.Extended_Deck_Follow_Up__c!=oldOpp.Extended_Deck_Follow_Up__c ||
                newOpp.DD_Light_Access_Granted__c!=oldOpp.DD_Light_Access_Granted__c ||
                newOpp.DD_Light_Follow_Up__c!=oldOpp.DD_Light_Follow_Up__c ||
                newOpp.Term_Sheet_Signed__c!=oldOpp.Term_Sheet_Signed__c ||
                newOpp.DD_Confirmatory_Access_Granted__c!=oldOpp.DD_Confirmatory_Access_Granted__c ||
                newOpp.DD_Confirmatory_Follow_Up__c!=oldOpp.DD_Confirmatory_Follow_Up__c 
            ) return true;
            
            return false;
        }
        return false;
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