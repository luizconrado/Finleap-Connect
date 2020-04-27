@isTest
public class SchemaUtilityTest {
	@isTest
    static void getRecordTypeIdPositive(){
        String standardTaskId=SchemaUtility.getRecordTypeId('Standard_Lead','Lead');
        System.assert(!String.isEmpty(standardTaskId));
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