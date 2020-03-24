({
	doInit : function(component, event, helper) {
		helper.getOpportunitys(component);
	},
    showSpinner : function(component, event, helper) {
        //component.set("v.isLoading", true); 
    },
    
    hideSpinner : function(component, event, helper) {
        //component.set("v.isLoading", false); 
    },
    openOppPopUp: function(component, event, helper) {
        let id=event.currentTarget.id;
        let oppList=component.get('v.opportunityList');
        const oppData=oppList.filter(o=>o.Id===id)[0];
        
        
        
        helper.createView(component,oppData);
        
        //component.set('v.Opportunity', );
        component.set('v.isViewAll',false);
        component.set('v.isView',true);
        
    },
    showAll: function(component, event, helper) {
        const fields=component.get('v.opportunityFieldsList');
        const data=component.get('v.opportunityList');
        component.set('v.viewAllData',helper.getViewList(fields,data,data.length))
        component.set('v.isViewAll',true);
    }
})