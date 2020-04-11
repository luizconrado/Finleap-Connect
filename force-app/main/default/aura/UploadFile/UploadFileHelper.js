({
    callApex : function(component,method,response,parameters) {
        let action = component.get('c.'+method);
        if(parameters)
        action.setParams(parameters);
        action.setCallback(this,response);
        $A.enqueueAction(action);
    },
    changeSetp : function(component,step) {
        component.set('v.currentStep',step);
    },
    toggleLoader:function(component){
        component.set('v.loader',!component.get('v.loader'));
    },

    showToast:function(type,message,title){
        let toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title":title,
            "type":type,
            "message": message
        });
        toastEvent.fire();
    }
})