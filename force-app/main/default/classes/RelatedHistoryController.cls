public class RelatedHistoryController {
    
    @AuraEnabled
    public static List<Field_History_Tracker__c> fetchRecordHistory(Final String recordId,Final String objectName){
        List<Field_History_Tracker__c> history= [SELECT Id, Name, CreatedDate, CreatedById,CreatedBy.Name,LastModifiedDate, LastModifiedById, 
                                                 Object__c, Record_Id__c, Record_Name__c, Field_Label__c, Old_Value__c, New_Value__c, Record__c 
                                                 FROM Field_History_Tracker__c WHERE Record_Id__c=:recordId AND Object__c=:objectName ORDER BY CreatedDate];
        return history;
    }

}