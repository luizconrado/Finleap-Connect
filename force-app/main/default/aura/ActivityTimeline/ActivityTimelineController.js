({
	doInit : function(component, event, helper) {
        const isMobile= $A.get("$Browser.formFactor")==='PHONE';
        component.set('v.isMobile',isMobile);
    	component.set("v.isLoading", true)
        helper.getActivitys(component);
        
    },
    refreshActivitys: function(component, event, helper) {
        component.set("v.isLoading", true)
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
    loadActivitys:function(component,event,helper){
        let sectionIndex=event.getSource().get("v.value");  
        let timelineGroups=component.get("v.timelineGroups");
        let loadLimiter=component.get("v.loadLimiter")

        loadLimiter.limit+=1;
        loadLimiter.load =loadLimiter.limit<timelineGroups.length;
        
        component.set("v.loadLimiter", loadLimiter);
    },
})