trigger OpportuntityChangeTrigger on OpportunityChangeEvent (after insert) {
    
    for(OpportunityChangeEvent opportunity:Trigger.new){
        EventBus.ChangeEventHeader header = opportunity.ChangeEventHeader;
        List<String> ids=header.recordIds;
        List<String> changedFields=header.changedfields;
        List<String> nulledFields=header.nulledfields;
        
        String userId=header.commituser;
        System.debug(userId+' : '+header.changetype);
        if (header.changetype == 'CREATE') {
            
        }
        if (header.changetype == 'UPDATE') { 
            for(String field:changedFields){
                System.debug('new Value '+opportunity.get(field));
            }
            System.debug('changedFields '+changedFields);
            System.debug('nulledFields '+nulledFields);
        } 
        
    }
}