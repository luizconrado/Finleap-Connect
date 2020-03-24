({
    configMap: {
        "string": {
            componentDef: "lightning:input",
            attributes: { }
        },      
    },
    getOpportunitys : function(component) {
        const _self=this;
        //component.set('v.loadTimeline',false);
        
        // retrieve server method
        var action = component.get("c.getHiddenOpportunitys");
        
        // set method paramaters
        action.setParams({
            "recordId" : component.get("v.recordId"),
            "ObjectName": component.get("v.sObjectName")
        });
        
        
        // set call back instructions
        action.setCallback(this, function(response){
            if (response.getState() === "SUCCESS") {
                const data = response.getReturnValue();
                const allOpp=data.OppList;
                const fieldDataList=data.fields;
			
                component.set('v.viewListData',_self.getViewList(fieldDataList,allOpp,3))
                //Full copy
                component.set('v.opportunityList',allOpp)
                component.set('v.opportunityFieldsList',fieldDataList)
            
            }
        });
        
        // queue action on the server
        $A.enqueueAction(action);
        
        
    },
    createView:function(component,oppDetails){
        let _self=this;
        const fields=component.get('v.opportunityFieldsList');
        let formFileds=[];
        fields.forEach(function(field){
            let element=JSON.parse(JSON.stringify(_self.configMap["string"]));
            let fieldName=field.fieldLabel
            let fieldValue=oppDetails[field.fieldAPIName]
            if(field.fieldType=='REFERENCE' || field.fieldType=='reference'){
                [fieldName,fieldValue]= _self.parseRefrence(oppDetails,field);
            }
            element.attributes.label = fieldName;
            element.attributes.value = fieldValue;
            element.attributes.readonly = true;
            element.attributes.name = fieldValue;
            formFileds.push([element.componentDef,element.attributes]);   
        });
        component.set('v.header',oppDetails[fields[0].fieldAPIName]);
        $A.createComponents(formFileds,function(components, status, errorMessage){
            if (status === "SUCCESS") {
               
                component.set('v.formView',components);
            }
        });        
    },
    getViewList:function(fields,allOpp,limit){
        let _self=this;
        let displayList=[];
        allOpp.forEach(function(opp,oppIndex){
            if(oppIndex<limit){
                let oppObj={};
                oppObj.Id=opp.Id;
                fields.forEach(function(field,index){
                    if(index<4){
                        let  fieldValue=opp[field.fieldAPIName]
                        let  fieldName=field.fieldLabel
                        if(field.fieldType=='REFERENCE' || field.fieldType=='reference'){
                            [fieldName,fieldValue]= _self.parseRefrence(opp,field);
                        }
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
    parseRefrence:function(opp,field){
        let fieldName='';
        let fieldValue='';
        if(field.fieldAPIName=='AccountId'){
            fieldName='Account';
            fieldValue=opp.Account.Name
        }
        if(field.fieldAPIName=='CampaignId'){
            fieldName='Campaign';
            fieldValue=opp.Campaign.Name
        }
        if(field.fieldAPIName=='ContractId'){
            fieldName='Contract';
            fieldValue=opp.Contract.Name
        }
        if(field.fieldAPIName=='OwnerId'){
            fieldName='Owner';
            fieldValue=opp.Owner.Name
        }
        if(field.fieldAPIName.includes('__c')){
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
    }
    
})