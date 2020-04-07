({
    configMap: {
        "string": {
            componentDef: "c:FormElement",
            attributes: { }
        },      
    },
    getOpportunitys : function(component) {
        const _self=this;
        component.set('v.loadTimeline',false);
        let action = component.get("c.getHiddenOpportunitys");
        action.setParams({
            "recordId" : component.get("v.recordId"),
            "objectName": component.get("v.sObjectName")
        });
        action.setCallback(this, function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                data=JSON.parse(data);
                const fieldDataList=data.Fields;
                const globalOpp=data.Global;
                const privateOpp=data.Private;
                let allOpp=[];
                //Adding access to records
                allOpp.push(...globalOpp.map(function(o){
                    o.access=true;
                    return o;
                }))
                allOpp.push(...privateOpp.map(function(o){
                    o.access=false;
                    if(o.Name) o.Name=o.Limited_Access_Name__c;
                    return o;
                }));
              	
                component.set('v.viewListData',_self.getViewList(fieldDataList,allOpp,3))
                //Orignal Data 
                component.set('v.opportunityList',allOpp)
                component.set('v.opportunityFieldsList',fieldDataList)
                
            }
            else if (status === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + 
                                    errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
    createView:function(component,oppDetails){
        let _self=this;
        const fields=component.get('v.opportunityFieldsList');
        let formFileds=[];
        let i=0,j=fields.length;
        while(i<j){
            formFileds.push(_self.createElement(oppDetails,fields[i],fields[i+1])); 
            i=i+2;
        }
       
        let [fieldName,fieldValue]=_self.parseRecord(oppDetails,fields[0]);
        component.set('v.header',fieldValue);
        _self.createComponent(component,formFileds)
    },
    createElement:function(record,field,field2){
        const element=JSON.parse(JSON.stringify(this.configMap["string"]));
        let [fieldName,fieldValue]=this.parseRecord(record,field);
        
        element.attributes.label1 = fieldName;
        element.attributes.value1 = fieldValue;
        if(field2){
            let [fieldName2,fieldValue2]=this.parseRecord(record,field2);   
            element.attributes.label2 = fieldName2;
            element.attributes.value2 = fieldValue2;
        }
         
        return [element.componentDef,element.attributes];
    },
    createComponent:function(component,form){
         $A.createComponents(form,function(components, status, errorMessage){
            if (status === "SUCCESS") {
            
                component.set('v.viewRecordData',components);
            }
        });       
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
    },
       

})