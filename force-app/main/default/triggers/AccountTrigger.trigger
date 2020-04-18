trigger AccountTrigger on Account (before update) {
    List<Trigger_Setting__mdt> triggerSetting=[SELECT Id FROM Trigger_Setting__mdt WHERE MasterLabel='AccountTrigger' AND Active__c=True];
    if(triggerSetting.size()>0) new AccountTriggerHandler().run();
}