public inherited  sharing class DatabaseResponse {
    
    public String id{set;get;}
    public Boolean success{set;get;}
    public String errorMsg{set;get;}
    public DatabaseResponse(String id){
        this.id=id;
        this.success=True;
        
    }
    
    public DatabaseResponse(String id,String errorMsg){
        this.id=id;
        this.success=False;
        this.errorMsg=errorMsg;
    }
    
    public static void logError(List<DatabaseResponse> result,String Source){
        Map<String,String> failedIds=new Map<String,String>();
        for(DatabaseResponse response:result){
            if(!response.success){
                failedIds.put(response.id,response.errorMsg);
            }
        }
        if(!failedIds.isEmpty()) DatabaseUtility.insertRecords(LoggerService.logError(Source,JSON.serialize(failedIds)));
    }
}