public with sharing class RelatedAttachmentsController {

    @AuraEnabled
    public static List<ContentDocument> getAllAttachments(String recordId,String sObjectName){
        //retriving all files of entity 
        List<ContentDocumentLink> links=[SELECT Id, LinkedEntityId, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId=:recordId];
        Set<Id> contentDocumentIds=new Set<Id>();
        for(ContentDocumentLink cdl:links) contentDocumentIds.add(cdl.ContentDocumentId);
        return [SELECT Id, Title,Owner.Name,LastModifiedDate, ContentSize, FileType, FileExtension, ContentModifiedDate,LatestPublishedVersion.VersionNumber  FROM ContentDocument WHERE Id IN:contentDocumentIds AND FileType!='SNOTE' ORDER By ContentModifiedDate DESC];
    }
    
    @AuraEnabled
    public static List<String> getAllOptions(String recordId,String objectName){
        String query='SELECT RecordTypeId FROM '+objectName+' where Id =:recordId';
        List<Sobject> recordList=Database.query(query);
        String recordTypeName=SchemaUtility.getRecordTypeName((String)recordList.get(0).get('RecordTypeId'), objectName);
        //based on object name and recordtype getting options from custom metadata
        List<File_Type_Option__mdt> customOptions=[SELECT Id,Types__c FROM File_Type_Option__mdt WHERE  Object_Name__c=:objectName AND Record_Type_Name__c=:recordTypeName];
        if(customOptions.size()==0) customOptions=[SELECT Id,Types__c FROM File_Type_Option__mdt WHERE  DeveloperName='Default'];
        List<String> options=new List<String>();
        options.add('--Select Type--');
        if(!String.isEmpty(customOptions.get(0).Types__c)) options.addAll(customOptions.get(0).Types__c.split(','));
     	options.add('Other File');
        return options;
    }
    
    @AuraEnabled 
    public static List<ContentVersion> checkDuplicateFile(string recordId,String fileType){
        //getting all versions of attachments
        List<ContentDocumentLink> link=[SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId=:recordId];
        List<String> contentDocumentIds=new List<String>();
        For(ContentDocumentLink doc:link) contentDocumentIds.add(doc.ContentDocumentId);
        return [SELECT Id, ContentDocumentId,Title,ContentSize,Type__c,ContentModifiedDate,FileExtension,VersionNumber,ContentModifiedBy.Name FROM ContentVersion WHERE Type__c=:fileType AND ContentDocumentId IN: contentDocumentIds ORDER BY ContentModifiedDate DESC];
    }
    
    @AuraEnabled
    public static void uploadContentVersion(String base64,String fileType,String documentId,String filename,String recordId){
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode(base64);
        cv.Title = fileType;
        cv.Upload__c=true;
        cv.PathOnClient = filename;
        cv.Type__c=fileType;
        if(!String.isBlank(documentId)) cv.ContentDocumentId=documentId;
        upsert cv;
        if(String.isBlank(documentId)){
            ContentVersion cvNew=[SELECT ContentDocumentId FROM ContentVersion WHERE id=:cv.Id];
            ContentDocumentLink cdl=new ContentDocumentLink();
            cdl.ContentDocumentId=cvNew.ContentDocumentId;
            cdl.LinkedEntityId=recordId;
            cdl.ShareType='V';
            cdl.Visibility='AllUsers';
            insert cdl;
        } 
    }
}