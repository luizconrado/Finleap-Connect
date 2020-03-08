public class TestDataFactory {
    
    //Generator
    public static User getFinleapUser(Final Boolean isInsert){
        return getUser(Constant.FINLEAP_PROFILE_ID,isInsert);
 	}
    
    public static Account getStandardAccount(Final Boolean isInsert){
        return getAccount(Constant.ACCOUNT_STANDARD_RECORDTYPE_ID,isInsert);
    }
    
    public static Contact getStandardContact(Final String accountId,Final Boolean isInsert){
        return getContact(Constant.CONTACT_STANDARD_RECORDTYPE_ID,accountId,isInsert);
    }
    public static Contact getInvestmentContact(Final String accountId,Final Boolean isInsert){
        return getContact(Constant.CONTACT_FINLEAP_INVESTMENT_RECORDTYPE_ID,accountId,isInsert);
    }
    
    public static Opportunity getInvestmentOpportunity(Final String accountId,Final Boolean isInsert){
        return getOpportunity(Constant.OPPORTUNITY_FINLEAP_INVESTMENT_RECORDTYPE_ID,accountId,isInsert);
    }
    
    public static Task getInvestmentTask(Final String opportunityId,Final String contactId,Final Boolean isInsert){
        return getTask(Constant.TASK_FINLEAP_INVESTMENT_RECORDTYPE_ID,opportunityId,contactId,isInsert);
    }
     public static Task getStandardTask(Final String opportunityId,Final String contactId,Final Boolean isInsert){
        return getTask(Constant.TASK_STANDARD_RECORDTYPE_ID,opportunityId,contactId,isInsert);
    }
    public static Event getStandardEvent(Final String opportunityId,Final String contactId,Final Boolean isInsert){
        return getEvent(Constant.EVENT_STANDARD_RECORDTYPE_ID,opportunityId,contactId,isInsert);
    }
    public static Event getInvestmentEvent(Final String opportunityId,Final String contactId,Final Boolean isInsert){
        return getEvent(Constant.EVENT_INVESTMENT_RECORDTYPE_ID,opportunityId,contactId,isInsert);
    }
    
    public static void addAccessAllPermissionSet(Final String userId){
        insert new PermissionSetAssignment(PermissionSetId=getAccessAllPermissionSet().Id,AssigneeId=userId);
	}
    
    //Helpers
    private static User getUser(final Id profileId,Final Boolean isInsert) {
        User u = new User(
            Phone = Randomutility.getString(10),
            FirstName = Randomutility.getString(4),
            LastName = Randomutility.getString(4),
            Username = Randomutility.getString(8)+'@finleap.com',
            Email = Randomutility.getString(6)+'@finleap.com',
            Alias = Randomutility.getString(4),
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'ISO-8859-1',
            ProfileId = profileId,
            LanguageLocaleKey = 'en_US'
        );
        if(isInsert) insert u;
        return u;
    }
    
    private static Account getAccount(Final String recordTypeId,Final Boolean isInsert){
        Account acc=new Account(
        	Name=Randomutility.getString(7),
            Country__c='Germany',
            Legal_Form__c='KYC',
            Rating='A',
            Customer_Type__c='Other',
            RecordTypeId=recordTypeId
        );
        if(isInsert) insert acc;
        return acc;
    }
    
    private static Contact getContact(Final String recordTypeId,Final String accountId,Final Boolean isInsert){
        Contact con=new Contact(
            LastName=Randomutility.getString(7),
            Email=Randomutility.getString(4)+'@finleap.com',
            AccountId=accountId
        );
        if(isInsert) insert con;
        return con;
        
    }
    
    private static Opportunity getOpportunity(Final String recordTypeId,Final String accountId,Final Boolean isInsert){
        Opportunity opp=new Opportunity();
        opp.Name=Randomutility.getString(4);
        opp.AccountId=accountId;
        opp.StageName='Qualifying';
        opp.CloseDate=Date.today();
        opp.Finleap_Company__c='Finleap Connect';
        opp.Product_Vertical__c='None';
        opp.RecordTypeId=recordTypeId;
        if(isInsert) insert opp;
        return opp;
    }
    
    private static Task getTask(Final String recordTypeId,Final String whatId,Final String whoId,Final Boolean isInsert){
        Task t=new Task();
        t.Subject=Randomutility.getString(8);
        t.ActivityDate=Date.today();
        t.OwnerId=Userinfo.getUserId();
        t.WhatId=whatId;
        t.whoId=whoId;
        t.recordTypeId=recordTypeId;
        t.Priority='Normal';
        t.Status='Open';
        t.Type='Other';
        t.IsReminderSet=false;
        if(isInsert) insert t;
        return t;
    }
    private static Event getEvent(Final String recordTypeId,Final String whatId,Final String whoId,Final Boolean isInsert){
        Event e=new Event();
        e.Subject=Randomutility.getString(8);
        e.ActivityDate=Date.today();
        e.OwnerId=Userinfo.getUserId();
        e.WhatId=whatId;
       	e.StartDateTime=System.Datetime.now();
        e.EndDateTime =System.Datetime.now()+1;
        e.whoId=whoId;
        e.recordTypeId=recordTypeId;
        e.IsReminderSet=false;
        if(isInsert) insert e;
        return e;
    }
    
    private static PermissionSet getAccessAllPermissionSet(){
        //HACK FOR Criteria based sharing rule:https://help.salesforce.com/articleView?id=security_sharing_rule_types.htm&type=5
        PermissionSet ps = new PermissionSet(Name=Randomutility.getString(4),label=Randomutility.getString(4));
        insert ps;
        List<ObjectPermissions> op = new List<ObjectPermissions>();
        op.add(new ObjectPermissions(ParentId=ps.Id,
                                     SobjectType='Contact',
                                     PermissionsRead=true,
                                     PermissionsEdit=true,
                                     PermissionsDelete =true,
                                     PermissionsCreate=true,
                                     PermissionsModifyAllRecords=true,
                                     PermissionsViewAllRecords=true));
        op.add(new ObjectPermissions(ParentId=ps.Id,
                                     SobjectType='Opportunity',
                                     PermissionsRead=true,
                                     PermissionsEdit=true,
                                     PermissionsDelete =true,
                                     PermissionsCreate=true,
                                     PermissionsModifyAllRecords=true,
                                     PermissionsViewAllRecords=true));
        insert op;
        return ps;
    }
    
}