@isTest
public class SchemaUtilityTest {
	@isTest
    static void getRecordTypeIdPositive(){
        String standardTaskId=SchemaUtility.getRecordTypeId('Standard_Lead','Lead');
        System.assert(!String.isEmpty(standardTaskId));
    }
    @isTest
    static void getRecordTypeNamePositive(){
        String standardLeadId=SchemaUtility.getRecordTypeId('Standard_Lead','Lead');
        String standardLeadName=SchemaUtility.getRecordTypeName(standardLeadId,'Lead');
        System.assertEquals('Standard_Lead', standardLeadName);
    }
     @isTest
    static void getRecordTypeNameNegative(){
        String standardLeadName=SchemaUtility.getRecordTypeName('0060Q000009psZFQAY','Lead');
        System.assert(String.isEmpty(standardLeadName));
    }
    @isTest
    static void getRecordTypeIdNegative(){
        String standardTaskId=SchemaUtility.getRecordTypeId('Task','Task');
        System.assert(String.isEmpty(standardTaskId));
    }
    @isTest
    static void getFieldSetMembersTest(){
        FieldSet[] fieldDetails=SchemaUtility.getFieldSetMembers('Opportunity',Constant.OPPORTUNITY_GLOBAL_RELATED_FIELDSET);
        System.assertNotEquals(0,fieldDetails.size());
            
    }
}