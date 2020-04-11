({
	doInit : function(component, event, helper) {
		helper.getFiles(component);
	},
    showAll: function(component){
        component.set('v.isViewAll',true);
    },
    openFile:function(component,event){
        let id=event.currentTarget.id;
        const navService = component.find("navService");
        const pageReference={    
            "type": "standard__recordPage",
            "attributes": {
                "recordId": id,
                "objectApiName": "ContentDocument",
                "actionName": "view"
            }
        };
        navService.navigate(pageReference);
        component.set('v.isViewAll',false);
    },
    handleSelect:function(component,event,helper){
        let selectedMenuItemValue = event.getParam("value");
        if(selectedMenuItemValue==='Upload_File'){
            component.set('v.isNewFile',true);
        }
        
    }
})