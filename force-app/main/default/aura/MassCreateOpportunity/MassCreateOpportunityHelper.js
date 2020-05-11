({
    
	callApex : function(component,methodname,callback,params) {
        const action = component.get("c."+methodname);
        if(params){
            action.setParams(params);    
        }
        action.setCallback(this,callback);
        $A.enqueueAction(action);
    },
    getOptions:function(component,opp){
        let helper=this;
        //get all record types
        helper.callApex(component,"getOpportunityRecordTypes",function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                if(opp){
                    let recordTypePermissionExsists=data.find(function(info){
                        return info.fieldAPIName==opp.RecordTypeId;
                    });
                    if(recordTypePermissionExsists){
                        component.set('v.warningMessage',recordTypePermissionExsists.fieldLabel+' is selected as default opportunity record type for the campaign.');
                    }
                    else{
                        component.set('v.warningMessage',opp.RecordType.Name+' is selected as default opportunity record type for the campaign.Insufficient permissions.');
                        component.set('v.noPermission',true);
                    }
                }
                
                
                component.set('v.recordTypes',data.map(function(info){
                    if(info.isRequired && component.get('v.isDefaultExists')==false){
                        component.set('v.selectedRecordType',info.fieldAPIName);
                    }
                    return {
                        value:info.fieldAPIName,
                        label:info.fieldLabel,
                        isDefault:info.isRequired
                    }
                }))
            }
        });
    },
    getErrorMessage:function(error){
        try{
            if(error && error.fieldErrors && error.fieldErrors.CampaignId[0] && error.fieldErrors.CampaignId[0].message){
                return  error.fieldErrors.CampaignId[0].message      
            }    
        }
        catch(err) {
            return "Please contact system admin if problem presists."; 
        }
        
    }
})