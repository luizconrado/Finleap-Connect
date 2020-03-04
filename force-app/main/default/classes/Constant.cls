public inherited  sharing class Constant {
    //Task
    public static final string TASK_STANDARD_RECORDTYPE_ID{private set;get{
        if(TASK_STANDARD_RECORDTYPE_ID==null)TASK_STANDARD_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Standard_Task','Task');
        return TASK_STANDARD_RECORDTYPE_ID;
    }}
    public static final string TASK_FINLEAP_INVESTMENT_RECORDTYPE_ID{private set;get{
        if(TASK_FINLEAP_INVESTMENT_RECORDTYPE_ID==null)TASK_FINLEAP_INVESTMENT_RECORDTYPE_ID= SchemaUtility.getRecordTypeId('Finleap_Invesment_Task','Task');
        return TASK_FINLEAP_INVESTMENT_RECORDTYPE_ID;
    }}
    //Opportunity
    public static final string OPPORTUNITY_FINLEAP_INVESTMENT_RECORDTYPE_ID{private set;get{
        if(OPPORTUNITY_FINLEAP_INVESTMENT_RECORDTYPE_ID==null)OPPORTUNITY_FINLEAP_INVESTMENT_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Finleap_Investment_Opportunity','Opportunity');
        return OPPORTUNITY_FINLEAP_INVESTMENT_RECORDTYPE_ID;
    }}
    public static final string OPPORTUNITY_STANDARD_RECORDTYPE_ID{private set;get{
        if(OPPORTUNITY_STANDARD_RECORDTYPE_ID == null) OPPORTUNITY_STANDARD_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Standard_Sales_Opportunity','Opportunity');
        return OPPORTUNITY_STANDARD_RECORDTYPE_ID;
    }}
    //Contact
    public static final string CONTACT_FINLEAP_INVESTMENT_RECORDTYPE_ID{private set;get{
        if(CONTACT_FINLEAP_INVESTMENT_RECORDTYPE_ID == null) CONTACT_FINLEAP_INVESTMENT_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Finleap_Invesment_Contact','Contact');
        return CONTACT_FINLEAP_INVESTMENT_RECORDTYPE_ID;
    }}
    public static final string CONTACT_STANDARD_RECORDTYPE_ID{private set;get{
        if(CONTACT_STANDARD_RECORDTYPE_ID==null) CONTACT_STANDARD_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Standard_Contact','Contact');
        return CONTACT_STANDARD_RECORDTYPE_ID;
    }}
    //Account
    public static final string ACCOUNT_FINLEAP_INVESTOR_RECORDTYPE_ID{private set;get{
        if(ACCOUNT_FINLEAP_INVESTOR_RECORDTYPE_ID == null) ACCOUNT_FINLEAP_INVESTOR_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Finleap_Investor_Account','Account');
        return ACCOUNT_FINLEAP_INVESTOR_RECORDTYPE_ID;
    }}
    public static final string ACCOUNT_STANDARD_RECORDTYPE_ID{private set;get{
        if(ACCOUNT_STANDARD_RECORDTYPE_ID==null) ACCOUNT_STANDARD_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Standard_Account','Account');
        return ACCOUNT_STANDARD_RECORDTYPE_ID;
    }}
    //Profile
    public static final string FINLEAP_CONNECT_PROFILE_ID{private set;get{
        if(FINLEAP_CONNECT_PROFILE_ID==null) FINLEAP_CONNECT_PROFILE_ID = [SELECT Id FROM Profile WHERE Name = 'Finleap Connect User' LIMIT 1].Id;
        return FINLEAP_CONNECT_PROFILE_ID;
    }}
    public static final string FINLEAP_PROFILE_ID{private set;get{
        if(FINLEAP_PROFILE_ID==null) FINLEAP_PROFILE_ID = [SELECT Id FROM Profile WHERE Name = 'Finleap User' LIMIT 1].Id;
        return FINLEAP_PROFILE_ID;
    }}
    public static final string FINLEAP_GLOBAL_PROFILE_ID{private set;get{
        if(FINLEAP_GLOBAL_PROFILE_ID==null) FINLEAP_GLOBAL_PROFILE_ID = [SELECT Id FROM Profile WHERE Name = 'Finleap Global User' LIMIT 1].Id;
        return FINLEAP_GLOBAL_PROFILE_ID;
    }}

}