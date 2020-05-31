import { LightningElement, wire } from 'lwc';
import allRecords from '@salesforce/apex/UsageDashboardController.fetchAllTrackingRecords';
import chartjs from '@salesforce/resourceUrl/charjs';

export default class UsageDashboard extends LightningElement {
    month;
    records;

    @wire(allRecords)
    wiredRecords({ error, data }) {
        if (data) {
            this.records = data;
            console.log('data'.data);
        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback() {
        let month = [];
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
        this.monthValues = month;
        loadScript(this, chartjs)
            .then(() => this.process());
    }
    process() {

    }


}