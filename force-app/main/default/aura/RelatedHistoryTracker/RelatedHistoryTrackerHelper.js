({
    callApex : function(component,methodname,callback,params) {
        const action = component.get("c."+methodname);
        if(params){
            action.setParams(params);    
        }
        action.setCallback(this,callback);
        $A.enqueueAction(action);
    },
     getViewList:function(files){
         const _self=this;
         let displayList=[];
         //creates view object list
         files.forEach(function(file,index){
             let fileObj={};
             fileObj.access=true;
             fileObj.Id=file.Id;
             fileObj.header=file.CreatedBy.Name;
             fileObj.field1Label='Field';
             fileObj.field1Value=file.Field_Label__c;
             fileObj.field2Label='Modified Date';
             fileObj.field2Value=_self.parseDate(file.CreatedDate)
             fileObj.field3Label='New Value';
             fileObj.field3Value=file.New_Value__c;
             fileObj.field4Label='Old Value';
             fileObj.field4Value=file.Old_Value__c;
             displayList.push(fileObj);
         });
         return displayList;
     },
    parseDate:function(dateValue){ 
        $A.localizationService.UTCToWallTime(new Date(dateValue), $A.get('$Locale.timezone'),function(offSetDateTime){
            dateValue=offSetDateTime
        });
        return $A.localizationService.formatDateTimeUTC(dateValue,$A.get('$Locale').dateFormat);
    },
})