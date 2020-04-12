public with sharing class RelatedAttachmentsController {

    @AuraEnabled
    public static List<ContentDocument> getAllAttachments(String recordId,String sObjectName){
        List<ContentDocumentLink> links=[SELECT Id, LinkedEntityId, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId=:recordId];
        Set<Id> contentDocumentIds=new Set<Id>();
        for(ContentDocumentLink cdl:links) contentDocumentIds.add(cdl.ContentDocumentId);
        return [SELECT Id, Title,Owner.Name,LastModifiedDate, ContentSize, FileType, FileExtension, ContentModifiedDate FROM ContentDocument WHERE Id IN:contentDocumentIds AND FileType!='SNOTE' ORDER By ContentModifiedDate DESC];
    }
    
    @AuraEnabled
    public static List<String> getAllOptions(String recordId,String sObjectName){
        List<String> options=new List<String>();
        options.add('--Select Type--');
        options.add('Terms and Condition');
        options.add('Valuation');
        options.add('Other File');
        return options;
    }
    
    @AuraEnabled 
    public static List<ContentVersion> checkDuplicateFile(string recordId,String fileType){
        List<ContentDocumentLink> link=[SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId=:recordId];
        List<String> contentDocumentIds=new List<String>();
        For(ContentDocumentLink doc:link){
            contentDocumentIds.add(doc.ContentDocumentId);
        }
        return [SELECT Id, ContentDocumentId,Title,ContentSize,Type__c,ContentModifiedDate,FileExtension,ContentModifiedBy.Name FROM ContentVersion WHERE Type__c=:fileType AND ContentDocumentId IN: contentDocumentIds ORDER BY ContentModifiedDate DESC];
    }
    
    @AuraEnabled
    public static void uploadContentVersion(String base64,String fileType,String documentId,String filename,String recordId){
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode(base64);
        cv.Title = fileType;
        cv.Upload__c=true;
        cv.PathOnClient = filename;
        cv.Type__c=fileType;
        if(!String.isBlank(documentId)){
            cv.ContentDocumentId=documentId;
        }
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