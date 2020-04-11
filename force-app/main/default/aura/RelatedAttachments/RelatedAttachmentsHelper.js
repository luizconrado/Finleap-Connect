({
    getFiles : function(component) {
        component.set('v.isLoading',true);
        const _self=this;
        var action = component.get("c.getAllAttachments");
        action.setParams({
            "recordId" : component.get("v.recordId"),
            "objectName": component.get("v.sObjectName")
        });
        
        action.setCallback(this, function(response){
            let state=response.getState();
            if ( state=== "SUCCESS") {
                const data = response.getReturnValue();
                console.log('data',data)
                
                component.set('v.attachmentList',_self.setFileIconAndSize(data));
                
            }
            component.set('v.isLoading',false);

        });
        
        $A.enqueueAction(action);
    },
    setFileIconAndSize:function(files){
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
            
            if(file.ContentSize){
                file.ContentSize=Math.round(file.ContentSize/1024);
            }
            return file;

        });
    }
})