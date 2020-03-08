@isTest
public class ConstantTest {
    
    @isTest
    static void getValues(){
        System.assert(!String.isEmpty(Constant.TASK_STANDARD_RECORDTYPE_ID));
        System.assert(!String.isEmpty(Constant.TASK_FINLEAP_INVESTMENT_RECORDTYPE_ID));
        System.assert(!String.isEmpty(Constant.CONTACT_FINLEAP_INVESTMENT_RECORDTYPE_ID));
        System.assert(!String.isEmpty(Constant.CONTACT_STANDARD_RECORDTYPE_ID));
        System.assert(!String.isEmpty(Constant.FINLEAP_CONNECT_PROFILE_ID));
        System.assert(!String.isEmpty(Constant.FINLEAP_GLOBAL_PROFILE_ID));
        System.assert(!String.isEmpty(Constant.FINLEAP_PROFILE_ID));
        System.assert(!String.isEmpty(Constant.OPPORTUNITY_FINLEAP_INVESTMENT_RECORDTYPE_ID));
        System.assert(!String.isEmpty(Constant.OPPORTUNITY_STANDARD_RECORDTYPE_ID));
        System.assert(!String.isEmpty(Constant.ACCOUNT_FINLEAP_INVESTOR_RECORDTYPE_ID));
        System.assert(!String.isEmpty(Constant.ACCOUNT_STANDARD_RECORDTYPE_ID));
        System.assert(!String.isEmpty(Constant.EVENT_STANDARD_RECORDTYPE_ID));
        System.assert(!String.isEmpty(Constant.EVENT_INVESTMENT_RECORDTYPE_ID));
        
            
    }

}