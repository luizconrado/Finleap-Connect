({
    
    callApex : function(component,methodname,callback,params) {
        const action = component.get("c."+methodname);
        if(params){
            action.setParams(params);    
        }
        action.setCallback(this,callback);
        $A.enqueueAction(action);
    },
    getMemebers:function(component){
        const _self=this;
        _self.callApex(component,"getAllTeamMembers",function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                data=_self.sortList(data);

                component.set('v.orignalTeamMemberList',data);
                component.set('v.copyTeamMemberList',data);
                component.set('v.deleteTeamMemberList',[]);
                
                //getting  view object list
                data=_self.getViewList(data);
                component.set('v.teamMemberList',data);
                component.set('v.teamMemberViewList',data.slice(0,3));
                component.set('v.loadView',true);
                
                
            }
            else if (status === "ERROR") {
                const toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Team Members Error!",
                    "type":'error',
                    "message": "Please contact your system admin if problem continues."
                });
                toastEvent.fire();
            }
        },{
            "accountId" : component.get("v.recordId")
        })
    },
    getMemeberRoles:function(component){
        const _self=this;
        _self.callApex(component,"getTeamMemeberRoles",function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                let rolesValue=[];
                rolesValue.push({
                    value:"",
                    name:""
                });
                Object.keys(data).forEach(function(key){
                    rolesValue.push({
                        value:key,
                        name:data[key]
                    });
                });
                component.set('v.teamRoleOptions',rolesValue);
            }
        });
    },
    setNewMemberList:function(component){
        let newTeamMemberList=[];
        newTeamMemberList.push({
            index:'1',
            userId:'',
            userName:'',
            role:'',
            accountAccess:'Edit',
            caseAccess:'Edit',
            opportunityAccess:'None'
        })
        newTeamMemberList.push({
            index:'2',
            userId:'',
            userName:'',
            role:'',
            accountAccess:'Edit',
            caseAccess:'Edit',
            opportunityAccess:'None'
        })
        newTeamMemberList.push({
            index:'3',
            userId:'',
            userName:'',
            role:'',
            accountAccess:'Edit',
            caseAccess:'Edit',
            opportunityAccess:'None'
        })
        component.set('v.newTeamMemberList',newTeamMemberList);
    },
    getViewList:function(files){
        const _self=this;
        let displayList=[];
        //creates view object list
        files.forEach(function(file,index){
            let fileObj={};
            fileObj.access=true;
            fileObj.Id=file.Id;
            fileObj.header=file.User.Name;
            fileObj.field1Value='Team Role: ';
            
            fileObj.field2Value=file.TeamMemberRole
            displayList.push(fileObj);
        });
        return displayList;
    },
    resetIndex:function(list){
        list.forEach(function(item,index){
            list.index=index+1;
        });
        return list;
    },
    setUser:function(teamMemberList,index,userId,userName){
        teamMemberList.forEach(function(list){
            if(list.index==index){
                list.userId=userId;
                list.userName=userName;    
            }
        });
        return teamMemberList;
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
    sortList:function(list){
        const companyOrder={
            'Finleap':9,
            'FLC':8
        }
        const roleOrder={
            'Account Manager':1,
            'Business Development':2,
            'Solution Engineer':3,
            'Integration Manager':4,
            'Customer Success Manager':5,
            'Business Unit Owner':6,
            'Vertical GM':7,
            'Executive Sponsor':8,
            'MD Responsible':9
        }
        list.forEach(function(member){
          
            let roleList=member.TeamMemberRole.split('-');
            let companyPosition=companyOrder[roleList[0].trim()]||0;
            let rolePosition=roleOrder[roleList[1].trim()]||0;
            member.position=parseInt(companyPosition+''+rolePosition)
        })
        return list.sort(function(a,b){
            return b.position- a.position;
        });
    }
})