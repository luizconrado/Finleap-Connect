public class ActivtyRedirect_Controller {
    
    @AuraEnabled
    public static Map<String,String> getAccessDetails(Id activityId){
        String activityType = activityId.getSObjectType().getDescribe().getName();
       	Boolean isAccessable=False;
        String queryString ='SELECT Id,WhatId FROM '+activityType+' WHERE id=:activityId';
        List<SObject> activitys=Database.query(queryString);
        String message='';
        String oppId='';
        if(activitys.size()>0){
            Activity_Access__c accessSettings = Activity_Access__c.getInstance(userinfo.getProfileId());
            Map<String,String> activityAndWhatId=new Map<String,String>{(String)activitys.get(0).Id=>(String)activitys.get(0).get('WhatId')};
			Map<String,Boolean> activityAccessMap=Permission.getActitvityAccess(activityAndWhatId);
            isAccessable=activityAccessMap.get(activitys.get(0).Id);
            oppId=(String)activitys.get(0).get('WhatId');
            message='You Do not have access to activity.Please Contact Admin.';
        }
        return new Map<String,String>{'access'=>String.valueOf(isAccessable),'id'=>oppId,'msg'=>message};
    }

}