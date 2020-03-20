({
    onInit : function(component, event, helper) {
        helper.call(component,'getAccessDetails',function(response){
            let state = response.getState();
            let data = response.getReturnValue();
            if(state==='SUCCESS'){
                 const accessDetails=data;
                if(data.access==='false'){
                    helper.redirect(component,accessDetails.id,accessDetails.msg)
                }
            }
           
        },{
            activityId:component.get('v.recordId')
        });	
    }
})