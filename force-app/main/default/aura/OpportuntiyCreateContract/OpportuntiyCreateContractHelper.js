({
	callApex : function(component,methodname,callback,params) {
        const action = component.get("c."+methodname);
        if(params){
            action.setParams(params);    
        }
        action.setCallback(this,callback);
        $A.enqueueAction(action);
    },
    toast:function(type,title,message){
        const toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title":title,
            "type":type,
            "message":message
        });
        toastEvent.fire();
    }
})