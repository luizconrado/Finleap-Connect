({
    doInit : function(component, event, helper) {
        if(component.get('v.load')) return;
        component.set('v.load',true);
        let recordId=component.get('v.recordId');
        let object=component.get('v.sObjectName')
        const action = component.get("c.logEntry");
        action.setParams({
            recordId:recordId,
            objectName:object
        });    
        action.setCallback(this,function(response){});
        $A.enqueueAction(action);
        
    }
})