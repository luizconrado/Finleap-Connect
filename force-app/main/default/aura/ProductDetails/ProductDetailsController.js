({
	onBucketAction : function(component, event, helper) {
        let index=event.getSource().get('v.value');
        let type=event.getSource().get('v.name');
        let product=component.get('v.product');
        if(type==='add_new_child'){
            let i=product.children.length+1;
            let childObj={};
            childObj.bucket=i;
            childObj.prodId=product.prodId;
            childObj.index=product.index+'_'+i;
            childObj.name='Tier '+i;
            childObj.excessprice=0;
            childObj.excesslimit=0;
            product.children.push(childObj)  
        }
        else if(type=='remove_new_child'){
            product.children.pop();
            
        }
        else if(type=='edit_remove_parent'){
            console.log('index',index);
            let linkedDeleteProductsList=component.get('v.linkedDeleteProductsList')
            linkedDeleteProductsList.push({Id:product.id,OpportunityId:product.oppid,Name:product.prodFamily+' - '+product.name});
            component.set('v.linkedDeleteProductsList',linkedDeleteProductsList);
            component.set('v.isDelete',true);
        }
        component.set('v.product',product);
	}
})