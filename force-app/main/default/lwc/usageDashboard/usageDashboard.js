import { LightningElement, wire } from 'lwc';
import allRecords from '@salesforce/apex/UsageDashboardController.fetchAllTrackingRecords';
import chartjs from '@salesforce/resourceUrl/charjs';
import charjs_treemap from '@salesforce/resourceUrl/charjs_treemap';


import { loadStyle, loadScript } from 'lightning/platformResourceLoader';


const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
export default class UsageDashboard extends LightningElement {
    //https://finleap-connect--partial.lightning.force.com/lightning/n/Usage_Dashboard
    monthValues = months
    userValues;
    records;
    filterdByMonth;
    filterdByUser;

    //charts
    lineChart;
    bubbleChart;
    usageTreeChart;
    changesTreeChart;
    //records
    changeRecords;
    usageRecords;

    //colors
    usageColor;
    changesColor;

    @wire(allRecords)
    wiredRecords({ error, data }) {
        if (data) {
            console.log('data', data);
            this.records = data;

            this.process();

        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback() {
        this.usageColor = this.getBgColor();
        this.changesColor = this.getBgColor();

        Promise.all([
            loadScript(this, chartjs),
            loadScript(this, charjs_treemap)
        ]);

    }
    process() {
        let changeTrackingRecords = this.records.filter(r => r.RecordType.Name === 'Field History');
        let usageTrackingRecords = this.records.filter(r => r.RecordType.Name === 'Usage Tracker');
        this.changeRecords = changeTrackingRecords;
        this.usageRecords = usageTrackingRecords;
        this.setupFilters(usageTrackingRecords, changeTrackingRecords)
        this.preapreLineChart(usageTrackingRecords, changeTrackingRecords, 'new');
        this.pepareBubbleChart(usageTrackingRecords, changeTrackingRecords, 'new');
        this.prepareTreeChart(usageTrackingRecords, changeTrackingRecords, 'new');
    }

    //Point size Chart

    pepareBubbleChart(usageTrackingRecords, changeTrackingRecords, type) {

        let usageDataset = this.getBubbleChartDataset(usageTrackingRecords, 'usage')
        let changeDataset = this.getBubbleChartDataset(changeTrackingRecords, 'changes');
        let [max, min] = this.getMinAndMax([...usageDataset[0], ...changeDataset[0]]);
        let data = {
            labels: [...usageDataset[1], ...changeDataset[0]],
            datasets: [...usageDataset[0], ...changeDataset[0]]
        }
        data.datasets.forEach(data => {
            data.data[0].r = this.scale(data.data[0].r, max, min);
        });

        let bubbleChartJSON = {
            type: 'bubble',
            data: data,
            options: {
                responsive: true,
                hoverMode: 'index',
                stacked: false,
                title: {
                    display: true,
                    text: 'Record Views and Changes By User'
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Views "
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Date "
                        }
                    }]
                },
                legend: {
                    display: false
                },
                tooltips: {
                    callbacks: {
                        title: function (item, data) {
                            return data.datasets[item[0].datasetIndex].label;
                        },
                        label: function (item, data) {

                            let dataset = data.datasets[item.datasetIndex];
                            let dataItem = dataset.data;
                            let obj = dataItem[0];

                            return dataset.label + ' : ' + obj.y
                        }
                    }
                }

            }
        }
        if (type === 'new') {
            this.bubbleChart = this.createChart('bubbleChart', bubbleChartJSON);
        }
        else if (type === 'update') {
            this.bubbleChart.data = data;
            this.bubbleChart.update();
        }
    }

    getBubbleChartDataset(trackingRecords, type) {
        let groupByDates = this.groupByDates(trackingRecords);
        let labels = Object.keys(groupByDates);
        let lineChartDataset = [];
        let color = (type == 'usage') ? this.usageColor : this.changesColor;
        if (!this.filterdByMonth) {
            for (let label of months) {
                if (groupByDates[label]) {
                    let groupByUsers = this.groupByUsers(groupByDates[label]);
                    for (let userId of Object.keys(groupByUsers)) {
                        let records = groupByUsers[userId];
                        if (this.filterdByUser) {
                            records = this.filterRecordByUserId(records);
                        }
                        if (records.length > 0) {
                            lineChartDataset.push({
                                label: (records[0].User__r) ? records[0].User__r.Name : '',
                                backgroundColor: color,
                                borderColor: color,
                                data: [{
                                    x: this.getNumberFromMonth(label),
                                    y: records.length,
                                    r: records.length,
                                }]
                            })
                        }

                    }
                }
            }
        }
        else {
            labels = labels.sort(function (a, b) {
                b = new Date(a);
                a = new Date(b);
                return a > b ? -1 : a < b ? 1 : 0;
            });
            for (let label of labels) {
                if (groupByDates[label]) {
                    let groupByUsers = this.groupByUsers(groupByDates[label]);
                    for (let userId of Object.keys(groupByUsers)) {
                        let records = groupByUsers[userId];
                        if (this.filterdByUser) {
                            records = this.filterRecordByUserId(records);
                        }
                        if (records.length > 0) {
                            lineChartDataset.push({
                                label: (records[0].User__r) ? records[0].User__r.Name : '',
                                data: [{
                                    x: label,
                                    y: records.length,
                                    r: records.length,
                                }],
                                backgroundColor: color,
                                borderColor: color,
                            })
                        }
                    }
                }
            }
        }

        return [lineChartDataset, labels];
    }

    //Line chart
    preapreLineChart(usageTrackingRecords, changeTrackingRecords, type) {
        let usage = this.getLineChartDataset(usageTrackingRecords, 'usage');
        let change = this.getLineChartDataset(changeTrackingRecords, 'changes');
        let labels = [];
        labels = [...usage[1]];
        labels = [...change[1]];
        labels = [...new Set(labels)];
        let lineChartDataset = [];
        lineChartDataset.push(...usage[0]);
        lineChartDataset.push(...change[0]);


        if (this.filterdByMonth) {
            labels = labels.sort(function (a, b) {
                a = new Date(b);
                b = new Date(a);
                return a > b ? -1 : a < b ? 1 : 0;
            });
        }

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
                    text: 'Record Views and Changes Timeline'
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

    getLineChartDataset(trackingRecords, type) {
        let groupByDates = this.groupByDates(trackingRecords);
        let labels = days;
        let lineChartDataset = [];
        let recordCount = [];
        if (!this.filterdByMonth) {
            for (let label of months) {
                if (groupByDates[label] && groupByDates[label].length > 0) {
                    let records = groupByDates[label];
                    if (this.filterdByUser) {
                        records = this.filterRecordByUserId(records);
                    }
                    recordCount.push(records.length);
                }
                else {
                    recordCount.push(0);
                }
            }
        }
        else {
            labels = labels.sort(function (a, b) {
                b = new Date(a);
                a = new Date(b);
                return a > b ? -1 : a < b ? 1 : 0;
            });
            for (let label of labels) {
                if (groupByDates[label] && groupByDates[label].length > 0) {
                    let records = groupByDates[label];
                    if (this.filterdByUser) {
                        records = this.filterRecordByUserId(records);
                    }
                    recordCount.push(records.length);
                }
                else {
                    recordCount.push(0);
                }
            }
        }
        lineChartDataset.push({
            label: (type == 'usage') ? 'Views' : 'Changes',
            data: recordCount,
            borderColor: (type == 'usage') ? this.usageColor : this.changesColor,
            fill: false
        })

        return [lineChartDataset, (!this.filterdByMonth) ? months : labels];
    }

    //treemap chart
    prepareTreeChart(usageTrackingRecords, changeTrackingRecords, type) {
        let usage = this.getTreeChartDataset(usageTrackingRecords, 'usage');
        let change = this.getTreeChartDataset(changeTrackingRecords, 'change');


        let usageTreeChartJSON = {
            type: "treemap",
            data: {
                datasets: [{
                    tree: usage,
                    key: "num",
                    groups: ['tag'],
                    spacing: 0.5,
                    borderWidth: 1.5,
                    fontColor: "black",
                    borderColor: this.usageColor
                }]
            },
            options: {
                maintainAspectRatio: true,
                legend: { display: false },
                tooltips: {
                    callbacks: {
                        title: function (item, data) {
                            return data.datasets[item[0].datasetIndex].tag;
                        },
                        label: function (item, data) {
                            let dataset = data.datasets[item.datasetIndex];
                            let dataItem = dataset.data[item.index];
                            let obj = dataItem._data;

                            return obj.tag + ' : ' + obj.num
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Record Views  By Concentration'
                }
            }
        }
        let changeTreeChartJSON = {
            type: "treemap",
            data: {
                datasets: [{
                    tree: change,
                    key: "num",
                    groups: ['tag'],
                    spacing: 0.5,
                    borderWidth: 1.5,
                    fontColor: "black",
                    borderColor: this.changesColor
                }]
            },
            options: {
                maintainAspectRatio: true,
                legend: { display: false },
                tooltips: {
                    callbacks: {
                        title: function (item, data) {
                            return data.datasets[item[0].datasetIndex].tag;
                        },
                        label: function (item, data) {
                            let dataset = data.datasets[item.datasetIndex];
                            let dataItem = dataset.data[item.index];
                            let obj = dataItem._data;

                            return obj.tag + ' : ' + obj.num
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Record Changes By Concentration'
                }
            }
        }
        if (type == 'new') {

            this.usageTreeChart = this.createChart('treeUsageChart', usageTreeChartJSON);
            this.changesTreeChart = this.createChart('treeChangeChart', changeTreeChartJSON);
        }
        else if (type == 'update') {
            this.usageTreeChart.data.datasets[0].tree = usage;
            this.usageTreeChart.update();
            this.changesTreeChart.data.datasets[0].tree = change;
            this.changesTreeChart.update();
        }

    }

    getTreeChartDataset(trackingRecords, type) {
        let groupByDates = this.groupByDates(trackingRecords);
        let groupByRecord = this.groupByRecord(Object.values(groupByDates).flat(Infinity));
        let treeChartDataset = [];
        for (let recordId of Object.keys(groupByRecord)) {
            let records = groupByRecord[recordId]
            if (this.filterdByUser) {
                records = this.filterRecordByUserId(records);
            }
            if (records && records.length > 0) {
                treeChartDataset.push({
                    tag: records[0].Record_Name__c,
                    num: records.length
                });
            }
        }



        return treeChartDataset;

    }

    //filters
    setupFilters(usageTrackingRecords, changeTrackingRecords) {
        let trackUsageName = usageTrackingRecords
            .map(r => {
                return {
                    label: (r.User__r) ? r.User__r.Name : '',
                    value: (r.User__c) ? r.User__c : ''
                }
            })
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);
        let trackChangeName = changeTrackingRecords
            .map(r => {
                return {
                    label: (r.User__r) ? r.User__r.Name : '',
                    value: (r.User__c) ? r.User__c : ''
                }
            })
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);
        let userNames = [...trackUsageName, ...trackChangeName]
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);
        this.userValues = userNames;
    }

    onMonthFilter(event) {
        const month = event.target.value;
        this.filterdByMonth = month;
        this.processFilters();
    }

    onUserFilter(event) {
        const userId = event.target.value;
        this.filterdByUser = userId;
        this.processFilters();
    }

    processFilters() {
        this.preapreLineChart(this.usageRecords, this.changeRecords, 'update');
        this.pepareBubbleChart(this.usageRecords, this.changeRecords, 'update');
        this.prepareTreeChart(this.usageRecords, this.changeRecords, 'update');
    }

    //utility
    getMonthFromDate(date) {
        let d = new Date(date);
        return months[d.getMonth()];
    }
    getDateFromMonth(date) {
        let d = new Date(date);
        return d.getDate();
    }
    getNumberFromMonth(month) {
        return months.indexOf(month);
    }
    groupByDates(list) {
        return list.reduce((r, a) => {
            let tempMonth = this.getMonthFromDate(a.CreatedDate);
            let tempDate = this.getDateFromMonth(a.CreatedDate);
            if (this.filterdByMonth === tempMonth) {
                r[tempDate] = [...r[tempDate] || [], a];
            }
            else if (!this.filterdByMonth) {
                r[tempMonth] = [...r[tempMonth] || [], a];
            }
            return r;
        }, {});
    }
    groupByUsers(list) {
        return list.reduce((r, a) => {
            let tempUser = a.User__c || 'None';
            r[tempUser] = [...r[tempUser] || [], a];
            return r;
        }, {});
    }
    groupByRecord(list) {
        return list.reduce((r, a) => {
            let tempRecord = a.Record_Id__c || 'None';
            r[tempRecord] = [...r[tempRecord] || [], a]
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
    filterRecordByUserId(list) {
        return list.filter(r => r.User__c == this.filterdByUser);
    }
    scale(value, max, min) {

        let from = [min, max];
        let to = [1, 100];
        let scale = (to[1] - to[0]) / (from[1] - from[0]);
        let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
        return ~~(capped * scale + to[0]);
    }
    getMinAndMax(list) {
        let nums = list.map(l => l.data[0].r);
        return [Math.max(...nums), Math.min(...nums)];
    }
}





