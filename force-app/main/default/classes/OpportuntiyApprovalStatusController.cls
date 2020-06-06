public class OpportuntiyApprovalStatusController {
    @AuraEnabled 
    public static Boolean getApprovalProcessStatus(String recordId){
         List<ProcessInstanceWorkitem> aprovalStatus=[SELECT ProcessInstance.STATUS,ActorId FROM ProcessInstanceWorkitem WHERE ProcessInstance.TargetObjectId=:recordId LIMIT 40];
        if(aprovalStatus.size()>0){
            if(aprovalStatus.get(0).ProcessInstance.STATUS=='Pending'){
            	return true;
            }
        }
        return false;
       
    }

}