public class EventTriggerHelper {
    
    //HACK: Future Method is Needed as EventRelation takes some time to be inserted in database
    @future
    public static void changeStandardContactsToInvesetmentContacts(Final Set<Id> newEventIds){
        List<EventRelation> relatedOpportunityAndContact=getOpportunityAndContactRelation(newEventIds);
        Map<String,List<String>> eventIdAndStandardContacts=getStandardContactsOfInvestmentOpportunity(relatedOpportunityAndContact);
        List<String> contactIds=new List<String>();
        for(String eventId:eventIdAndStandardContacts.keySet()){
            contactIds.addAll(eventIdAndStandardContacts.get(eventId));
        }
        if(!contactIds.isEmpty()) convertStandardContactToInvestmentContact(contactIds);
    }
    private static List<EventRelation> getOpportunityAndContactRelation(Final Set<Id> newEvents){
        return [SELECT Id,RelationId,Relation.Type,EventId,Relation.RecordTypeId FROM EventRelation WHERE EventId IN:newEvents AND (Relation.Type='Opportunity' OR Relation.Type='Contact')];
    }
    private static Map<String,List<String>> getStandardContactsOfInvestmentOpportunity(Final List<EventRelation> opportunityAndContactRelation){
        Map<Id,EventRelation> investmentOpportunitys=new Map<Id,EventRelation>();
        Map<Id,List<EventRelation>> contactRelations=new Map<Id,List<EventRelation>>();
        Map<String,List<String>> eventContactMap=new Map<String,List<String>>();
	
        //Getting Investment Opportunity and Standard Contacts
        for(EventRelation tr:opportunityAndContactRelation){
            if(tr.Relation.RecordTypeId==Constant.OPPORTUNITY_FINLEAP_INVESTMENT_RECORDTYPE_ID){
                investmentOpportunitys.put(tr.EventId,tr);
            }
            
            if(tr.Relation.RecordTypeId==Constant.CONTACT_STANDARD_RECORDTYPE_ID){
                if(!contactRelations.containsKey(tr.EventId)){
                    contactRelations.put(tr.EventId,new List<EventRelation>());
                }
                contactRelations.get(tr.EventId).add(tr);
            }
        }
        
        //Getting Standard Contacts For the Investment opportunity
        for(Id eventId:investmentOpportunitys.keySet()){
            if(contactRelations.containsKey(eventId)){
                for(EventRelation contact:contactRelations.get(eventId)){
                    if(!eventContactMap.containsKey(eventId)){
                        eventContactMap.put(eventId,new List<String>());
                    }
                    eventContactMap.get(eventId).add(contact.RelationId);
                }
            }
        }
        
        return eventContactMap;
    }
    private static List<DatabaseResponse>  convertStandardContactToInvestmentContact(Final List<String> contactIds){
        List<Contact> toChangeRecordType=new List<Contact>();
        //NOTE:Proccess Builder changes the record type based on Finleap_Contact_Type__c field value
        for(String contactId:contactIds){
            toChangeRecordType.add(new Contact(Id=contactId,Finleap_Contact_Type__c='Investment'));
        }
        List<DatabaseResponse> response=DatabaseUtility.updateRecords(toChangeRecordType);
        DatabaseResponse.logError(response,'EventTriggerHelper');
        return response;
    }
    

}