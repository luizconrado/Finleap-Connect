({
    call : function(cmp,methodName,callback,params) {
        let action = cmp.get("c."+methodName);
        if(params)
            action.setParams(params);
        action.setCallback(this,callback);
        
        $A.enqueueAction(action);
    },
    redirect:function(component,recid,message){
        const navService=component.find("navService");
        const notifLib= component.find('notifLib');
        notifLib.showNotice({
            "variant": "error",
            "header": "Insufficient access",
            "message": message,
            closeCallback: function() {
                const pageReference = {
                    type: 'standard__recordPage',
                    attributes: {
                        objectApiName: 'Opportunity',
                        recordId: recid,
                        actionName: "view"

                    }
                };
                
                navService.navigate(pageReference);
            }
        });
    }
})