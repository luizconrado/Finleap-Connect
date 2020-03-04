@isTest
public class SchemaUtilityTest {
	@isTest
    static void getRecordTypeIdPositive(){
        String standardTaskId=SchemaUtility.getRecordTypeId('Standard_Task','Task');
        System.assert(!String.isEmpty(standardTaskId));
    }
    @isTest
    static void getRecordTypeIdNegative(){
        String standardTaskId=SchemaUtility.getRecordTypeId('Task','Task');
        System.assert(String.isEmpty(standardTaskId));
    }
}