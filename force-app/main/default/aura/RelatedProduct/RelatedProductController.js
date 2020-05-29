({
	doInit : function(component, event, helper) {
        
        const isMobile= $A.get("$Browser.formFactor")==='PHONE';
        component.set('v.isMobile',isMobile);
        helper.setNewMemberList(component);
        helper.getAllProducts(component);
	},
    viewAllInvoked:function(component){
        const isMobile=component.get('v.isMobile');
        if(isMobile){
            //if in mobile context opening modal as refrence
           const viewAllListData=component.get('v.productList');
            const relatedList={
                componentDef:"c:RelatedListItem",
                attributes: {
                    tileclass:"slds-box",
                    recordList:viewAllListData,
                    viewLength:viewAllListData.length,
                    inlineDetals:true,
                    sobjectName:"OpportunityLineItem"
                }
            }
            const compReference = {
                type: 'standard__component',
                attributes: {
                    componentName: 'c__Modal',
                },
                state: {
                    "c__header":'All Products ('+viewAllListData.length+')',
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
        let action=event.getParam('data');
        action=action.option;
        if(action=='add_product'){
            component.set('v.isAddProduct',true)
            
        }
        else if(action=='edit_product'){
            component.set('v.isEditProduct',true)
        }
        
        
    },
    //Add popup helper
    closePopup:function(component,event,helper){
        //close popup
        let action=event.getSource().get('v.value')
    	//reset variables
        if(action=='Add_Product'){
            component.set('v.isAddProduct',false)
			helper.setNewMemberList(component);
        }
        else if(action=='Edit_Product'){
            component.set('v.orignalProductsList',component.get('v.copyProductsList'));
            component.set('v.deleteProductsList',[]);
            component.set('v.isEditProduct',false);
        }
    },
    addNewRow:function(component,event,helper){
        //add blank row to list
        let newProductList=component.get('v.newProductList');
        newProductList=helper.resetIndex(newProductList);
        newProductList.push({
            index:newProductList.length+1,
            productId:'',
            productName:'',
            baseprice:'',
            exsessprice:'',
            baselimit:''
        })
        component.set('v.newProductList',newProductList);
        
    },
    onProductSelect:function(component,event,helper){
        //set selected user to new row
        let dataset =event.currentTarget.dataset;
        const index=dataset.index;
        const productId=dataset.productid;
        const prodName=dataset.prodname;
        let newProductList=component.get('v.newProductList');
        newProductList=helper.setProduct(newProductList,index,productId,prodName);
        component.set('v.newProductList',newProductList);
        component.set('v.systemProductList',[]);
        component.set('v.currentProductIndex',-1)
        
    },
    removeNewRow:function(component,event,helper){
        //remove blank row from list
        let index=event.getSource().get('v.value');
        let newProductList=component.get('v.newProductList');
        let filteredProductList=newProductList.filter(function(item){
            if(item.index!=index){
                return item;
            }
        });
        filteredProductList=helper.resetIndex(filteredProductList);
        component.set('v.newProductList',filteredProductList);
    },
    onProductremove:function(component,event,helper){
        
        let dataset =event.currentTarget.dataset;
        const index=dataset.index;
       
        let newProductList=component.get('v.newProductList');
        newProductList=helper.setProduct(newProductList,index,'','');
        component.set('v.newProductList',newProductList);
        component.set('v.systemProductList',[]);
        component.set('v.currentProductIndex',-1);
    },
    //remove popup helper
    removeRow:function(component,event,helper){
        //remove blank row from list
        let index=event.getSource().get('v.value');
        let copyProductsList=component.get('v.copyProductsList');
        let deleteProductsList=component.get('v.deleteProductsList')
        let filteredProductList=copyProductsList.filter(function(item){
            if(item.index!=index){
                return item;
            }
            if(item.index==index){
                deleteProductsList.push(item);
            }
        });
        filteredProductList=helper.resetIndex(filteredProductList);
        component.set('v.copyProductsList',filteredProductList);
        component.set('v.deleteProductsList',deleteProductsList);

    },
    //service call
    onSearchProduct:function(component,event,helper){
        let value=event.getSource().get('v.value')
        let index=event.getSource().get("v.name");
        if(value.trim().length>2){
            let oppData=component.get('v.oppRecord');
            helper.callApex(component,'searchProduct',function(response){
                let status=response.getState();
                if (status === "SUCCESS"){
                    let data = response.getReturnValue();
                    console.log('data',data)
                    component.set('v.systemProductList',data)
                    component.set('v.currentProductIndex',index)
                }
            },{
                productName:value.trim(),
                targetCountrie:oppData.Target_Countries__c
            })
            
        }
        else{
            component.set('v.systemProductList',[])
            component.set('v.currentProductIndex',-1)
        }
    },
    onSaveProduct:function(component,event,helper){
        const productList=component.get('v.newProductList');
        const oppId=component.get('v.recordId');
        let newProductList=[];
        let stop=false;
        productList.forEach(function(prod){
            if(!prod.productId && !prod.exsessprice && !prod.baseprice && !prod.baselimit){
                
            }
            else if(!prod.exsessprice || !prod.baseprice || !prod.baselimit){
                if(prod.productName){
                    helper.showToast('warning','Value Missing','Please Check price and limit values');
                    stop=true;
                    return;
                }
                
            }
            else if(prod.productId && prod.exsessprice && prod.baseprice && prod.baselimit){
                newProductList.push({
                    Excess_Price__c:prod.exsessprice,
                    Base_Limit__c:prod.baseprice,
                    Product2Id:prod.productId,
                    OpportunityId:oppId,
                    Quantity:1,
                    UnitPrice:prod.baseprice,
                    Name:prod.productName
                });
            }
        });
        if(stop)return;
        component.set('v.isLoading',true)
        helper.callApex(component,'attachProductsToOpportuntiy',function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                helper.showToast('success',"Insert Successful!","Products added successfully.");
                helper.setNewMemberList(component);
                helper.getAllProducts(component);
            }
            else{
                let errors = response.getError();
                let message="";
                if (errors && errors[0]) {
                    message = helper.getError(errors[0]);
                }
                
                helper.showToast('error',"Insert Error!",message);
                component.set('v.isLoading',false)
            }
          
            component.set('v.isAddProduct',false)
        },{
            opportunityLineItemJSON:JSON.stringify(newProductList)
        });
       	
    },
    onUpdateProduct:function(component,event,helper){
        const copyProductsList=component.get('v.copyProductsList');
        const deleteProductsList=component.get('v.deleteProductsList');
        const oppId=component.get('v.recordId');
        const updateProductList=copyProductsList.map(function(prod){
            return {
                Excess_Price__c:prod.exsessprice,
                Base_Limit__c:prod.baselimit,
                UnitPrice:prod.baseprice,
                Id:prod.index
            }
        });
        const deleteProdList=deleteProductsList.map(function(prod){
            return {
                Id:prod.index
            }
        });
     
        component.set('v.isLoading',true)
        helper.callApex(component,'updateProductsAttached',function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                helper.showToast('success',"Update Successful!","Products Updated/Deleted successfully.");
                helper.setNewMemberList(component);
                helper.getAllProducts(component);
            }
            else{
                let errors = response.getError();
                let message="";
                if (errors && errors[0]) {
                    message = helper.getError(errors[0]);
                }
                
                helper.showToast('error',"Update Error!",message);
                component.set('v.isLoading',false)
            }
            
            component.set('v.isEditProduct',false)            
        },{
            updateList:JSON.stringify(updateProductList),
            deleteList:JSON.stringify(deleteProdList)
        });
       	
    }
})