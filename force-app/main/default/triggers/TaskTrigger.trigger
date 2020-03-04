trigger TaskTrigger on Task (after insert) {
    List<Trigger_Setting__mdt> triggerSetting=[SELECT Id FROM Trigger_Setting__mdt WHERE MasterLabel='TaskTrigger'];
    if(triggerSetting.size()>0) new TaskTriggerHandler().run();
}