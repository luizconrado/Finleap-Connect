public with sharing class RelatedAttachmentsController {
    
    @AuraEnabled
    public static List<ContentDocument> getAllAttachments(String recordId,String sObjectName){
        List<ContentDocumentLink> links=[SELECT Id, LinkedEntityId, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId=:recordId];
        Set<Id> contentDocumentIds=new Set<Id>();
        for(ContentDocumentLink cdl:links) contentDocumentIds.add(cdl.ContentDocumentId);
        return [SELECT Id, Title,Owner.Name,LastModifiedDate, ContentSize, FileType, FileExtension, ContentModifiedDate FROM ContentDocument WHERE Id IN:contentDocumentIds AND FileType!='SNOTE' ORDER By ContentModifiedDate DESC];
    }
    
}