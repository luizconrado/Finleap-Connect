@isTest
public class RelatedHistoryControllerTest {

    @isTest
    static void fetchRecordHistoryTest(){
        Account a=TestDataFactory.getStandardAccount(true);
        Field_History_Tracker__c change=new Field_History_Tracker__c();
        change.Field__c='Name';
        change.Field_Label__c='Name';
        change.Object_Label__c='Account';
        change.Object__c='Account';
        change.Record_Id__c=a.Id;
        change.Old_Value__c='';
        change.New_Value__c=a.Name;
        change.Record_Name__c=a.Name;
        change.Relation__c='On Record';
        change.RecordTypeId=Constant.TRACK_FIELD_CHANGE_RECORDTYPE_ID;
        insert change;
        List<Field_History_Tracker__c>  records=RelatedHistoryController.fetchRecordHistory(a.Id, 'Account');
        system.assertEquals(a.Name, records.get(0).New_Value__c);
    }
}