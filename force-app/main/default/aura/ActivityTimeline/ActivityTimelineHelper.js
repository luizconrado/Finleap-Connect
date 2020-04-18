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
                });
                //Adding limit to length of time sections load on init
                let loadLimiter={
                    limit:2,
                    load:2<timelineGroups.length
                };
                
                component.set("v.loadLimiter", loadLimiter);
                component.set("v.activeSections", activeSections);
                component.set("v.timelineGroups", timelineGroups);
               
                component.set("v.loadTimeline",true);
                component.set("v.isLoading", false);
            }
            else if(status=="ERROR"){
                const toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Timeline Error!",
                    "type":'error',
                    "message": "Please contact your system admin if problem continues."
                });
                toastEvent.fire();
            }
            
        });
        
        $A.enqueueAction(action);

		
	}
})