({
	doInit : function(component, event, helper) {
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
        let sectionName=event.getSource().get("v.value");  
        let timelineGroups=component.get("v.timelineGroups");
        timelineGroups.forEach(function(timelineGroup, index){
            if(timelineGroup.sectionName==sectionName){
                timelineGroup.limit+=6;
                timelineGroup.load=timelineGroup.limit<timelineGroup.items.length;
            }
        });
        component.set("v.timelineGroups", timelineGroups);
    },
})