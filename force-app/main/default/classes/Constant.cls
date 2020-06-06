public inherited  sharing class Constant {
    
    
    
    
   	//Opportunity
   	    public static final string OPPORTUNITY_FINLEAP_CONNECT_RECORDTYPE_ID{private set;get{
        if(OPPORTUNITY_FINLEAP_CONNECT_RECORDTYPE_ID == null) OPPORTUNITY_FINLEAP_CONNECT_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Finleap_Connect_Standard_Sales','Opportunity');
        return OPPORTUNITY_FINLEAP_CONNECT_RECORDTYPE_ID;
    }}
    public static final string OPPORTUNITY_INVESTMENT_IN_FINLEAP_RECORDTYPE_ID{private set;get{
        if(OPPORTUNITY_INVESTMENT_IN_FINLEAP_RECORDTYPE_ID == null) OPPORTUNITY_INVESTMENT_IN_FINLEAP_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Finleap_Investment_in_Finleap_Group','Opportunity');
        return OPPORTUNITY_INVESTMENT_IN_FINLEAP_RECORDTYPE_ID;
    }}
    public static final string OPPORTUNITY_SALES_FOR_VENTURE_RECORDTYPE_ID{private set;get{
        if(OPPORTUNITY_SALES_FOR_VENTURE_RECORDTYPE_ID == null) OPPORTUNITY_SALES_FOR_VENTURE_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Finleap_Sales_for_Ventures','Opportunity');
        return OPPORTUNITY_SALES_FOR_VENTURE_RECORDTYPE_ID;
    }}
    
    public static final string OPPORTUNITY_ECOSYSTEM_RECORDTYPE_ID{private set;get{
        if(OPPORTUNITY_ECOSYSTEM_RECORDTYPE_ID == null) OPPORTUNITY_ECOSYSTEM_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Finleap_Ecosystem_Development','Opportunity');
        return OPPORTUNITY_ECOSYSTEM_RECORDTYPE_ID;
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
        if(ACCOUNT_STANDARD_RECORDTYPE_ID==null) ACCOUNT_STANDARD_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Standard_Partner_Account','Account');
        return ACCOUNT_STANDARD_RECORDTYPE_ID;
    }}
    //Track Object
    public static final string TRACK_FIELD_CHANGE_RECORDTYPE_ID{private set;get{
        if(TRACK_FIELD_CHANGE_RECORDTYPE_ID==null)TRACK_FIELD_CHANGE_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Field_History','Field_History_Tracker__c');
        return TRACK_FIELD_CHANGE_RECORDTYPE_ID;
    }}
    public static final string TRACK_USAGE_HISTORY_RECORDTYPE_ID{private set;get{
        if(TRACK_USAGE_HISTORY_RECORDTYPE_ID == null) TRACK_USAGE_HISTORY_RECORDTYPE_ID=SchemaUtility.getRecordTypeId('Usage_Tracker','Field_History_Tracker__c');
        return TRACK_USAGE_HISTORY_RECORDTYPE_ID;
    }} 
    //Profile
    public static final string COMMUNICATION_PROFILE_ID{private set;get{
        if(COMMUNICATION_PROFILE_ID==null) COMMUNICATION_PROFILE_ID = [SELECT Id FROM Profile WHERE Name = 'Finleap Communication' LIMIT 1].Id;
        return COMMUNICATION_PROFILE_ID;
    }}
    public static final string FINLEAP_STANDARD_PROFILE_ID{private set;get{
        if(FINLEAP_STANDARD_PROFILE_ID==null) FINLEAP_STANDARD_PROFILE_ID = [SELECT Id FROM Profile WHERE Name = 'Finleap Connect Sales' LIMIT 1].Id;
        return FINLEAP_STANDARD_PROFILE_ID;
    }}
}