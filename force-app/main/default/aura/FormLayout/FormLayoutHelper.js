({
    configMap: {
        "string": {
            componentDef: "c:FormElement",
            attributes: { }
        },      
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
                component.set('v.layout',components);
                component.set('v.load',true);
            }
        });       
    },
})