import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getRelatedOpportunities from '@salesforce/apex/ShowInProgressController.getAllInProgressOpportunties'
import LANG from '@salesforce/i18n/lang';

const FIELDS = ['Opportuntiy.RecordTypeId', 'Opportuntiy.AccountId'];

export default class ShowInProgressOpportuntiy extends LightningElement {
    @api recordId
    showWarrning = false;
    viewAll = false;
    allRecords = [];
    allFields = [];
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (error) {
            this.processCallError(error);
        } else if (data) {
            const recordTypeId = data.fields.RecordTypeId.value;
            const accountId = data.fields.AccountId.value;
            getRelatedOpportunities({
                recordTypeId: recordTypeId,
                accountId: accountId,
                recordId: this.recordId
            }).then(result => {
                let { allOpp, fields } = this.processOpportunities(result);
                if (allOpp.length > 0) this.showWarrning = true;
                let viewList = allOpp.map(record => {

                    const fieldsParsed = fields.slice(0, 4).map(field => {

                        let [fieldName, fieldValue] = this.parseRecord(record, field);
                        return [fieldName, fieldValue]
                    });
                    let oppObj = {
                        access: record.access,
                        Id: record.Id
                    };

                    fieldsParsed.forEach((element, index) => {
                        const [fieldName, fieldValue] = element;
                        if (index == 0) {
                            oppObj.header = fieldValue;
                        }
                        if (index == 1) {
                            oppObj.field1Label = fieldName;
                            oppObj.field1Value = fieldValue;
                        }
                        if (index == 2) {
                            oppObj.field2Label = fieldName;
                            oppObj.field2Value = fieldValue;
                        }
                        if (index == 3) {
                            oppObj.field3Label = fieldName;
                            oppObj.field3Value = fieldValue;
                        }
                    });


                    return oppObj;
                });
                this.allRecords = viewList;
                this.allFields = fields;
            }).catch(this.processCallError);

        }
    };

    processOpportunities(result) {
        result = JSON.parse(result);
        const global = result.Global;
        const hidden = result.Private;
        const fields = result.Fields;
        let allOpp = [];
        //Adding access to records
        if (global.length > 0)
            allOpp.push(...global.map(function (o) {
                o.access = true;
                return o;
            }))
        if (hidden.length > 0)
            allOpp.push(...hidden.map(function (o) {
                o.access = false;
                if (o.Name) o.Name = o.Limited_Access_Name__c;
                return o;
            }));
        return { allOpp, fields };
    }

    processCallError(error) {
        let message = error;
        if (Array.isArray(error.body)) {
            message = error.body.map(e => e.message).join(', ');
        } else if (error.body && typeof error.body.message === 'string') {
            message = error.body.message;
        }
        console.log('error', message);
    }

    showAll() {
        console.log('showall ', this.allFields)
        console.log('showall ', this.allRecords)
        this.viewAll = true;
    }
    openOppPopUp() {

    }

    parseRecord(record, field) {
        let fieldName = field.fieldLabel
        let fieldValue = record[field.fieldAPIName]
        debugger;
        if (field.fieldType == 'REFERENCE' || field.fieldType == 'reference') {
            [fieldName, fieldValue] = this.parseRefrence(record, field);
        }
        if (field.fieldType == 'DATETIME') {
            fieldValue = this.parseDate(fieldValue);
        }
        return [fieldName, fieldValue]
    }
    parseRefrence(opp, field) {
        debugger;
        let fieldName = '';
        let fieldValue = '';
        if (field.fieldAPIName.endsWith('Id')) {
            fieldName = field.fieldAPIName.substring(0, field.fieldAPIName.lastIndexOf('Id'));
            if (opp[fieldName]) {
                fieldValue = opp[fieldName].Name
            }

        }
        if (field.fieldAPIName.endsWith('__c')) {
            let apiNameList = field.fieldAPIName.split('__c');
            let refrencenName = apiNameList[0] + '__r';
            let data = opp[refrencenName];
            if (data) {
                if (data.Name) {
                    fieldValue = data.Name;
                }
            }
            fieldName = field.fieldLabel
        }

        return [fieldName, fieldValue];
    }
    parseDate(dateValue) {
        debugger;
        let dateTimeFormat = new Intl.DateTimeFormat(LANG);
        let date = new Date(dateValue);
        return dateTimeFormat.format(date);

        /*
            $A.localizationService.UTCToWallTime(new Date(dateValue), $A.get('$Locale.timezone'), function (offSetDateTime) {
                dateValue = offSetDateTime
            });
            return $A.localizationService.formatDateTimeUTC(dateValue, $A.get('$Locale').dateFormat + ' ' + $A.get('$Locale').timeFormat);
        */
    }
}