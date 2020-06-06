public class OpportuntiyContractController {
    
    @AuraEnabled
    public static void updateOpportuntiyWithContract(String oppId,String contractId){
        Opportunity o=new Opportunity();
        o.Id=oppId;
        o.ContractId=contractId;
        update o;
    }

}