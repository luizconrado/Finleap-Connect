trigger OpportunityTrigger on Opportunity (before update) {
    List<Trigger_Setting__mdt> triggerSetting=[SELECT Id FROM Trigger_Setting__mdt WHERE MasterLabel='OpportunityTrigger' AND Active__c=True];
    if(triggerSetting.size()>0) new OpportunityTriggerHandler().run();

    
}