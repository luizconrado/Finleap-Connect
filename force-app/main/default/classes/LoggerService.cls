public without sharing class LoggerService {
    
    public static Log__c logException(Final String Source,Final String msg,Exception e){
        Log__c log=new Log__c();
        log.Priority__c='Low';
        log.Source__c=Source;
        log.Message__c=msg;
        log.Stack_Trace__c=getLimits()+getStackTrace(e);
        insert log;
        return log;    
        
    }
    public static Log__c logError(Final String Source,Final String msg){
        Log__c log=new Log__c();
        log.Priority__c='Low';
        log.Source__c=Source;
        log.Message__c=msg;
        log.Stack_Trace__c=getLimits();
        insert log;
        return log;
    }
    private static String getStackTrace(Exception ex){
        String exeptionString='';
        exeptionString += 'Message: ' + ex.getMessage() + '\n';
        exeptionString += 'Cause: ' + ex.getCause() + '\n';
        exeptionString += 'Line Number: ' + ex.getLineNumber() + '\n';
        exeptionString += 'Type Name: ' + ex.getTypeName() + '\n';
        exeptionString += 'Stack Trace: ' + ex.getStackTraceString() + '\n';
       	return exeptionString;
    }
    private static String getLimits(){
        String limitsString='';
        limitsString+='Running User Id : '+Userinfo.getUserId()+'\n';
        limitsString+='Running User Profile Id : '+Userinfo.getProfileId()+'\n';
        limitsString+='Running User Role Id : '+Userinfo.getUserRoleId()+'\n';
        limitsString+='CPU Time : '+Limits.getCpuTime()+' OF '+Limits.getLimitCpuTime()+'\n';
        limitsString+='Heap Size : '+Limits.getHeapSize()+' OF '+Limits.getLimitHeapSize()+'\n';
        limitsString+='DML Records : '+Limits.getDmlRows()+' OF '+Limits.getLimitDmlRows()+'\n';
        limitsString+='DML Statements : '+Limits.getDmlStatements()+' OF '+Limits.getLimitDmlStatements()+'\n';
        limitsString+='Query Records : '+Limits.getQueryRows()+' OF '+Limits.getLimitQueryRows()+'\n';
        limitsString+='Query Statements : '+Limits.getQueries()+' OF '+Limits.getLimitQueries()+'\n';
        limitsString+='Emails Sent : '+Limits.getEmailInvocations()+' OF '+Limits.getLimitEmailInvocations()+'\n';
        limitsString+='Callouts : '+Limits.getCallouts()+' OF '+Limits.getLimitCallouts()+'\n';
        return limitsString;
    }
    
}