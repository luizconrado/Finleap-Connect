public inherited  sharing class Constant {
    
    public static final string TASK_STANDARD_RECORDTYPE_ID{private set;get{
        return SchemaUtility.getRecordTypeId('Standard_Task','Task');
    }}
    public static final string TASK_FINLEAP_INVESTMENT_RECORDTYPE_ID{private set;get{
        return SchemaUtility.getRecordTypeId('Finleap_Invesment_Task','Task');
    }}
    
    public static final string OPPORTUNITY_FINLEAP_INVESTMENT_RECORDTYPE_ID{private set;get{
        return SchemaUtility.getRecordTypeId('Finleap_Investment_Opportunity','Opportunity');
    }}
    public static final string OPPORTUNITY_STANDARD_RECORDTYPE_ID{private set;get{
        return SchemaUtility.getRecordTypeId('Standard_Sales_Opportunity','Opportunity');
    }}
    
    public static final string CONTACT_FINLEAP_INVESTMENT_RECORDTYPE_ID{private set;get{
        return SchemaUtility.getRecordTypeId('Finleap_Invesment_Contact','Contact');
    }}
    public static final string CONTACT_STANDARD_RECORDTYPE_ID{private set;get{
        return SchemaUtility.getRecordTypeId('Standard_Contact','Contact');
    }}

}