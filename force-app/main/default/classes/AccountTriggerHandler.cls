public class AccountTriggerHandler extends Triggerhandler {

    public AccountTriggerHandler() {
        this.setMaxLoopCount(10);
    }
    
    public override void beforeupdate(){
        List<Account> accountOwnerChanged=new List<Account>();
        Map<Id,Account> newAccountMap=(Map<Id,Account>) Trigger.newMap;
        Map<Id,Account> oldAccountMap=(Map<Id,Account>) Trigger.oldMap;
        
        
        for(Account a:newAccountMap.values()){
        	//Retreving all accounts whoese owner is changed
            if(a.OwnerId!=oldAccountMap.get(a.Id).OwnerId) accountOwnerChanged.add(a);
        }
		        
        //preserve team mebers if owner changed
        if(accountOwnerChanged.size()>0) setTeamMembers(accountOwnerChanged);
        
    }
    public override void afterupdate(){
        List<Account> newAccountList=(List<Account>) Trigger.new;
        Map<Id,Account> oldAccountMap=(Map<Id,Account>) Trigger.oldMap;
        
        //track record changes
        if(!System.Label.Track_History_Exclusion.contains(Userinfo.getUserEmail()))
        TrackHistory.publishChanges('Account', newAccountList,oldAccountMap);
    }
    
    private static void setTeamMembers(List<Account> accountOwnerChanged){
        List<AccountTeamMember> teamMemebers=[SELECT  AccountId, UserId, TeamMemberRole, PhotoUrl, Title, AccountAccessLevel, OpportunityAccessLevel, CaseAccessLevel, ContactAccessLevel 
                                              FROM AccountTeamMember WHERE AccountId IN: accountOwnerChanged];
        
        if(teamMemebers.size()>0) insertTeamMemebers(JSON.serialize(teamMemebers));
    }
    
    @future
    private static void insertTeamMemebers(String teamJson){
        System.debug('AccountTriggerHandler=>insertTeamMemebers');
        List<AccountTeamMember> teamMemebers=( List<AccountTeamMember>) JSON.deserialize(teamJson,  List<AccountTeamMember>.class);
        for(AccountTeamMember atm:teamMemebers) atm.Id=null;
        insert teamMemebers;
    }

}