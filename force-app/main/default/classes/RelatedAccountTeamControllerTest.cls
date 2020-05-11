@isTest
public class RelatedAccountTeamControllerTest {

    @TestSetup
    static void testData(){
        Account a=TestDataFactory.getStandardAccount(true);
        User u=TestDataFactory.getStandardUser(true);
        TestDataFactory.setAccountTeamMember(u.id,a.Id);
        Account_Team_Configuration__c config=new Account_Team_Configuration__c();
        config.Read__c=true;
        insert config;
    }
    @isTest
    static void searchUsersTest(){
        List<User> u=RelatedAccountTeamController.searchUsers('Sys');
        System.assert(u.size()>0);
    }
    @isTest
    static void getTeamMemeberRolesTest(){
        Map<String,String> roles=RelatedAccountTeamController.getTeamMemeberRoles();
        System.assert(roles.keySet().size()>0);
    }
    @isTest
    static void getAccessConfigTest(){
        User u=TestDataFactory.getCommunicationsUser(true);
         system.runAs(u){
            Account_Team_Configuration__c config=RelatedAccountTeamController.getAccessConfig();
             System.assert(config.Read__c);    
        }
        
    }
    @isTest
    static void getAllTeamMembersTest(){
        Account a=[SELECT id FROM Account LIMIT 1];
        List<AccountTeamMember> teammembers=RelatedAccountTeamController.getAllTeamMembers(a.Id);
        System.assertEquals(1, teammembers.size());
    }
    @isTest
    static void deleteTeamMemberTest(){
        Account a=[SELECT id FROM Account LIMIT 1];
        AccountTeamMember atm=[SELECT id FROM AccountTeamMember LIMIT 1];
        RelatedAccountTeamController.deleteTeamMember(new List<String>{atm.id},a.id);
        List<AccountTeamMember> atmList=[SELECT id FROM AccountTeamMember];
        system.assert(atmList.size()==0);
    }
    @isTest
    static void insertAccountTeamMembersTest(){
		User u=TestDataFactory.getCommunicationsUser(true);
        system.runAs(u){
            Account a=[SELECT id FROM Account LIMIT 1];
            AccountTeamMember atm=[SELECT TeamMemberRole,AccountId,AccountAccessLevel,OpportunityAccessLevel,CaseAccessLevel,Creation_Type__c,id FROM AccountTeamMember LIMIT 1];
            atm.Id=null;
            atm.UserId=userinfo.getUserId();     
            List<AccountTeamMember> teamList=new List<AccountTeamMember>{atm};
            RelatedAccountTeamController.insertAccountTeamMembers(JSON.serialize(teamList),a.id);
            List<AccountTeamMember> atmList=[SELECT id FROM AccountTeamMember];
            System.assert(atmList.size()==2);

        }
    }
    @isTest
    static void deleteTeamMemberNegative(){
        RelatedAccountTeamController.deleteTeamMember(new List<String>{},'');
    }
    @isTest
    static void insertAccountTeamMembersNegative(){
        User u=TestDataFactory.getCommunicationsUser(true);
        system.runAs(u){
            List<AccountTeamMember> teamList=new List<AccountTeamMember>{};
                RelatedAccountTeamController.insertAccountTeamMembers(JSON.serialize(teamList),'');
        }
    }
}