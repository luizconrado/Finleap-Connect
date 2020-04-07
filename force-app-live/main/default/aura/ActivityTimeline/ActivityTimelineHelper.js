({
	getActivitys : function(component) {
        component.set('v.loadTimeline',false);
        let action = component.get("c.getActivityTimeline");
        action.setParams({
            "recordId" : component.get("v.recordId"),
            "includeChildren": component.get("v.includeChildren")
        });
        action.setCallback(this, function(response){
            const status=response.getState() ;
            if (status=== "SUCCESS") {
                var timelineGroups = response.getReturnValue();
                var activeSections = [];
                timelineGroups.forEach(function(timelineGroup, index){
                    const sectionName = 'Section'+index;
                    activeSections.push(sectionName);
                    timelineGroup.sectionName = sectionName;
                    timelineGroup.items.forEach(function(item){
                        item.isExpanded=false;
                    });
                    timelineGroup.limit=4;
                    timelineGroup.load=timelineGroup.limit<timelineGroup.items.length;
                });
                
                component.set("v.activeSections", activeSections);
                component.set("v.timelineGroups", timelineGroups);
               
                component.set('v.loadTimeline',true);
            }
            component.set("v.isLoading", false);
        });
        
        $A.enqueueAction(action);

		
	}
})