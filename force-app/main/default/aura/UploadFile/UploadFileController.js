({
    doInit:function(component,event,helper){
        let fileTypes=[];
        helper.callApex(component,'getSupportedStypes',function(response){
            let status = response.getState();
            let data = response.getReturnValue();
            if(status==='SUCCESS'){
                fileTypes.push(...data);
            }
            fileTypes.push('Other File');
            component.set('v.fileTypes',fileTypes);
        },{
            recordId:component.get('v.recordId'),
            objectName:component.get('v.sObjectName')
        })
    },
	cancel:function(component, event, helper) {
        component.set('v.isOpen',false)
    },
    step1:function(component, event, helper) {
       helper.changeSetp(component,'1');
    },
    step2:function(component, event, helper) {
        helper.changeSetp(component,'2');
    },
    checkDuplicate:function(component,event,helper){
        let currentStep=component.get('v.currentStep');
        let id=component.get('v.recordId');
        if(currentStep==='1'){
            let type=component.get('v.selectedType');
            if(type==='Other File'){
                type=component.get('v.customType');
            }
            helper.toggleLoader(component);
            
            helper.callApex(component,'checkDuplicateFile',function (response){
                let status = response.getState();
                let data = response.getReturnValue();
                console.log('status',status);    
                console.log('data',data);
                if(status==='SUCCESS'){
                    component.set('v.documentData',data);
                    component.set('v.currentStep','2');
                }
                helper.toggleLoader(component);
            },{
                recordId:id,
                fileType:type
            });
            
        }
        else{
            component.set('v.isOpen',false)
        }
    },
    uploadFile:function(component,event,helper){
        const documentData=component.get('v.documentData');
        let id=(documentData.length>0)?documentData[0].ContentDocumentId:'';
        const fileList = event.target.files;
        const file = fileList[0];
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
            helper.toggleLoader(component);
            helper.callApex(component,'uploadContentVersion',function(response){
                let status = response.getState();
                let data = response.getReturnValue();
                if(status==='SUCCESS'){
                    helper.showToast('success','File Uploaded',"File Upload Success");
                } 
                else if(status==='ERROR'){
                    helper.showToast('error','Upload Failed',"Cannot Upload New Version Please Try Again.");
                }
                 helper.closeWindow();
            },{
                base64:fileContents,
                fileType:type,
                documentId:id,
                filename:file.name,
                recordId:component.get('v.recordId')
            })
        }, false);
    },
})