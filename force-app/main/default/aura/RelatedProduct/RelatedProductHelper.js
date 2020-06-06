({
    //utill
    BUCKET_LIMIT:5,
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
        if(error && error.message){
            return error.message;
        }
        if(error && error.pageErrors && error.pageErrors[0] && error.pageErrors[0].message){
            return error.pageErrors[0].message
        }
        if(error && error.fieldErrors && error.fieldErrors.Product__c[0] && error.fieldErrors.Product__c[0].message){
            return  error.fieldErrors.Product__c[0].message;
        }
        return 'Please contact your system admin if problem continues.';
    },
   	callApex : function(component,methodname,callback,params) {
        const action = component.get("c."+methodname);
        if(params){
            action.setParams(params);    
        }
        action.setCallback(this,callback);
        $A.enqueueAction(action);
    },
    //server call
    getAllRelatedProducts:function(component){
        const _self=this;
        
        _self.callApex(component,"getRelatedProducts",function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                let exsistingProds=_self.prepareLinkedProductJson(data);
                
                
                
                //getting  view object list
                data=_self.getViewList(data);
                component.set('v.linkedProductsOrignal',JSON.stringify(exsistingProds));
                component.set('v.linkedProductsList',exsistingProds);
                component.set('v.relatedProductList',data);
                component.set('v.relatedProductViewList',data.slice(0,3));
                component.set('v.loadView',true);
                component.set('v.isLoading',false)
            }
        },{
            "recordId" : component.get("v.recordId")
        })
    },
    searchProducts:function(component,productName){
        const oppRecord=component.get('v.oppRecord');
        const isShowAll=component.get('v.isShowAllProducts');
        const _self=this;
        _self.callApex(component,"fetchProducts",function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                let selectedProd=component.get('v.allSelectedProductsList');
                if(!isShowAll){
                    let linkedProductsList=component.get('v.linkedProductsList')
                    data=_self.removeSelectedProductFromSearchList(data,linkedProductsList);
                }
                component.set('v.selectedProductsIdList',_self.getSelectedProductIds(selectedProd));
                component.set('v.allSystemProductsList',_self.mapSelectedProducts(data,selectedProd));
                component.set('v.isLoading',false)
                
            }
        },{
            "productName" : productName,
            "targetCountries":oppRecord.Target_Countries__c,
            "showAll":isShowAll
        })
    },
    //json process
    prepareLinkedProductJson:function(prodList){
        let objList=[];
        let _self=this;
        prodList.forEach(function(prod,index){
            let obj={};
            obj.isExpanded=true;
            obj.prodId=prod.Product2Id;
            obj.index=index;
            obj.id=prod.Id;
            obj.oppid=prod.OpportunityId;
            obj.name=prod.Product2.Name;
            obj.prodFamily=prod.Product2.Family;
            obj.baseprice=prod.UnitPrice;
            obj.baselimit=prod.Base_Limit__c;
            obj.baseSetup=prod.One_Time_Setup_Price__c;
            obj.children=[];
            const limit=_self.BUCKET_LIMIT+1;
            for(let i=1;i<limit;i++){
                if(prod['Excess_Limit_Bucket_'+i+'__c'] && prod['Excess_Price_Bucket_'+i+'__c']){
                    let childObj={};
                    childObj.bucket=i;
                    childObj.prodId=prod.Product2Id;
                    childObj.index=index+'_'+i;
                    childObj.id=prod.Id;
                    childObj.name='Stuffe '+i;
                    childObj.excessprice=prod['Excess_Price_Bucket_'+i+'__c'];
                    childObj.excesslimit=prod['Excess_Limit_Bucket_'+i+'__c'];
                    obj.children.push(childObj);
                }
            }
            obj.removedBucket=[];
            objList.push(obj);
            
        });
        return objList;
    },
    prepareNewProductJson:function(prodList){
        let objList=[];
        let _self=this;
        prodList.forEach(function(prod,index){
            let obj={};
            obj.isExpanded=false;
            obj.prodId=prod.Id;
            obj.index=index;
            obj.name=prod.Name;
            obj.prodFamily=prod.Family;
            obj.baseSetup=0;
            obj.baseprice=0;
            obj.baselimit=0;
            obj.children=[];
            objList.push(obj);
        });
        return objList;
    },
    mapSelectedProducts:function(sysProdList,selectedProdList){
        selectedProdList.forEach(function(prod){
            let temp=sysProdList.some(function(sysProd){
                return sysProd.Id==prod.Id;
            });
            if(!temp){
                sysProdList.push(prod);
            }
        });
        return sysProdList;
    },
    getSelectedProductIds:function(selectedProductList){
        let ids= selectedProductList.map(function(prod){
            return prod.Id;
        })  
        return ids;
    },
    processProductData:function(prodList,type,index,component){
        if(type==='edit_remove_parent'){
            let linkedDeleteProductsList=component.get('v.linkedDeleteProductsList')
            prodList=prodList.filter(function(prod){
                if(prod.index!=index){
                    return prod;
                }
                else{
                    linkedDeleteProductsList.push({Id:prod.id});
                }
            });
            component.set('v.linkedDeleteProductsList',linkedDeleteProductsList);
        }
        else{
            prodList.forEach(function(prod){
                if(prod.index==index){
                    if(type==='remove_new_child' || type==='edit_remove_child'){
                        let pitem=prod.children.pop();
                        if(prod.children.length==0){
                            prod.isExpanded=false;
                        }
                        if(type==='edit_remove_child')
                            prod.removedBucket.push(pitem);
                    }
                    else  if(type==='edit_expand_colapse' || type==='new_expand_colapse'){
                        prod.isExpanded=!prod.isExpanded;
                    }
                    else if(type==='add_new_child'){
                            prod.isExpanded=true;
                            let childObj={};
                            let i=prod.children.length+1;
                            childObj.bucket=i;
                            childObj.prodId=prod.prodId;
                            childObj.index=prod.index+'_'+i;
                            childObj.name='Stuffe '+i;
                            childObj.excessprice=0;
                            childObj.excesslimit=0;
                            prod.children.push(childObj)        
                    }
                    else if(type==='edit_add_child'){
                        prod.isExpanded=true;
                        let childObj={};
                        let i=prod.children.length+1;
                        childObj.bucket=i;
                        childObj.prodId=prod.prodId;
                        childObj.index=prod.index+'_'+i;
                        childObj.name='Stuffe '+i;
                        childObj.excessprice=0;
                        childObj.id=prod.id;
                        childObj.excesslimit=0;
                        prod.children.push(childObj)
                   }
                }
            });
        }
        
        return prodList;
    },
    processOpportunityLineItemrecord:function(list,oppId,opration){
        let helper=this;
        let error=false; 
        let oppLineItemRecords=list.map(function(prod){
            let recordObj={};
            recordObj.Product2Id=prod.prodId;
            recordObj.OpportunityId=oppId;
            recordObj.Name=prod.name;
            recordObj.Id=prod.id;
            
            if(!(prod.baseprice && prod.baselimit)){
                error=true;
                helper.showToast('warrning','Missing Values','Check Price and Range for '+prod.name);
                return;
            }
             if(!(prod.baseSetup)){
                error=true;
                helper.showToast('warrning','Missing Values','Check Setup Price for '+prod.name);
                return;
            }
            recordObj.UnitPrice=prod.baseprice;
            recordObj.Base_Limit__c=prod.baselimit;
            recordObj.One_Time_Setup_Price__c=prod.baseSetup;
            recordObj.Quantity=1;
            prod.children.forEach(function(bucket){
                if(!(bucket.excesslimit && bucket.excessprice)){
                    error=true;
                    helper.showToast('warrning','Missing Values','Check Price and Range for '+bucket.name);
                    return;
                }
                
                else{
                    recordObj['Excess_Limit_Bucket_'+bucket.bucket+'__c']=bucket.excesslimit;
                    recordObj['Excess_Price_Bucket_'+bucket.bucket+'__c']=bucket.excessprice
                }
                
            });
            if(opration=='edit'){
                prod.removedBucket.forEach(function(child){
                    recordObj['Excess_Limit_Bucket_'+child.bucket+'__c']=null;
                    recordObj['Excess_Price_Bucket_'+child.bucket+'__c']=null;
                });
            }
            return recordObj;
        });
        if(error) return false;
        return oppLineItemRecords;
    },
    //utill
    navigate:function(component,step){
        if(step=='1'){ 
            component.set('v.currentStep','1');
            component.set('v.isLoading',true)
            let allSelectedProductsList=component.get('v.allSelectedProductsList');
            
            
            let ids=this.getSelectedProductIds(allSelectedProductsList);
            component.set('v.selectedProductsIdList',ids);
            component.set('v.isLoading',false);
        }  
        if(step=='2'){
            let allSelectedProductsList=component.get('v.allSelectedProductsList');
            let newProductsList=component.get('v.newProductsList');
            
            let newJson=this.prepareNewProductJson(allSelectedProductsList);
            
            newJson.forEach(function(newProd){
                let temp=newProductsList.filter(function(selectedProd){
                    return selectedProd.prodId==newProd.prodId
                });
                if(temp.length>0){
                    newProd.baseprice=temp[0].baseprice;
                    newProd.baseSetup=temp[0].baseSetup;
                    newProd.baselimit=temp[0].baselimit;
                    newProd.children=temp[0].children;
                    if(newProd.children.length>0){
                        newProd.isExpanded=true;
                    }
                }
            });
            
            component.set('v.newProductsList',newJson)
            component.set('v.currentStep','2');

        }
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
            fileObj.field3Label='Product Code';
            fileObj.field3Value=file.ProductCode;
            displayList.push(fileObj);
        });
        return displayList;
    },
    removeSelectedProductFromSearchList:function(prods,selectedProds){
        let selectedIds=selectedProds.map(function(sProd){
            return sProd.prodId;
        })
        return prods.filter(function(prod){
           return  !selectedIds.includes(prod.Id)
        });
    },
    closeAddProduct:function(component){
        component.set('v.isAddProduct',false)
        component.set('v.currentStep',"1")
        component.set('v.allSelectedProductsList',[]);
        component.set('v.selectedProductsIdList',[]);
        component.set('v.newProductsList',[]);
        component.set('v.currentSubStep',0)
    },
    closeUpdatePorduct:function(component){
        component.set('v.isEditProduct',false);
        let data=component.get('v.linkedProductsOrignal');
        component.set('v.linkedProductsList',JSON.parse(data));
        component.set('v.linkedDeleteProductsList',[])
        component.set('v.currentSubStep',0)
    },
    
    
})