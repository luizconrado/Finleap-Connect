({
	doInit : function(component, event, helper) {
        const isMobile= $A.get("$Browser.formFactor")==='PHONE';
        component.set('v.isMobile',isMobile);
        //get roles
        helper.getMemeberRoles(component);
        //set new list
        helper.setNewMemberList(component);
        //get access
        helper.setAccess(component);
        
        
	},
    viewAllInvoked:function(component){
        //show view all popup
        const isMobile=component.get('v.isMobile');
        if(false/*disalbed due to https://help.salesforce.com/articleView?id=000354334&type=1&mode=1*/){
            //if in mobile context opening modal as refrence
            const viewAllListData=component.get('v.teamMemberViewList');
            const relatedList={
                componentDef:"c:RelatedListItem",
                attributes: {
                    tileclass:"slds-box",
                    sobjectName:"AccountTeamMember",
                    recordList:viewAllListData,
                    viewLength:viewAllListData.length,
                    inlineDetals:true
                }
            }
            const compReference = {
                type: 'standard__component',
                attributes: {
                    componentName: 'c__Modal',
                },
                state: {
                    "c__header":'Account Team ('+viewAllListData.length+')',
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
        if(action=='Add_Memeber'){
            component.set('v.isAddMemeber',true)

        }
        else if(action=='Remove_Memeber'){
            component.set('v.isRemoveMemeber',true)
        }
    },
    closePopup:function(component,event,helper){
        //close popup
        let action=event.getSource().get('v.value')
    	//reset variables
        if(action=='Add_Memeber'){
            component.set('v.isAddMemeber',false)
			helper.setNewMemberList(component);
        }
        else if(action=='Remove_Memeber'){
            component.set('v.orignalTeamMemberList',component.get('v.copyTeamMemberList'));
            component.set('v.isRemoveMemeber',false)
        }
    },
    addNewRow:function(component,event,helper){
        //add blank row to list
        let newTeamMemberList=component.get('v.newTeamMemberList');
        newTeamMemberList=helper.resetIndex(newTeamMemberList);
        newTeamMemberList.push({
            index:newTeamMemberList.length+1,
            userId:'',
            userName:'',
            role:'',
            accountAccess:'Edit',
            caseAccess:'Edit',
            opportunityAccess:'None'
        })
        component.set('v.newTeamMemberList',newTeamMemberList);
        
    },
    removeNewRow:function(component,event,helper){
        //remove blank row from list
        let index=event.getSource().get('v.value');
        let newTeamMemberList=component.get('v.newTeamMemberList');
        let modifiedTeamMemberList=newTeamMemberList.filter(function(item){
            if(item.index!=index){
                return item;
            }
        });
        modifiedTeamMemberList=helper.resetIndex(modifiedTeamMemberList);
        component.set('v.newTeamMemberList',modifiedTeamMemberList);
    },
    onUserSelect:function(component,event,helper){
        //set selected user to new row
        let dataset =event.currentTarget.dataset;
        const index=dataset.index;
        const userId=dataset.userid;
        const userName=dataset.username
        let newTeamMemberList=component.get('v.newTeamMemberList');
        newTeamMemberList=helper.setUser(newTeamMemberList,index,userId,userName);
        component.set('v.newTeamMemberList',newTeamMemberList);
        component.set('v.userList',[]);
        component.set('v.currentUserIndex',-1)
        
    },
    onUserremove:function(component,event,helper){
        //remove selected user from new row
        let dataset =event.currentTarget.dataset;
        const index=dataset.index;
        let newTeamMemberList=component.get('v.newTeamMemberList');
        newTeamMemberList=helper.setUser(newTeamMemberList,index,'','');
        component.set('v.newTeamMemberList',newTeamMemberList);
        component.set('v.userList',[]);
        component.set('v.currentUserIndex',-1)
    },
    
    deleteMemberRow:function(component,event,helper){
        //remove user row from list and add to delete list
        let index=event.getSource().get('v.value');
        let orignalTeamMemberList=component.get('v.orignalTeamMemberList');
        let deleteTeamMemberList=component.get('v.deleteTeamMemberList');
        deleteTeamMemberList.push(index);
        let modifiedTeamMemberList=orignalTeamMemberList.filter(function(item){
            if(item.Id!=index){
                return item;
            }
        });
        component.set('v.orignalTeamMemberList',modifiedTeamMemberList);
        component.set('v.deleteTeamMemberList',deleteTeamMemberList);
    },
    //server call 
    insertUser:function(component,event,helper){
        //insert users as team members
        let newTeamMemberList=component.get('v.newTeamMemberList');
        let accountId=component.get('v.recordId');
        

        let insertList=newTeamMemberList.filter(function(member){
            if(member.userId && member.userName && member.role){
                return member;
            }
        }).map(function(member){
            let obj= {
                UserId:member.userId,
                TeamMemberRole:member.role,
                AccountAccessLevel:member.accountAccess,
                OpportunityAccessLevel:member.opportunityAccess,
                CaseAccessLevel:member.caseAccess,
                AccountId :accountId,
                Creation_Type__c :'Manual'
            }
            obj.User={};
            obj.User.Name=member.userName;
            obj.User.Id=member.userId;
            return obj;
        });
        if(insertList.length>0){
            component.set('v.isLoading',true)
            helper.callApex(component,'insertAccountTeamMembers',function(response){
                let status=response.getState();
                if (status === "SUCCESS"){
                    helper.showToast('success',"Insert Successful!","Team members added successfully.");
                    helper.setNewMemberList(component);
                    helper.getMemebers(component);
                }
                else{
                    let errors = response.getError();
                    let message="Please contact your system admin if problem continues.";
                    if (errors && errors[0] && errors[0].message) {
                        message= errors[0].message;
                    }

                    helper.showToast('error'," Error Insert!",message);
                }
                component.set('v.isAddMemeber',false);
                component.set('v.isLoading',false)
            },{
                teamMemberList:JSON.stringify(insertList),
                accountId:component.get('v.recordId')
            });
        }
    },
    deleteMembers:function(component,event,helper){
        //delete team members
        let deleteTeamMemberList=component.get('v.deleteTeamMemberList');
        component.set('v.isLoading',true)
        helper.callApex(component,'deleteTeamMember',function(response){
            let status=response.getState();
            if (status === "SUCCESS"){
                //get new list
                helper.getMemebers(component);
                helper.showToast('success',"Delete Successful!","Team members deleted successfully.");
            }else{
                let errors = response.getError();
                let message="Please contact your system admin if problem continues.";
                if (errors && errors[0] && errors[0].message) {
                    message= errors[0].message;
                }
                helper.showToast('error',"Delete  Error!",message);
                component.set('v.orignalTeamMemberList',component.get('v.copyTeamMemberList'));
            }
            component.set('v.isLoading',false)
            component.set('v.isRemoveMemeber',false)
        },{
            teamMembers:deleteTeamMemberList,
            accountId:component.get('v.recordId')
        });
    },
    searchUser:function(component,event,helper){
        
        let value=event.getSource().get('v.value')
        let index=event.getSource().get("v.name");
        
        if(value.trim().length>2){
            helper.callApex(component,'searchUsers',function(response){
                let status=response.getState();
                if (status === "SUCCESS"){
                    let data = response.getReturnValue();
                    component.set('v.userList',data)
                    component.set('v.currentUserIndex',index)
                }
            },{
                userName:value.trim()
            })
            
        }
        else{
            component.set('v.userList',[])
            component.set('v.currentUserIndex',-1)
        }
    },
})