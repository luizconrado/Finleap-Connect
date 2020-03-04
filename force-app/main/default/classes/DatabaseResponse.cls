public inherited  sharing class DatabaseResponse {
    
    public String id{set;get;}
    public Boolean success{set;get;}
    public String errorMsg{set;get;}
    public DatabaseResponse(Final String id){
        this.id=id;
        this.success=True;
        
    }
    
    public DatabaseResponse(Final String id,Final String errorMsg){
        this.id=id;
        this.success=False;
        this.errorMsg=errorMsg;
    }
    
    public static void logError(Final List<DatabaseResponse> result,Final String Source){
        Map<String,String> failedIds=new Map<String,String>();
        for(DatabaseResponse response:result){
            if(!response.success){
                failedIds.put((response.id!=null)?response.id:'',response.errorMsg);
            }
        }
        if(!failedIds.isEmpty()) LoggerService.logError(Source,JSON.serialize(failedIds));
    }
}