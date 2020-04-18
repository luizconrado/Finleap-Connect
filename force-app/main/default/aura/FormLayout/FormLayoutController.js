({
    createView:function(component,event,helper){
        const fields=component.get('v.fieldsList');
        const record=component.get('v.record');
        let formFileds=[];
        let i=0,j=fields.length;
        while(i<j){
            formFileds.push(helper.createElement(record,fields[i],fields[i+1])); 
            i=i+2;
        }
        helper.createComponent(component,formFileds)
    },
})