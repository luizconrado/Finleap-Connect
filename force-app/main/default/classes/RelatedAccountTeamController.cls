public without sharing class RelatedAccountTeamController {
    
    @AuraEnabled
    public static Map<String,String> getTeamMemeberRoles(){
        Map<String,PicklistEntry[]> allEntries=SchemaUtility.getObjectPicklistFileds('AccountTeamMember');
        Map<String,String>  returnValues=new Map<String,String> ();
        for(PicklistEntry value:allEntries.get('TeamMemberRole'))
            returnValues.put(value.getValue(),value.getLabel());
        return returnValues;
    }
    
    @AuraEnabled
    public static List<AccountTeamMember> getAllTeamMembers(Final String accountId){
        List<AccountTeamMember> teamMemberList=[SELECT Id, 
                                                UserId,User.Name,
                                                TeamMemberRole, 
                                                AccountAccessLevel, 
                                                OpportunityAccessLevel,
                                                CaseAccessLevel, 
                                                Title 
                                                FROM AccountTeamMember 
                                                WHERE AccountId=:accountId 
                                               
                                               ];
        return teamMemberList;
    }

    @AuraEnabled
    public static void deleteTeamMember(List<String> teamMembers){
        List<AccountTeamMember>  teamMemberList=new List<AccountTeamMember>();
        for(String memberId:teamMembers){
            AccountTeamMember x=new AccountTeamMember();
            x.Id=memberId;
            teamMemberList.add(x);
        }
        delete teamMemberList;
    }
    
    @AuraEnabled(Cacheable=True)
    public static List<User> searchUsers(String userName){
        userName='%'+userName+'%';
        return [SELECT Id,Name  FROM USER WHERE Name LIKE:userName  AND isActive=true];
    }
    
    @AuraEnabled 
    public static void insertAccountTeamMembers(String teamMemberList){
        List<AccountTeamMember> teamMembers=(List<AccountTeamMember>) JSON.deserialize(teamMemberList, List<AccountTeamMember>.class);
        insert teamMembers;
        
    }
}