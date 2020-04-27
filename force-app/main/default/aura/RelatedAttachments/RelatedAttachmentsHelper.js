({
	callApex : function(component,methodname,callback,params) {
        const action = component.get("c."+methodname);
        if(params){
            action.setParams(params);    
        }
        action.setCallback(this,callback);
        $A.enqueueAction(action);
    },
    getFiles:function(component){
        const _self=this;
        _self.callApex(component,"getAllAttachments",function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                data=_self.setFileIcon(data);
                data=_self.parseSize(data);
                data=_self.getViewList(data);
                component.set('v.attachmentList',data);
                component.set('v.attachmentViewList',data.slice(0,3));
                
                component.set('v.fileloader',false);
                component.set('v.loadView',true);
            }
            else if (status === "ERROR") {
                const toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Attachments Error!",
                    "type":'error',
                    "message": "Please contact your system admin if problem continues."
                });
                toastEvent.fire();
            }
        },{
            "recordId" : component.get("v.recordId"),
            "objectName": component.get("v.SObjectName")
        })
    },
    getVersion:function(component,type){
        let _self=this;
        component.set('v.fileloader',true);
        _self.callApex(component,'checkDuplicateFile',function (response){
            let status = response.getState();
            let data = response.getReturnValue();
            if(status==='SUCCESS'){
                data.forEach(function(file){
                    file.ContentModifiedDate=_self.parseDate(file.ContentModifiedDate);
                });
                data=_self.parseSize(data);
                component.set('v.duplicateAttachmentList',data);
                component.set('v.currentStep','2');
                component.set('v.fileloader',false);
            }
        },{
            recordId:component.get('v.recordId'),
            fileType:type
        });  
    },
    getViewList:function(files){
        const _self=this;
        let displayList=[];
        files.forEach(function(file,index){
            let fileObj={};
            fileObj.access=true;
            fileObj.Id=file.Id;
            fileObj.header=file.Title;
            fileObj.field1Label='Upload Date';
            fileObj.field1Value=_self.parseDate(file.ContentModifiedDate)
            fileObj.field2Label='File Size';
            fileObj.field2Value=file.ContentSize;
            fileObj.field3Label='File Extenstion';
            fileObj.field3Value=file.FileExtension;
            fileObj.icon=file.icon;
            fileObj.FileType=file.FileType;
            
            displayList.push(fileObj);
        });
        return displayList;
    },
    setFileIcon:function(files){
        return files.map(function(file){
            if(!file.FileType || file.FileType.toUpperCase().includes('UNKNOWN')){
                file.icon="doctype:attachment"
            }
            else if(file.FileType.toUpperCase().includes('WORD')){
                file.icon="doctype:word"
            }
                else if(file.FileType.toUpperCase().includes('CSV')){
                    file.icon="doctype:csv"
                }
                    else if(file.FileType.toUpperCase().includes('PDF')){
                        file.icon="doctype:pdf"
                    }
                        else if(file.FileType.toUpperCase().includes('POWER_POINT')){
                            file.icon="doctype:ppt"
                        }
                            else if(file.FileType.toUpperCase().includes('EXCEL')){
                                file.icon="doctype:excel"
                            }
                                else if(file.FileType.toUpperCase().includes('PNG') || file.FileType.toUpperCase().includes('JPEG') || file.FileType.toUpperCase().includes('JPG')){
                                    file.icon="doctype:image"
                                }
            
            
            return file;
            
        });
    },
    parseSize:function(files){
        return files.map(function(file){
            if(file.ContentSize){
                file.ContentSize=Math.round(file.ContentSize/1024);
                if(file.ContentSize>1024){
                    file.ContentSize=Math.round(file.ContentSize/1024);
                    file.ContentSize=file.ContentSize+'MB';
                }
                else{
                    file.ContentSize=file.ContentSize+'KB';
                }
                
            }
            return file;
        });
    },
    parseDate:function(dateValue){ 
        $A.localizationService.UTCToWallTime(new Date(dateValue), $A.get('$Locale.timezone'),function(offSetDateTime){
            dateValue=offSetDateTime
        });
        return $A.localizationService.formatDateTimeUTC(dateValue,$A.get('$Locale').dateFormat);
    },
    closeUploadPopup:function(component){
        component.set('v.currentStep','1');
        component.set('v.customType');
        component.set('v.selectedType');
        component.set('v.fileloader',false);

        component.set('v.isUpload',false);
    }
})