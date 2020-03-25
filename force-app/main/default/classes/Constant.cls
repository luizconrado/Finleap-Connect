public inherited  sharing class Constant {
   	/*
    //Task
    public static final string TASK_STANDARD_RECORDTYPE_ID{private set;get{
        if(TASK_STANDARD_RECORDTYPE_ID==null)TASK_STANDARD_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Standard_Task','Task');
        return TASK_STANDARD_RECORDTYPE_ID;
    }}
    //Event
     public static final string EVENT_STANDARD_RECORDTYPE_ID{private set;get{
        if(EVENT_STANDARD_RECORDTYPE_ID==null)EVENT_STANDARD_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Standard_Event','Event');
        return EVENT_STANDARD_RECORDTYPE_ID;
    }}
    //Opportunity
    public static final string OPPORTUNITY_BOARD_ECOSYSTEM_RECORDTYPE_ID{private set;get{
        if(OPPORTUNITY_BOARD_ECOSYSTEM_RECORDTYPE_ID == null) OPPORTUNITY_BOARD_ECOSYSTEM_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Board_ecosystem_development','Opportunity');
        return OPPORTUNITY_BOARD_ECOSYSTEM_RECORDTYPE_ID;
    }}
    */
    public static final string OPPORTUNITY_INVESTMENT_IN_FINLEAP_RECORDTYPE_ID{private set;get{
        if(OPPORTUNITY_INVESTMENT_IN_FINLEAP_RECORDTYPE_ID == null) OPPORTUNITY_INVESTMENT_IN_FINLEAP_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Investment_in_finleap','Opportunity');
        return OPPORTUNITY_INVESTMENT_IN_FINLEAP_RECORDTYPE_ID;
    }}
    
    
    
    public static final string OPPORTUNITY_GLOBAL_RELATED_FIELDSET{private set;get{
        if(OPPORTUNITY_GLOBAL_RELATED_FIELDSET==null)OPPORTUNITY_GLOBAL_RELATED_FIELDSET='Global_Related_List_Fields';
        return OPPORTUNITY_GLOBAL_RELATED_FIELDSET;
    }}
    //Contact
    public static final string CONTACT_STANDARD_RECORDTYPE_ID{private set;get{
        if(CONTACT_STANDARD_RECORDTYPE_ID==null) CONTACT_STANDARD_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Standard_Contact','Contact');
        return CONTACT_STANDARD_RECORDTYPE_ID;
    }}
    //Account
    public static final string ACCOUNT_STANDARD_RECORDTYPE_ID{private set;get{
        if(ACCOUNT_STANDARD_RECORDTYPE_ID==null) ACCOUNT_STANDARD_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Standard_Account','Account');
        return ACCOUNT_STANDARD_RECORDTYPE_ID;
    }}
    /*
    //Profile
    public static final string FINLEAP_CONNECT_PROFILE_ID{private set;get{
        if(FINLEAP_CONNECT_PROFILE_ID==null) FINLEAP_CONNECT_PROFILE_ID = [SELECT Id FROM Profile WHERE Name = 'Finleap Connect' LIMIT 1].Id;
        return FINLEAP_CONNECT_PROFILE_ID;
    }}
    public static final string FINLEAP_GROUP_PROFILE_ID{private set;get{
        if(FINLEAP_GROUP_PROFILE_ID==null) FINLEAP_GROUP_PROFILE_ID = [SELECT Id FROM Profile WHERE Name = 'Finleap Group' LIMIT 1].Id;
        return FINLEAP_GROUP_PROFILE_ID;
    }}
*/
    public static final string COMMUNICATION_PROFILE_ID{private set;get{
        if(COMMUNICATION_PROFILE_ID==null) COMMUNICATION_PROFILE_ID = [SELECT Id FROM Profile WHERE Name = 'Communication Team' LIMIT 1].Id;
        return COMMUNICATION_PROFILE_ID;
    }}

}