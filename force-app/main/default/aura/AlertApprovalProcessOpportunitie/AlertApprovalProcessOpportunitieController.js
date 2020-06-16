({
	getStatus : function(component, event, helper) {
        let oppRecord=component.get('v.oppRecord');
        if(oppRecord.StageName=='Confirmed' || oppRecord.StageName=='Closed Won'){
            helper.callApex(component,"getApprovalProcessStatus",function(response){
                let status=response.getState();
                if (status === "SUCCESS"){
                    let data = response.getReturnValue();
                    component.set('v.loadView',data)
                    
                }
            },{
                recordId:component.get('v.recordId')
            });
        }
		
	}
})