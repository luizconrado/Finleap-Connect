public class TestDataFactory {
    
    //genrators
    public static User getFinleapUser(Final Boolean isInsert){
        return getUser(Constant.FINLEAP_PROFILE_ID,isInsert);
 	}
    public static User getFinleapConnectUser(Final Boolean isInsert){
        return getUser(Constant.FINLEAP_CONNECT_PROFILE_ID,isInsert);
 	}
    public static User getFinleapGlobalUser(Final Boolean isInsert){
        return getUser(Constant.FINLEAP_GLOBAL_PROFILE_ID,isInsert);
 	}
    
    public static Account getStandardAccount(Final Boolean isInsert){
        return getAccount(Constant.ACCOUNT_STANDARD_RECORDTYPE_ID,isInsert);
    }
    public static Contact getStandardContact(Final String accountId,Final Boolean isInsert){
        return getContact(Constant.CONTACT_STANDARD_RECORDTYPE_ID,accountId,isInsert);
    }
    //Helpers
    private static User getUser(final Id profileId,Final Boolean isInsert) {
        User u = new User(
            Phone = RandomUtillity.getString(10),
            FirstName = RandomUtillity.getString(4),
            LastName = RandomUtillity.getString(4),
            Username = RandomUtillity.getString(8)+'@finleap.com',
            Email = RandomUtillity.getString(6)+'@finleap.com',
            Alias = RandomUtillity.getString(4),
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
        	Name=RandomUtillity.getString(7),
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
            LastName=RandomUtillity.getString(7),
            Email=RandomUtillity.getString(4)+'@finleap.com',
            AccountId=accountId
        );
        if(isInsert) insert con;
        return con;
        
    }
    
}