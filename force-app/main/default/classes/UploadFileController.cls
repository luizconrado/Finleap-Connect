public with sharing class UploadFileController {
   
    @AuraEnabled
    public static List<ContentVersion> checkDuplicateFile(string recordId,String fileType){
        List<ContentDocumentLink> link=[SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId=:recordId];
        List<String> contentDocumentIds=new List<String>();
        For(ContentDocumentLink doc:link){
            contentDocumentIds.add(doc.ContentDocumentId);
        }
        return [SELECT Id, ContentDocumentId,Title, Type__c FROM ContentVersion WHERE Type__c=:fileType AND ContentDocumentId IN: contentDocumentIds];
    }
    
    @AuraEnabled
    public static void uploadContentVersion(String base64,String fileType,String documentId,String filename,String recordId){
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode(base64);
        cv.Title = fileType;
        cv.Upload__c=true;
        cv.PathOnClient = fileType;
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
    
    @AuraEnabled
    public static List<String> getSupportedStypes(String recordId,String objectName){
       	String query='SELECT id,RecordType.DeveloperName FROM '+objectName+' WHERE Id =:recordId';
        List<String> supportedTypes=new List<String>();
        if(objectName=='Account'){
            Account acc=Database.query(query);
            List<Files_Options__mdt> options=[SELECT Options__c FROM Files_Options__mdt WHERE Object_Name__c=:objectName AND DeveloperName=:acc.RecordType.DeveloperName ];
            if(options.size()>0){
                supportedTypes=options[0].Options__c.split(',');
            }
        }
        return supportedTypes;
    }
    
}