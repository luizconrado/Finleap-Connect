trigger ContactTrigger on Contact (after update) {
    List<Trigger_Setting__mdt> triggerSetting=[SELECT Id FROM Trigger_Setting__mdt WHERE MasterLabel='ContactTrigger' AND Active__c=True];
    if(triggerSetting.size()>0) new ContactTriggerHandler().run();
}