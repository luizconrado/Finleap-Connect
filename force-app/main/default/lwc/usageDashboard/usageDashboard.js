import { LightningElement, wire } from 'lwc';
import allRecords from '@salesforce/apex/UsageDashboardController.fetchAllTrackingRecords';
import chartjs from '@salesforce/resourceUrl/charjs';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';


const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export default class UsageDashboard extends LightningElement {
    //https://finleap-connect--partial.lightning.force.com/lightning/n/Usage_Dashboard
    monthValues = months
    records;
    filterdByMonth;

    //charts
    lineChart;

    //records
    changeRecords;
    usageRecords;

    @wire(allRecords)
    wiredRecords({ error, data }) {
        if (data) {

            this.records = data;

            this.process();
            console.log('data', data);
        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback() {
        loadScript(this, chartjs);
    }
    process() {
        let changeTrackingRecords = this.records.filter(r => r.RecordType.Name === 'Field History');
        let usageTrackingRecords = this.records.filter(r => r.RecordType.Name === 'Usage Tracker');
        this.changeRecords = changeTrackingRecords;
        this.usageRecords = usageTrackingRecords;
        this.preapreLineChart(usageTrackingRecords, changeTrackingRecords, 'new');
    }

    preapreLineChart(usageTrackingRecords, changeTrackingRecords, type) {
        let usage = this.getUsageByMonth(usageTrackingRecords, type);
        let change = this.getChangesByMonth(changeTrackingRecords, type);
        let labels = [];
        labels = [...usage[1]];
        labels = [...change[1]];
        labels = [...new Set(labels)];

        let lineChartDataset = [];
        lineChartDataset.push(...usage[0]);
        lineChartDataset.push(...change[0]);
        let data = {
            labels: labels,
            datasets: lineChartDataset
        }
        let lineChartJSON = {
            type: "line",
            data: data,
            options: {
                responsive: true,
                hoverMode: 'index',
                stacked: false,
                title: {
                    display: true,
                    text: 'Usage and Changes'
                }

            }
        }

        if (type == 'new') {
            this.lineChart = this.createChart('lineChart', lineChartJSON);
        }
        else if (type == 'update') {
            this.lineChart.data = data;
            this.lineChart.update();
        }
    }

    getUsageByMonth(usageTrackingRecords, type) {
        let usageByDates = this.groupByDates(usageTrackingRecords);
        let labels = Object.keys(usageByDates);
        let lineChartDataset = [];
        let usageCount = [];
        if (!this.filterdByMonth) {
            for (let label of months) {
                if (usageByDates[label]) {
                    usageCount.push(usageByDates[label].length);
                }
                else {
                    usageCount.push(0);
                }
            }
        }
        else {
            for (let label of labels) {
                if (usageByDates[label]) {
                    usageCount.push(usageByDates[label].length);
                }
                else {
                    usageCount.push(0);
                }
            }
        }
        lineChartDataset.push({
            label: 'Usage',
            data: usageCount,
            borderColor: this.getBgColor(),
            fill: false
        })

        return [lineChartDataset, (!this.filterdByMonth) ? months : labels];


    }

    getChangesByMonth(changeTrackingRecords, type) {
        let changeByDates = this.groupByDates(changeTrackingRecords);
        let labels = Object.keys(changeByDates);
        let lineChartDataset = [];
        let changeCount = [];
        if (!this.filterdByMonth) {
            for (let label of months) {
                if (changeByDates[label]) {
                    changeCount.push(changeByDates[label].length);
                }
                else {
                    changeCount.push(0);
                }

            }
        }
        else {
            for (let label of labels) {
                if (changeByDates[label]) {
                    changeCount.push(changeByDates[label].length);
                }
                else {
                    changeCount.push(0);
                }

            }
        }

        lineChartDataset.push({
            label: 'Changes',
            data: changeCount,
            borderColor: this.getBgColor(),
            fill: false
        })



        return [lineChartDataset, (!this.filterdByMonth) ? months : labels];

    }
    //filters
    onMonthFilter(event) {
        const month = event.target.value;
        this.filterdByMonth = month;
        this.processFilters();
    }

    processFilters() {
        this.preapreLineChart(this.usageRecords, this.changeRecords, 'update');
    }

    //utility
    getMonthFromDate(date) {
        let d = new Date(date);
        return months[d.getMonth()];
    }
    groupByDates(list) {
        return list.reduce((r, a) => {
            let tempMonth = this.getMonthFromDate(a.CreatedDate);
            if (this.filterdByMonth === tempMonth) {
                r[a.CreatedDate] = [...r[a.CreatedDate] || [], a];
            }
            else if (!this.filterdByMonth) {
                r[tempMonth] = [...r[tempMonth] || [], a];
            }
            return r;
        }, {});
    }
    createChart(divClass, dataset) {
        try {
            // disable Chart.js CSS injection
            //window.Chart.platform.disableCSSInjection = true;

            const canvas = document.createElement('canvas');
            //canvas.style.height = '50%';
            //canvas.style.width = '50%';

            const ctx = canvas.getContext('2d');

            let chart = new window.Chart(ctx, dataset);
            this.template.querySelector('div.' + divClass).appendChild(canvas);
            return chart;
        }
        catch (e) {
            console.error(e);
        }
    }
    getBgColor() {
        let x = Math.floor(Math.random() * 256);
        let y = Math.floor(Math.random() * 256);
        let z = Math.floor(Math.random() * 256);
        return "rgb(" + x + "," + y + "," + z + ")";
    }



}