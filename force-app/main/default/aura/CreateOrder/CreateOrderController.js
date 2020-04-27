({
    doInit : function(component, event, helper) {
        const action = component.get("c.createEntitys");
        action.setParams({
            "quoteId" : component.get("v.recordId"),
        });    
        action.setCallback(this,function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                var pageReference = {    
                    "type": "standard__recordPage",
                    "attributes": {
                        "recordId": data,
                        "objectApiName": "Order",
                        "actionName": "view"
                    }
                }
                var navService = component.find("navService");
                
                navService.navigate(pageReference);
                
            }
            else if (status === "ERROR") {
                const toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "type":'error',
                    "message": "Please contact your system admin if problem continues."
                });
                toastEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
})