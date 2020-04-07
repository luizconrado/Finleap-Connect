({
	doInit : function(component, event, helper) {
		helper.getOpportunitys(component);
	},
    showSpinner : function(component, event, helper) {
        //component.set("v.isLoading", true); 
    },
    
    hideSpinner : function(component, event, helper) {
        component.set("v.isLoading", false); 
    },
    openOppPopUp: function(component, event, helper) {
        let id=event.currentTarget.id;
        let oppList=component.get('v.opportunityList');
        const oppData=oppList.filter(o=>o.Id===id)[0];
        if(!oppData.access){
            component.set('v.viewRecordData',[]);
        	helper.createView(component,oppData);  
            component.set('v.isView',true);
        }
        else{
        	const navService = component.find("navService");
            const pageReference={    
                "type": "standard__recordPage",
                "attributes": {
                    "recordId": oppData.Id,
                    "objectApiName": "Opportunity",
                    "actionName": "view"
                }
            };
            navService.navigate(pageReference);
        }
        component.set('v.isViewAll',false);

    },
    showAll: function(component, event, helper) {
        const fields=component.get('v.opportunityFieldsList');
        const data=component.get('v.opportunityList');
        component.set('v.viewAllData',helper.getViewList(fields,data,data.length))
        component.set('v.isViewAll',true);
    }
})