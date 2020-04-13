public class AccountTriggerHandler extends Triggerhandler {

    public AccountTriggerHandler() {
        this.setMaxLoopCount(2);
    }
    
    public override void beforeupdate(){
        List<Account> accountOwnerChanged=new List<Account>();
        Map<Id,Account> newAccountMap=(Map<Id,Account>) Trigger.newMap;
        Map<Id,Account> oldAccountMap=(Map<Id,Account>) Trigger.oldMap;
        
        for(Account a:newAccountMap.values()){
            if(a.OwnerId!=oldAccountMap.get(a.Id).OwnerId) accountOwnerChanged.add(a);
        }
        
        List<AccountTeamMember> teamMemebers=[SELECT  AccountId, UserId, TeamMemberRole, PhotoUrl, Title, AccountAccessLevel, OpportunityAccessLevel, CaseAccessLevel, ContactAccessLevel 
                                              FROM AccountTeamMember WHERE AccountId IN: accountOwnerChanged];
       
        insertTeamMemebers(JSON.serialize(teamMemebers));
        
    }
    
    @future
    private static void insertTeamMemebers(String teamJson){
        List<AccountTeamMember> teamMemebers=( List<AccountTeamMember>) JSON.deserialize(teamJson,  List<AccountTeamMember>.class);
        for(AccountTeamMember atm:teamMemebers) atm.Id=null;
        insert teamMemebers;
    }

}