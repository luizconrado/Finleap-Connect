({
	callApex : function(component,methodname,callback,params) {
        const action = component.get("c."+methodname);
        if(params){
            action.setParams(params);    
        }
        action.setCallback(this,callback);
        $A.enqueueAction(action);
    },
    getAllProducts:function(component){
        
         const _self=this;
        _self.callApex(component,"getAllRelatedProducts",function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                console.log('data',data);
                const parsedObjData=_self.parseProducts(data);
                
                component.set('v.orignalProductsList',parsedObjData);
                component.set('v.copyProductsList',parsedObjData);

                //getting  view object list
                data=_self.getViewList(data);
               
                component.set('v.productList',data);
                component.set('v.productViewList',data.slice(0,3));
                component.set('v.loadView',true);
                component.set('v.isLoading',false)
            }
        },{
            "recordId" : component.get("v.recordId")
        })
    },
    getViewList:function(files){
        const _self=this;
        let displayList=[];
        let symbol=$A.get("$Locale.currency")
        
        
        //creates view object list
        files.forEach(function(file,index){
            let fileObj={};
            fileObj.access=true;
            fileObj.Id=file.Id;
            fileObj.header=file.Product2.Name;
            fileObj.field1Label='Base Price';
            fileObj.field1Value=file.UnitPrice +' '+symbol;
            fileObj.field2Label='Base Limit';
            fileObj.field2Value=file.Base_Limit__c;
            fileObj.field3Label='Excess Usage Price';
            fileObj.field3Value=file.Excess_Price__c+' '+symbol;;
            displayList.push(fileObj);
        });
        return displayList;
    },
    parseProducts:function(productList){
       return productList.map(function(prod,index){
            return {
                index:prod.Id,
                productId:prod.Product2Id,
                baseprice:prod.UnitPrice,
                exsessprice:prod.Excess_Price__c,
                baselimit:prod.Base_Limit__c,
                productName:prod.Product2.Name
            }
        });
    },
    setNewMemberList:function(component){
        //setting empty 3 rows
        let newProductList=[];
        newProductList.push({
            index:'1',
            productId:'',
            baseprice:'',
            exsessprice:'',
            baselimit:'',
            productName:''
        })
        newProductList.push({
            index:'2',
            productName:'',
            productId:'',
            baseprice:'',
            exsessprice:'',
            baselimit:''
        })
        newProductList.push({
            index:'3',
            productId:'',
            baseprice:'',
            productName:'',
            exsessprice:'',
            baselimit:''
        })
        component.set('v.newProductList',newProductList);
    },
    resetIndex:function(list){
        list.forEach(function(item,index){
            list.index=index+1;
        });
        return list;
    },
    setProduct:function(newProductList,index,productId,productName){
        newProductList.forEach(function(list){
            if(list.index==index){
                list.productId=productId;
                list.productName=productName;    
            }
        });
        return newProductList;
    },
    showToast:function(type,title,message){
        const toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "type":type,
            "message":message
        });
        toastEvent.fire();
    },
    getError:function(error){
        if (error && error.fieldErrors && error.fieldErrors.PricebookEntryId[0] && error.fieldErrors.PricebookEntryId[0].message){
            return error.fieldErrors.PricebookEntryId[0].message;
        }
        if(error.message){
            return error.message;
        }
        return 'Please contact your system admin if problem continues.';
    }
})