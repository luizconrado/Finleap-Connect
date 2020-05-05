public without sharing class RelatedAccountTeamController {
    
    @AuraEnabled(Cacheable=true)
    public static Map<String,String> getTeamMemeberRoles(){
        //Get pick list values of TeamMemberRole
        Map<String,PicklistEntry[]> allEntries=SchemaUtility.getObjectPicklistFileds('AccountTeamMember');
        Map<String,String>  returnValues=new Map<String,String> ();
        for(PicklistEntry value:allEntries.get('TeamMemberRole'))
            returnValues.put(value.getValue(),value.getLabel());
        return returnValues;
    }
    
    @AuraEnabled(Cacheable=true)
    public static Account_Team_Configuration__c getAccessConfig(){
        //Get access by order user>profile>default
        Account_Team_Configuration__c config = Account_Team_Configuration__c.getInstance(userinfo.getUserId());
        if(config==null) config= Account_Team_Configuration__c.getInstance(userinfo.getProfileId());
        if(config==null) config= Account_Team_Configuration__c.getOrgDefaults();
        return config;
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
    public static void deleteTeamMember(List<String> teamMembers,String accountId){
        List<AccountTeamMember>  teamMemberList=[SELECT Id,UserId,User.Name,TeamMemberRole FROM  AccountTeamMember WHERE ID IN:teamMembers];
        List<Account> accountList=[SELECT Name FROM Account WHERE ID=:accountId];
        List<Field_History_Tracker__c> toInsertRecords=new List<Field_History_Tracker__c>();
        //Adding log before deleteing 
        for(AccountTeamMember member:teamMemberList){
            Field_History_Tracker__c change=new Field_History_Tracker__c();
            change.Field__c='AccountTeamMembers';
            change.Field_Label__c='Account Team Member';
            change.Object_Label__c='Account';
            change.Object__c='Account';
            change.Record_Id__c=accountId;
            change.Old_Value__c=member.User.Name;
            change.New_Value__c='Deleted';
            change.Relation__c='Child Object';
            change.Record_Name__c=(accountList.size()>0)?accountList.get(0).Name:'Account';
            toInsertRecords.add(change);
        }
        if(toInsertRecords.size()>0) insert toInsertRecords;
        if(teamMemberList.size()>0) delete teamMemberList;
    }
    
    @AuraEnabled(Cacheable=True)
    public static List<User> searchUsers(String userName){
        userName='%'+userName+'%';
        return [SELECT Id,Name  FROM USER WHERE Name LIKE:userName  AND isActive=true];
    }
    
    @AuraEnabled 
    public static void insertAccountTeamMembers(String teamMemberList,String accountId){
        List<AccountTeamMember> teamMembers=(List<AccountTeamMember>) JSON.deserialize(teamMemberList, List<AccountTeamMember>.class);
        List<Account> accountList=[SELECT Name FROM Account WHERE ID=:accountId];
        List<Field_History_Tracker__c> toInsertRecords=new List<Field_History_Tracker__c>();
        //adding log before inserting
        for(AccountTeamMember member:teamMembers){
            Field_History_Tracker__c change=new Field_History_Tracker__c();
            change.Field__c='AccountTeamMembers';
            change.Field_Label__c='Account Team Member';
            change.Object_Label__c='Account';
            change.Object__c='Account';
            change.Record_Id__c=accountId;
            change.Old_Value__c='Added';
            change.Relation__c='Child Object';
            change.New_Value__c=member.User.Name;
            change.Record_Name__c=(accountList.size()>0)?accountList.get(0).Name:'Account';
            toInsertRecords.add(change);
        }
        if(toInsertRecords.size()>0) insert toInsertRecords;
        if(teamMembers.size()>0) insert teamMembers;
        
    }
}