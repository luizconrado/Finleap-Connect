({
	configMap: {
        "ListItem": {
            componentDef: "c:RelatedListItem",
            attributes: { }
        },      
    },
    callApex : function(component,methodname,callback,params) {
        const action = component.get("c."+methodname);
        if(params){
            action.setParams(params);    
        }
        action.setCallback(this,callback);
        $A.enqueueAction(action);
    },
    getViewList:function(fields,allOpp,limit){
        let _self=this;
        let displayList=[];
        allOpp.forEach(function(opp,oppIndex){
            if(oppIndex<limit){
                let oppObj={};
                oppObj.access=opp.access;
                oppObj.Id=opp.Id;
                fields.forEach(function(field,index){
                    if(index<4){
                        let  [fieldName,fieldValue]=_self.parseRecord(opp,field);
                        if(index==0){
                            oppObj.header=fieldValue;
                        }
                        if(index==1){
                            oppObj.field1Label=fieldName;
                            oppObj.field1Value=fieldValue;
                        }
                        if(index==2){
                            oppObj.field2Label=fieldName;
                            oppObj.field2Value=fieldValue;
                        }
                        if(index==3){
                            oppObj.field3Label=fieldName;
                            oppObj.field3Value=fieldValue;
                        }
                    }
                });
                displayList.push(oppObj);
            }
        });
        return displayList;
    },
    parseRecord:function(record,field){
        let _self=this;
        let fieldName=field.fieldLabel
        let fieldValue=record[field.fieldAPIName]
        if(field.fieldType=='REFERENCE' || field.fieldType=='reference'){
            [fieldName,fieldValue]= _self.parseRefrence(record,field);
        }
        if(field.fieldType=='DATETIME'){
            fieldValue=_self.parseDate(fieldValue);
        }
        return [fieldName,fieldValue]
    },
    parseRefrence:function(opp,field){
        let fieldName='';
        let fieldValue='';
        
        if(field.fieldAPIName.endsWith('Id')){
            fieldName=field.fieldAPIName.substring(0,field.fieldAPIName.lastIndexOf('Id'));
            if(opp[fieldName]){
                fieldValue=opp[fieldName].Name
            }
            
        }
        if(field.fieldAPIName.endsWith('__c')){
            let apiNameList=field.fieldAPIName.split('__c');
            let refrencenName=apiNameList[0]+'__r';
            let data=opp[refrencenName];
            if(data){
                if(data.Name){
                    fieldValue=data.Name;
                }   
            }     
            fieldName=field.fieldLabel
        }
        
        return [fieldName,fieldValue];
    },
    parseDate:function(dateValue){ 
        $A.localizationService.UTCToWallTime(new Date(dateValue), $A.get('$Locale.timezone'),function(offSetDateTime){
            dateValue=offSetDateTime
        });
        return $A.localizationService.formatDateTimeUTC(dateValue,$A.get('$Locale').dateFormat+' '+ $A.get('$Locale').timeFormat);
    }
})