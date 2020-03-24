public class FieldSet {
    @AuraEnabled public Boolean isDBRequired                      { get; set; }
    @AuraEnabled public Boolean isRequired                        { get; set; }
    @AuraEnabled public String fieldType                          { get; set; }
    @AuraEnabled public String fieldLabel                         { get; set; }
    @AuraEnabled public String fieldAPIName                       { get; set; }
    @AuraEnabled public String fieldData                       { get; set; }
    @AuraEnabled public String fieldDataID                       { get; set; }
    public List<Schema.PicklistEntry> pickListValues { get; set; }
}