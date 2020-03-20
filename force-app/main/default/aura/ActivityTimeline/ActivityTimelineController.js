({
	doInit : function(component, event, helper) {
    	helper.getActivitys(component);
    },
    showSpinner : function(component, event, helper) {
        component.set("v.isLoading", true); 
    },
    
    hideSpinner : function(component, event, helper) {
        component.set("v.isLoading", false); 
    },
    refreshActivitys: function(component, event, helper) {
        helper.getActivitys(component);
    },
    toggleExpand: function(component, event, helper) {
        let isExpandAll=!component.get("v.isExpandAll"); 
        let timelineGroups=component.get("v.timelineGroups");
        timelineGroups.forEach(function(section){
            section.items.forEach(function(item){
                item.isExpanded=isExpandAll;
            });
        })
        component.set("v.timelineGroups",timelineGroups)
        component.set('v.isExpandAll',isExpandAll);
    },
})