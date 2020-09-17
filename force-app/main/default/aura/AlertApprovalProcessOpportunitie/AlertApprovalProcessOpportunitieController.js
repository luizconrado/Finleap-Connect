({
	getStatus : function(component, event, helper) {
        let oppRecord=component.get('v.oppRecord');
        if(oppRecord && oppRecord.StageName=='Confirmed' || oppRecord.StageName=='Closed Won'){
            helper.callApex(component,"getApprovalProcessStatus",function(response){
                let status=response.getState();
                if (status === "SUCCESS"){
                    let data = response.getReturnValue();
                    component.set('v.loadView',data)
                    let appEvent = $A.get("e.c:GlobalApplicationEvent");
                    appEvent.setParams({ "fromComponent": "AlertApprovalProcess",
                                        "toComponent":"All",
                                        "data":{
                                            "isInApproval":data
                                        }
                                       });
                    appEvent.fire();
                }
            },{
                recordId:component.get('v.recordId')
            });
        }
		
	}
})