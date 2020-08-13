({
    checkInprogress:function(component,event,helper){
        const loadView=component.get('v.loadView');
        const opportunityRecord=component.get('v.OpportunityRecord');
        const filterRecordType=component.get('v.filterRecordType');

        if(loadView===false && opportunityRecord.IsClosed===false){
            helper.callApex(component,"getAllInProgressOpportunties",function(response){
                let status=response.getState();
                if (status === "SUCCESS"){
                    let data = response.getReturnValue();
                    data=JSON.parse(data);
                    const fieldDataList=data.Fields;
                    const globalOpp=data.Global;
                    const privateOpp=data.Private;
                    const filterRecordTypeIds=data.FilterIds;
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
                    if(filterRecordType){
                        let sameRecordTypeCount=allOpp.reduce(function(total, cur) {
                            if(cur.RecordTypeId==opportunityRecord.RecordTypeId){
                                total=total+1;    
                            }
                            return total;
                        }, 0);
                        if(sameRecordTypeCount==allOpp.length){
                            return;
                        }
                    }
                    if(allOpp.length>0){
                        
                        let investmentExsists = allOpp.find(function (opp) {
                            return filterRecordTypeIds.includes(opp.RecordTypeId);
                        });
                        if(investmentExsists){
                            component.set('v.filterRecordTypeExsists',true);
                        }
                        
                        component.set('v.viewListData',helper.getViewList(fieldDataList,allOpp,3))
                        component.set('v.viewAllListData',helper.getViewList(fieldDataList,allOpp,allOpp.length))
                        
                        //Orignal Data 
                        component.set('v.opportunityList',allOpp)
                        component.set('v.opportunityFieldsList',fieldDataList)
                        component.set('v.loadView',true);
                    }
                }
                else if (status === "ERROR") {
                    const toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Global Opportunities error!",
                        "type":'error',
                        "message": "Please contact your system admin if problem continues."
                    });
                    toastEvent.fire();
                }
            },{
                "recordTypeId" : opportunityRecord.RecordTypeId,
                "accountId": opportunityRecord.AccountId,
                "recordId":opportunityRecord.Id
            })
        }
        
    },
	doInit : function(component, event, helper) {
        const isMobile= $A.get("$Browser.formFactor")==='PHONE';
        component.set('v.isMobile',isMobile);
        
    },
    viewAllInvoked:function(component, event, helper){
        const isMobile=component.get('v.isMobile');
        if(false/*disalbed due to https://help.salesforce.com/articleView?id=000354334&type=1&mode=1*/){
            const viewAllListData=component.get('v.viewAllListData');
            const relatedList={
                componentDef:"c:RelatedListItem",
                attributes: {
                    tileclass:"slds-box",
                    recordList:viewAllListData,
                    viewLength:viewAllListData.length
                }
            }
            const compReference = {
                type: 'standard__component',
                attributes: {
                    componentName: 'c__Modal',
                },
                state: {
                    "c__header":'All Opportunities ('+viewAllListData.length+')',
                    "c__def":JSON.stringify(relatedList.componentDef),
                    "c__att":JSON.stringify(relatedList.attributes),
                    "c__recordId":component.get('v.recordId')
                }
            };
            const navService = component.find("navService");
            navService.navigate(compReference);
        }
        else{
            component.set('v.isViewAll',true);
        }
    },
    openRecordInvoked:function(component, event, helper){
        const data=event.getParam("data");
        const id=data.recordId;
        const opportunityList=component.get('v.opportunityList');
        const fields=component.get('v.opportunityFieldsList')
        let record=opportunityList.filter(o=>o.Id==id)[0];
        
        if(!record.access){
            let [fieldName,fieldValue]=helper.parseRecord(record,fields[0]);
            const isMobile=component.get('v.isMobile');
            if(isMobile){
                const viewForm={
                    componentDef:"c:FormLayout",
                    attributes: {
                        header:"Opportunity Details",
                        fieldsList:fields,
                        record:record
                    }
                }
                const compReference = {
                    type: 'standard__component',
                    attributes: {
                        componentName: 'c__Modal',
                    },
                    state: {
                        "c__header":fieldValue,
                        "c__def":JSON.stringify(viewForm.componentDef),
                        "c__att":JSON.stringify(viewForm.attributes),
                        "c__recordId":component.get('v.recordId')
                    }
                };
                const navService = component.find("navService");
                navService.navigate(compReference);
            }
            else{
                component.set('v.viewRecord',record);
                component.set('v.viewHeader',fieldValue);
                component.set('v.isViewRecord',true); 
                component.set('v.isViewAll',false);
            }
        }
        else{
            const navService = component.find("navService");
            const pageReference={    
                "type": "standard__recordPage",
                "attributes": {
                    "recordId": record.Id,
                    "objectApiName": "Opportunity",
                    "actionName": "view"
                }
            };
            navService.navigate(pageReference);
        }
    },
  
})