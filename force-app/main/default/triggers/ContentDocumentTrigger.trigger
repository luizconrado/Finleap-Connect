trigger ContentDocumentTrigger on ContentDocument (before delete) {
    List<Trigger_Setting__mdt> triggerSetting=[SELECT Id FROM Trigger_Setting__mdt WHERE MasterLabel='ContentDocumentTrigger' AND Active__c=True];
    if(triggerSetting.size()>0)  new ContentDocumentHandler().run();
    
}