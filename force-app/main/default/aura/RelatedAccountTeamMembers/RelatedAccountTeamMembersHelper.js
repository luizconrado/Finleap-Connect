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
                //sort reocrds based on team role
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
                //creating key value pair for team roles
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
    setAccess:function(component){
        const _self=this;
        //check access of user based on Account_Team_Configuration__c custom setting
        _self.callApex(component,"getAccessConfig",function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                let data = response.getReturnValue();
                if(data.Read__c){
                    //get memebers
                    _self.getMemebers(component);
                }
               if(data.Write__c){
                    //setting add and remove options
                    _self.setActions(component);
                }
             }
        });
    },
    setActions:function(component){
      const actions=[{value:'Add_Memeber',name:'Add Team Members'},
                     {value:'Remove_Memeber',name:'Remove Team Members'}];
        component.set('v.recordActions',actions)
    },
    setNewMemberList:function(component){
        //setting empty 3 rows
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
       	//obtaining order specified in label based on role and comapny  
        const companyOrder=JSON.parse($A.get("$Label.c.Priority_Order_By_Company"));
        const roleOrder=JSON.parse($A.get("$Label.c.Priority_Order_By_Role"));
       
        list.forEach(function(member){
            let roleList=member.TeamMemberRole.split('-');
            let companyPosition=companyOrder[roleList[0].trim()]||0;
            let rolePosition=roleOrder[roleList[1].trim()]||0;
            member.position=parseInt(rolePosition+''+companyPosition)
        })
        //sort by decending
        return list.sort(function(a,b){
            return b.position- a.position;
        });
    }
})