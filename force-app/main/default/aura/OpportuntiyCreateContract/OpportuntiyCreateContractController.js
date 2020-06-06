({
    onsubmit:function(component, event, helper){
        component.set('v.loader',true);        
    },
	onContractCreated : function(component, event, helper) {
        let updatedRecord = JSON.parse(JSON.stringify(event.getParams()));
        let contractid=updatedRecord.response.id;
        
        helper.callApex(component,'updateOpportuntiyWithContract',function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                helper.toast('success','Contract Created','New Contract Created Succuffuly.')
                let data = response.getReturnValue();
                $A.get('e.force:refreshView').fire() 
            }
            else if (status === "ERROR") {
            }
            component.set('v.loader',false);
            $A.get("e.force:closeQuickAction").fire()
                
        },{
            oppId:component.get('v.recordId'),
            contractId:contractid
        });
        
        
    },
    onClose:function(component,event,helper){
        $A.get("e.force:closeQuickAction").fire();
    }
})