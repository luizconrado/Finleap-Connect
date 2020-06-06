({
	doInit : function(component, event, helper) {
        component.set('v.systemProductColums',[
            {label: 'Product Name', fieldName: 'Name', type: 'text'},
            {label: 'Product Code', fieldName: 'ProductCode', type: 'text'},
            {label: 'Product Family', fieldName: 'Family', type: 'text'},
            {label: 'Available In Countries', fieldName: 'Countries_Covered__c', type: 'text'}
        ]);
        component.set('v.bucketLimit',helper.BUCKET_LIMIT);
        const isMobile= $A.get("$Browser.formFactor")==='PHONE';
        component.set('v.isMobile',isMobile);
        helper.getAllRelatedProducts(component);
	},
    //Popup Methods
    viewAllInvoked:function(component){
        const isMobile=component.get('v.isMobile');
        if(isMobile){
            //if in mobile context opening modal as refrence
           const viewAllListData=component.get('v.relatedProductList');
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
            component.set('v.isLoading',true)
            component.set('v.isAddProduct',true)
            helper.searchProducts(component,'');
        }
        else if(action=='edit_product'){
            component.set('v.isEditProduct',true)
        }
        
        
    },
    closePopup:function(component,event,helper){
        //close popup
        let action=event.getSource().get('v.value')
        //reset variables
        if(action=='Add_Product'){
            helper.closeAddProduct(component)
            
        }
        else if(action=='Edit_Product'){
            helper.closeUpdatePorduct(component)
        }
    },
    //Add Product  Methods
    onShowAllToggle:function(component,event,helper){
        let searchText=component.get('v.searchText');
         component.set('v.isLoading',true)
		helper.searchProducts(component,searchText)
        
    },
    step1:function(component,event,helper){
       helper.navigate(component,'1');
    },
    step2:function(component,event,helper){
        helper.navigate(component,'2');
    },
    changeSubStep:function(component,event,helper){
        let status=event.getSource().get("v.value");
        let currentSubStep=component.get("v.currentSubStep");
        let newProductsList=component.get("v.newProductsList")
        let linkedProductsList=component.get("v.linkedProductsList");
        if(status=='Add_Product_back'){
            if(currentSubStep!=0){
                currentSubStep = currentSubStep-1;
            }
        }
        else if(status=='Add_Product_next'){
            if(currentSubStep!=newProductsList.length-1){
                currentSubStep = currentSubStep+1;
            }
        }
        else if(status=='Edit_Product_back'){
            if(currentSubStep!=0){
                currentSubStep = currentSubStep-1;
            }
        }
        else if(status=='Edit_Product_next'){
            if(currentSubStep!=linkedProductsList.length-1){
                currentSubStep = currentSubStep+1;
            }      
        }
        component.set("v.currentSubStep",currentSubStep);
    
    },
    onSearchProduct:function(component,event,helper){
        let value=event.getSource().get('v.value')
        if(value.trim().length>2){
            component.set('v.isLoading',true)
            helper.closeAddProduct(component,value);
        }
        if(value.trim()==0){
            component.set('v.isLoading',true)
            helper.searchProducts(component,'');
        }
    },
    onProductSeletion:function(component,event,helper){
        let selectedRows = event.getParam('selectedRows');
        component.set('v.allSelectedProductsList',selectedRows);
        component.set('v.selectedProductsIdList',helper.getSelectedProductIds(selectedRows));
    },
    onBucketAction:function(component,event,helper){
        let index=event.getSource().get('v.value');
        let type=event.getSource().get('v.name');
        if(type==='add_new_child' || type=='remove_new_child' || type=='new_expand_colapse'){
            let newProductsList=component.get('v.newProductsList');
            component.set('v.newProductsList',helper.processProductData(newProductsList,type,index,component));
        }
        else if(type=='edit_remove_parent' || type=='edit_add_child' || type=='edit_remove_child' || type=='edit_expand_colapse'){
            let linkedProductsList=component.get('v.linkedProductsList');
            component.set('v.linkedProductsList',helper.processProductData(linkedProductsList,type,index,component));
        }
    },
    onSaveProduct:function(component,event,helper){
        let currentStep=component.get('v.currentStep');  
        if(currentStep=='1'){
            helper.navigate(component,'2');
        }
        else if(currentStep == '2'){
            let newProductsList=component.get('v.newProductsList');
            let oppLineItemRecords=helper.processOpportunityLineItemrecord(newProductsList,component.get('v.recordId'),'new');
            if(oppLineItemRecords){
                component.set('v.isLoading',true)
                helper.callApex(component,'insertOpportuntiyLineItems',function(response){
                    let status=response.getState();
                    if (status === "SUCCESS"){
                        helper.showToast('success',"Insert Successful!","Products added successfully.");
                        helper.getAllRelatedProducts(component);
                        helper.closeAddProduct(component)
						$A.get('e.force:refreshView').fire();
                    }
                    else{
                        let errors = response.getError();
                        console.error(errors);
                        let message="";
                        if (errors && errors[0]) {
                            message = helper.getError(errors[0]);
                        }
                        
                        helper.showToast('error',"Insert Error!",message);
                        component.set('v.isLoading',false)
                        helper.closeAddProduct(component)

                    }
                    
                },{
                    opportunityLineItemJSON:JSON.stringify(oppLineItemRecords)
                });
            }
           
        }
    },
    //Edit Product Methids
    onUpdateProduct:function(component,event,helper){
        let linkedProductsList=component.get('v.linkedProductsList');
        let oppLineItemRecords=helper.processOpportunityLineItemrecord(linkedProductsList,component.get('v.recordId'),'edit');
        let linkedDeleteProductsList=component.get('v.linkedDeleteProductsList')
        console.log('linkedDeleteProductsList',linkedDeleteProductsList)
        if(oppLineItemRecords){
            component.set('v.isLoading',true)
            helper.callApex(component,'updateOpportuntiyLineItems',function(response){
                let status=response.getState();
                if (status === "SUCCESS"){
                    helper.showToast('success',"Update Successful!","Products Updated/Deleted successfully.");
                    helper.getAllRelatedProducts(component);
                    helper.closeUpdatePorduct(component);
                    $A.get('e.force:refreshView').fire();
                }
                else{
                    let errors = response.getError();
                    console.log('errors',errors)
                    let message="";
                    if (errors && errors[0]) {
                        message = helper.getError(errors[0]);
                    }
                    helper.showToast('error',"Update Error!",message);
                    helper.closeUpdatePorduct(component)
                }
            },{
                updateList:JSON.stringify(oppLineItemRecords),
                deleteList:JSON.stringify(linkedDeleteProductsList)
            });
            
        }
    },
   
    
    
})