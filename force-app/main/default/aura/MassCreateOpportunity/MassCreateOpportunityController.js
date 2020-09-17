({
	doInit : function(component, event, helper) {
        //get campaing default recordtype if any
        helper.callApex(component,"getDefaultRecordTypeIdForCampaign",function(response){
            let status = response.getState();
            let data = response.getReturnValue();
            if (status === "SUCCESS"){
                if(data){
                    component.set('v.isDefaultExists',true)
                    component.set('v.selectedRecordType',data.RecordTypeId);
                }
            }
            helper.getOptions(component,data);
        },{
            campaingId:component.get("v.recordId")
        });
        
        
        
	},
    cancel: function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire(); 
    },
    createOpp: function(component, event, helper) {
        let selectedRecordType=component.get('v.selectedRecordType');
        let recordId=component.get('v.recordId');
        component.set('v.isLoading',true);
        helper.callApex(component,"createOpportunities",function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                const toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success",
                    "type":'success',
                    "message": data+" Opportunitiy Created/Updated."
                });
                toastEvent.fire();
            }
            else if(status==='ERROR'){
                let errors = response.getError();
                if (errors && errors[0]){
                    errors=helper.getErrorMessage(errors[0]);
                }   
                else {
                  errors="Unknown error";  
                } 
                let toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title":'Opportunity Creation Failed',
                    "type":"error",
                    "message": errors
                });
                toastEvent.fire();
            }
            component.set('v.isLoading',false);
            $A.get("e.force:closeQuickAction").fire(); 
            $A.get('e.force:refreshView').fire() ;
        },{
            recordTypeId:selectedRecordType,
            campaignId:recordId
        });
    }
})