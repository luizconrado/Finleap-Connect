trigger TrackingEventsTrigger on Tracking_Events__e (after insert) {
    List<Trigger_Setting__mdt> triggerSetting=[SELECT Id FROM Trigger_Setting__mdt WHERE MasterLabel='TrackingEventsTrigger' AND Active__c=True];
    if(triggerSetting.size()>0) new TrackingEventsHandler().run();
}