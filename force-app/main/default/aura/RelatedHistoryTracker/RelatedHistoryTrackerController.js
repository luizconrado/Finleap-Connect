({
	doInit : function(component, event, helper) {
        const isMobile= $A.get("$Browser.formFactor")==='PHONE';
        component.set('v.isMobile',isMobile);
        helper.callApex(component,"fetchRecordHistory",function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                data=helper.getViewList(data)
                console.log('data',data)
                component.set('v.historyList',data)
                component.set('v.historyViewList',data.slice(0,3));
                component.set('v.loadView',true)
                
            }
            else if (status === "ERROR") {
                const toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Related History error!",
                    "type":'error',
                    "message": "Please contact your system admin if problem continues."
                });
                toastEvent.fire();
            }
        },{
            "recordId" : component.get("v.recordId"),
            "objectName": component.get("v.sObjectName")
        })
	},
     viewAllInvoked:function(component){
        //show view all popup
        const isMobile=component.get('v.isMobile');
        if(isMobile){
            //if in mobile context opening modal as refrence
            const viewAllListData=component.get('v.historyList');
            const relatedList={
                componentDef:"c:RelatedListItem",
                attributes: {
                    tileclass:"slds-box",
                    sobjectName:"User",
                    recordList:viewAllListData,
                    viewLength:viewAllListData.length,
                    inlineDetals:true
                }
            }
            const compReference = {
                type: 'standard__component',
                attributes: {
                    componentName: 'c__Modal',
                },
                state: {
                    "c__header":'Field History ('+viewAllListData.length+')',
                    "c__def":JSON.stringify(relatedList.componentDef),
                    "c__att":JSON.stringify(relatedList.attributes),
                    "c__recordId":component.get('v.recordId')
                }
            };
            const navService = component.find("navService");
            navService.navigate(compReference);
        }
        else{
            component.set('v.isViewAll',true);
        }
    },
})