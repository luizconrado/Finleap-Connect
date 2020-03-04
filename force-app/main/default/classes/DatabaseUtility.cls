public inherited  sharing class DatabaseUtility {
    public static List<DatabaseResponse> insertRecords(SObject records){
        return processOperation(Database.insert(New List<Sobject>{records},false));
    }
    public static List<DatabaseResponse> insertRecords(List<SObject> records){
        return processOperation(Database.insert(records,false));
    }
    public static List<DatabaseResponse> updateRecords(SObject records){
        return processOperation(Database.update(new List<Sobject>{records},false));
    }
    public static List<DatabaseResponse> updateRecords(List<SObject> records){
        return processOperation(Database.update(records,false));
    }
    
    private static List<DatabaseResponse> processOperation(Database.SaveResult[] result){
        List<DatabaseResponse> response=new List<DatabaseResponse>();
        for (Database.SaveResult sr : result) {
            if (sr.isSuccess()) {
                response.add(new DatabaseResponse(sr.getId()));
            }
            for(Database.Error err : sr.getErrors()) {
                response.add(new DatabaseResponse(sr.getId(),'Error '+err.getMessage()+' For Following Fields '+ err.getFields()));
            }
        }
        return response;
    }
    
    

}