public class TestDataFactory {
    
    //Generator
    public static Account getStandardAccount(Final Boolean isInsert){
        return getAccount(Constant.ACCOUNT_STANDARD_RECORDTYPE_ID,isInsert);
    }
    public static void setAccountTeamMember(string UserId,String AccountId){
        AccountTeamMember atm=new AccountTeamMember();
        atm.UserId=UserId;
        atm.AccountId=AccountId;
        atm.TeamMemberRole='Finleap - MD Responsible';	
        atm.CaseAccessLevel='Edit';
        atm.ContactAccessLevel='Edit';
        atm.OpportunityAccessLevel='Edit';
        atm.AccountAccessLevel='Edit'; 
        insert atm;
    }
    
    public static Contact getStandardContact(Final String accountId,Final Boolean isInsert){
        return getContact(Constant.CONTACT_STANDARD_RECORDTYPE_ID,accountId,isInsert);
    }
    public static Opportunity getFinleapInvestmentOpportunity(Final String accountId,Final Boolean isInsert){
        return getOpportunity(Constant.OPPORTUNITY_INVESTMENT_IN_FINLEAP_RECORDTYPE_ID,accountId,isInsert);
    }
    public static Opportunity getFinleapEcosystemOpportunity(Final String accountId,Final Boolean isInsert){
        return getOpportunity(Constant.OPPORTUNITY_ECOSYSTEM_RECORDTYPE_ID,accountId,isInsert);
    }
    public static void setOpportunityTeamMemeber(String UserId,String OpportunityId){
        OpportunityTeamMember otm=new OpportunityTeamMember();
        otm.UserId=UserId;
        otm.OpportunityId=OpportunityId;
        otm.TeamMemberRole='Finleap - MD Responsible';	
        otm.OpportunityAccessLevel='Edit';
     	insert otm;   
     
    }
    public static User getCommunicationsUser(Final Boolean isInsert){
        return getUser(Constant.COMMUNICATION_PROFILE_ID,isInsert);
    }
    public static User getStandardUser(Final Boolean isInsert){
        return getUser(Constant.FINLEAP_STANDARD_PROFILE_ID,isInsert);
    }
   
    public static void addOpportunityToContact(String oppId,String contactId){
        getOpportunityContactRole(contactId,oppId,true);
    }
    
    public static ContentDocumentLink setContentDocumentLink(String ContentDocumentId,String recordId,boolean isInsert){
        ContentDocumentLink cdl=new ContentDocumentLink();
        cdl.ContentDocumentId=ContentDocumentId;
        cdl.LinkedEntityId=recordId;
        cdl.ShareType='V';
        cdl.Visibility='AllUsers';
        if(isInsert)insert cdl;
        return cdl;
    }
    public static ContentVersion getContentDocument(String fileType,String documentId,Boolean isInsert){
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode(EncodingUtil.base64Encode(Blob.valueOf(RandomUtility.getString(100))));
        cv.Title = fileType;
        cv.PathOnClient = RandomUtility.getString(6);
        cv.Type__c=fileType;
        if(!String.isBlank(documentId)) cv.ContentDocumentId=documentId;
        if(isInsert) insert cv;
        return cv;
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
        opp.CloseDate=Date.today()+10;
        opp.Finleap_Company__c='Finleap Connect';
        opp.Product_Vertical__c='None';
        opp.Revenue_Start_Date__c=Date.today()+1;
        opp.RecordTypeId=recordTypeId;
        if(isInsert) insert opp;
        return opp;
    }
    private static OpportunityContactRole getOpportunityContactRole(String contactId,String oppId,Boolean isInsert){
        OpportunityContactRole ocr = new OpportunityContactRole();
        ocr.ContactId = contactId;
        ocr.OpportunityId = oppId;
        ocr.IsPrimary = TRUE;
        ocr.Role = 'Decision Maker';
       	if(isInsert) insert ocr;
        return ocr;
    }
    
   
   
  
   
}