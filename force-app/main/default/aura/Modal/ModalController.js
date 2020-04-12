({
    onInit: function(component, event, helper) {
        const pageReference = component.get("v.pageReference");
        if(pageReference && pageReference.state){
            component.set("v.header", pageReference.state.c__header);
            if(pageReference.state.c__def && pageReference.state.c__att){
                let def=JSON.parse(pageReference.state.c__def)
                let att=JSON.parse(pageReference.state.c__att)
                $A.createComponents([[def,att]],function(components, status, errorMessage){
                    if (status === "SUCCESS") {
                        component.set('v.body',components)
                    }
                });
            }
            
            if(pageReference.state.c__recordId)
                component.set("v.recordId", pageReference.state.c__recordId);
            if(pageReference.state.c__isLarge)
                component.set("v.isLarge", pageReference.state.c__isLarge);
            component.set("v.open", true);
            component.set("v.isMobile", true);
            
        }
        
        
    },
	closeModel : function(component, event, helper) {
        component.set('v.open',false);
        const recordId=component.get('v.recordId');
        if(recordId){
            const navEvt = $A.get("e.force:navigateToSObject");
            navEvt.setParams({
                "recordId": recordId,
                "slideDevName": "detail"
            });
            navEvt.fire();
        }
	}
})