({
    doInit : function(component, event, helper) {
        const isMobile= $A.get("$Browser.formFactor")==='PHONE';
        component.set('v.isMobile',isMobile);
        helper.getFiles(component)
    },
    viewAllInvoked:function(component){
        const isMobile=component.get('v.isMobile');
        if(isMobile){
            const viewAllListData=component.get('v.attachmentList');
            const relatedList={
                componentDef:"c:RelatedListItem",
                attributes: {
                    tileclass:"slds-box",
                    recordList:viewAllListData,
                    viewLength:viewAllListData.length,
                    inlineDetals:true
                }
            }
            const compReference = {
                type: 'standard__component',
                attributes: {
                    componentName: 'c__Modal',
                },
                state: {
                    "c__header":'All Attachments ('+viewAllListData.length+')',
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
    actionInvoked:function(component,event,helper){
        helper.callApex(component,"getAllOptions",function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                component.set('v.fileTypes',data);
                component.set('v.isUpload',true);
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
        },{
            "recordId" : component.get("v.recordId"),
            "objectName": component.get("v.sObjectName")
        })
        
        
    },
    step1:function(component,event,helper){
        component.set('v.currentStep','1');
    },
    step2:function(component,event,helper){
        let type=component.get('v.selectedType');
        if(type==='Other File'){
            type=component.get('v.customType');
        }
        if(type==undefined ||type=='' && type=='Other File' || type =='--Select Type--'){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "message": "Select file type"
            });
            toastEvent.fire();
            return;
        }
        helper.getVersion(component,type);

    },
    nextStep:function(component,event,helper){
        
        const step=component.get('v.currentStep');
        if(step=='1'){
            let type=component.get('v.selectedType');
            if(type==='Other File'){
                type=component.get('v.customType');
            }
            if(type==undefined ||type=='' && type=='Other File' || type =='--Select Type--'){
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "message": "Select file type"
                });
                toastEvent.fire();
                return;
            }
            helper.getVersion(component,type);
            
        }
        else if(step =='2'){
            helper.closeUploadPopup(component)
        }
    },
    closeUpload:function(component,event,helper){
       helper.closeUploadPopup(component)
     },
    uploadFile:function(component,event,helper){
        const documentData=component.get('v.duplicateAttachmentList');
        const id=(documentData.length>0)?documentData[0].ContentDocumentId:'';
        const fileList = event.target.files;
        if(fileList.lenght==0){
            return;
        }
        const file = fileList[0];
        let fsize = file.size; 
        fsize = Math.round((fsize / 1024)); 
        if (fsize >= 5000) { 
            let toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title":'File to big',
                "type":"info",
                "message": "File too Big, please select a file less than 5mb"
            });
            toastEvent.fire();
            return ;
        } 
        
        
        const reader = new FileReader();
        let type=component.get('v.selectedType');
        if(type==='Other File'){
            type=component.get('v.customType');
        }
        if (file) {
            reader.readAsDataURL(file);
        }
        reader.addEventListener("load", function () {
            let fileContents = reader.result;
            let base64Mark = 'base64,';
            let dataStart = fileContents.indexOf(base64Mark) + base64Mark.length;
            fileContents = fileContents.substring(dataStart);
            component.set('v.fileloader',true);
            helper.callApex(component,'uploadContentVersion',function(response){
                let status = response.getState();
                let data = response.getReturnValue();
                if(status==='SUCCESS'){
                    let toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title":'File Uploaded',
                        "type":"success",
                        "message": "File Upload Success"
                    });
                    toastEvent.fire();
                    helper.getFiles(component);

                } 
                else if(status==='ERROR'){
                    let toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title":'Upload Failed',
                        "type":"error",
                        "message": "Cannot Upload New Version Please Try Again."
                    });
                    toastEvent.fire();
                }
                
                helper.closeUploadPopup(component);

            },{
                base64:fileContents,
                fileType:type,
                documentId:id,
                filename:file.name,
                recordId:component.get('v.recordId')
            })
            
        }, false);
    }
})