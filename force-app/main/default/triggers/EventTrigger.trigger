trigger EventTrigger on Event (after insert,after update) {
    List<Trigger_Setting__mdt> triggerSetting=[SELECT Id FROM Trigger_Setting__mdt WHERE MasterLabel='EventTrigger' AND Active__c=True];
    if(triggerSetting.size()>0) new EventTriggerHandler().run();
}