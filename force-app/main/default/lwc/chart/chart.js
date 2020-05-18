import { LightningElement } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

import chartjs from '@salesforce/resourceUrl/charjs';
import myActivitys from '@salesforce/apex/VegaController.myactivitys'
export default class Chart extends LightningElement {
    CHART;

    values;
    taskList;
    eventList;
    allaccounts;

    monthValues;
    eventValues;
    industryValues;
    ratingValues;
    taskValues;


    monthFilter = '';
    eventFilter = '';
    taskFilter = '';
    industryFilter = '';
    ratingFilter = '';


    connectedCallback() {
        let month = new Array();
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
            .then(() => this.loadData());
    }
    loadData() {
        myActivitys()
            .then(result => {
                console.log(Chart, 'result', result)


                const taskList = result.Task;
                const eventList = result.Event;
                const accountList = result.Account;

                this.parseEventValues(eventList);
                this.parseTaskValues(taskList);
                this.parseAccountValues(accountList);


                console.log('industryValues', this.industryValues)
                console.log('ratingValues', this.ratingValues)
                console.log('taskValues', this.taskValues)
                console.log('eventValues', this.eventValues)


                let taskGroup = this.parseTaskGroup(taskList);
                console.log('taskGroup', taskGroup)

                let eventGroup = this.parseEventGroup(eventList);
                console.log('eventGroup', eventGroup)

                let values = this.parseChartData(taskGroup, eventGroup)
                console.log('values', values);

                this.values = values;
                this.taskList = taskList;
                this.eventList = eventList;
                this.loadChart();

            }).catch(error => {


            });
    }
    loadChart(spec) {
        try {
            // disable Chart.js CSS injection
            //window.Chart.platform.disableCSSInjection = true;

            const canvas = document.createElement('canvas');
            //canvas.style.height = '50%';
            //canvas.style.width = '50%';

            const ctx = canvas.getContext('2d');


            console.log('container', ctx)
            const dataset = {
                type: 'bar',
                data: this.values,
                options: {
                    responsive: true,
                    legend: {
                        position: 'right' // place legend on the right side of chart
                    },
                    scales: {
                        xAxes: [{
                            stacked: true // this should be set to make the bars stacked
                        }],
                        yAxes: [{
                            stacked: true // this also..
                        }]
                    }
                }
            }

            let temp = {
                type: 'bar',
                data: {
                    labels: ['Standing costs', 'Running costs'], // responsible for how many bars are gonna show on the chart
                    // create 12 datasets, since we have 12 items
                    // data[0] = labels[0] (data for first bar - 'Standing costs') | data[1] = labels[1] (data for second bar - 'Running costs')
                    // put 0, if there is no data for the particular bar
                    datasets: [{
                        label: 'Washing and cleaning',
                        data: [0, 8],
                        backgroundColor: '#22aa99'
                    }, {
                        label: 'Traffic tickets',
                        data: [0, 2],
                        backgroundColor: '#994499'
                    }, {
                        label: 'Tolls',
                        data: [0, 1],
                        backgroundColor: '#316395'
                    }, {
                        label: 'Parking',
                        data: [5, 2],
                        backgroundColor: '#b82e2e'
                    }, {
                        label: 'Car tax',
                        data: [0, 1],
                        backgroundColor: '#66aa00'
                    }, {
                        label: 'Repairs and improvements',
                        data: [0, 2],
                        backgroundColor: '#dd4477'
                    }, {
                        label: 'Maintenance',
                        data: [6, 1],
                        backgroundColor: '#0099c6'
                    }, {
                        label: 'Inspection',
                        data: [0, 2],
                        backgroundColor: '#990099'
                    }, {
                        label: 'Loan interest',
                        data: [0, 3],
                        backgroundColor: '#109618'
                    }, {
                        label: 'Depreciation of the vehicle',
                        data: [0, 2],
                        backgroundColor: '#109618'
                    }, {
                        label: 'Fuel',
                        data: [0, 1],
                        backgroundColor: '#dc3912'
                    }, {
                        label: 'Insurance and Breakdown cover',
                        data: [4, 0],
                        backgroundColor: '#3366cc'
                    }]
                },
                options: {
                    responsive: false,
                    legend: {
                        position: 'right' // place legend on the right side of chart
                    },
                    scales: {
                        xAxes: [{
                            stacked: true // this should be set to make the bars stacked
                        }],
                        yAxes: [{
                            stacked: true // this also..
                        }]
                    }
                }
            }
            let chart = new window.Chart(ctx, dataset);
            this.CHART = chart;
            this.template.querySelector('div.chart').appendChild(canvas);

        }
        catch (e) {
            console.error(e);
        }
    }
    //process data
    parseChartData(taskGroup, eventGroup) {
        let values = {};
        let labels = [];
        let datasets = [];

        labels.push(...Object.keys(taskGroup))
        labels.push(...Object.keys(eventGroup))
        labels = [...new Set(labels)];


        this.taskValues.forEach(type => {
            let dataCount = [];
            for (let date of labels) {
                const templist = taskGroup[date];
                if (templist) {
                    let tempCount = templist.reduce((sum, item) => {
                        return (item.TaskSubtype === type.value || item.Type === type.value) ? sum + 1 : sum
                    }, 0);
                    dataCount.push(tempCount);
                }
                else {
                    dataCount.push(0);
                }
            }
            datasets.push({
                label: type.value,
                backgroundColor: this.getBgColor(),
                data: dataCount
            })
        })


        this.eventValues.forEach(type => {
            let dataCount = [];
            for (let date of labels) {
                const templist = eventGroup[date];
                if (templist) {
                    let tempCount = templist.reduce((sum, item) => {
                        return (item.EventSubtype === type.value || item.Type === type.value) ? sum + 1 : sum
                    }, 0);
                    dataCount.push(tempCount);
                }
                else {
                    dataCount.push(0);
                }
            }
            datasets.push({
                label: type.value,
                backgroundColor: this.getBgColor(),
                data: dataCount
            })
        })

        values.labels = labels;
        values.datasets = datasets;


        return values;
    }
    parseTaskGroup(taskList) {
        let taskGroup = taskList.reduce((r, a) => {
            let tempMonth = this.getMonthFromDate(a.ActivityDate);
            if (this.monthFilter === tempMonth) {
                r[a.ActivityDate] = [...r[a.ActivityDate] || [], a];
            }
            else if (!this.monthFilter) {
                r[tempMonth] = [...r[tempMonth] || [], a];
            }
            return r;
        }, {});
        return taskGroup;
    }
    parseEventGroup(eventList) {
        let eventGroup = eventList.reduce((r, a) => {
            let tempMonth = this.getMonthFromDate(a.ActivityDate);
            if (this.monthFilter === tempMonth) {
                r[a.ActivityDate] = [...r[a.ActivityDate] || [], a];
            }
            else if (!this.monthFilter) {
                r[tempMonth] = [...r[tempMonth] || [], a];
            }
            return r;
        }, {});
        return eventGroup;
    }
    //filters
    onMonthFilter(event) {
        const monthFilter = event.target.value;
        this.monthFilter = monthFilter;
        console.log('monthFilter', monthFilter)
        this.filterData();
    }

    onEventFilter(event) {
        const eventType = event.target.value;
        this.eventFilter = eventType;
        console.log('eventFilter', eventType)

        this.filterData();
    }
    onTaskFilter(event) {
        const taskType = event.target.value;
        this.taskFilter = taskType;
        console.log('taskFilter', taskType)

        this.filterData();
    }
    onIndustryFilter(event) {
        const industryType = event.target.value;
        this.industryFilter = industryType;
        console.log('industryFilter', industryType)

        this.filterData();
    }
    onRatingFilter(event) {
        const ratingType = event.target.value;
        this.ratingFilter = ratingType;
        console.log('ratingFilter', ratingType)

        this.filterData();
    }
    filterData() {

        let eventList = this.eventList
        let taskList = this.taskList;
        let accountIds = []
        let iTaskList = []
        let rTaskList = []
        let rEventList = []
        if (this.ratingFilter) {
            const accountIndIdList = this.filterRatingType(this.ratingFilter)
            accountIds.push(...new Set(accountIndIdList))
        }
        if (this.industryFilter) {
            const accountRatingIdList = this.filterIndustryType(this.industryFilter)
            accountIds.push(...new Set(accountRatingIdList))
        }
        if (accountIds.length > 0) {
            eventList = eventList.filter(e => accountIds.includes(e.WhatId))
            taskList = taskList.filter(t => accountIds.includes(t.WhatId))
        }
        if (this.eventFilter)
            eventList = this.filterEventTypes(this.eventList, this.eventFilter);


        if (this.taskFilter)
            taskList = this.filterTaskTypes(this.taskList, this.taskFilter);

        let taskGroup = this.parseTaskGroup(taskList);
        let eventGroup = this.parseEventGroup(eventList);

        let values = this.parseChartData(taskGroup, eventGroup)
        console.log('values', values)

        console.log('CHART', this.CHART)
        console.log('CHART', this.CHART.data)
        this.CHART.data = values;
        this.CHART.update();


    }
    //utility
    getMonthFromDate(date) {
        let d = new Date(date);
        let month = new Array();
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
        return month[d.getMonth()];
    }
    getBgColor() {
        let x = Math.floor(Math.random() * 256);
        let y = Math.floor(Math.random() * 256);
        let z = Math.floor(Math.random() * 256);
        let bgColor = "rgb(" + x + "," + y + "," + z + ")";
        return bgColor;
    }

    filterEventTypes(eventList, option) {
        return eventList.filter(e => e.EventSubtype === option || e.Type === option);
    }
    filterTaskTypes(taskList, option) {
        return taskList.filter(e => e.TaskSubtype === option || e.Type === option);
    }

    filterIndustryType(option) {
        return this.allaccounts.filter(a => a.Industry === option).map(a => a.Id);
    }
    filterRatingType(option) {
        return this.allaccounts.filter(a => a.Finleap_Rating__c === option || a.Rating === option).map(a => a.Id);
    }

    //helper to extrack filter values
    parseEventValues(Event) {
        const eventList = Event;
        let tempEventTypes = [];
        const eventSubType = eventList
            .map(e => (e.EventSubtype) ? { label: e.EventSubtype, value: e.EventSubtype } : undefined)
            .filter(e => e !== undefined)
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);


        const eventType = eventList
            .map(e => (e.Type) ? { label: e.Type, value: e.Type } : undefined)
            .filter(e => e !== undefined)
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);

        tempEventTypes.push(...eventSubType);
        tempEventTypes.push(...eventType);

        const eventTypes = tempEventTypes.reduce((unique, item) => unique.find(t => t.label === item.label) ? unique : [...unique, item], []);
        this.eventValues = eventTypes;
    }
    parseTaskValues(Task) {
        const taskList = Task;
        let tempTaskTypes = [];
        const taskSubType = taskList
            .map(t => (t.TaskSubtype) ? { label: t.TaskSubtype, value: t.TaskSubtype } : undefined)
            .filter(t => t !== undefined)
            .reduce((unique, item) => unique.find(t => t.label === item.label) ? unique : [...unique, item], []);

        const taskType = taskList
            .map(t => (t.Type) ? { label: t.Type, value: t.Type } : undefined)
            .filter(t => t !== undefined)
            .reduce((unique, item) => unique.find(t => t.label === item.label) ? unique : [...unique, item], []);

        tempTaskTypes.push(...taskType);
        tempTaskTypes.push(...taskSubType);

        const taskTypes = tempTaskTypes.reduce((unique, item) => unique.find(t => t.label === item.label) ? unique : [...unique, item], []);
        this.taskValues = taskTypes;
    }
    parseAccountValues(Account) {
        //parsing account
        const accountList = Account;

        //Extracting only unique values from account industry as label value pair
        const industryList = accountList
            .map(a => (a.Industry) ? { label: a.Industry, value: a.Industry } : undefined)
            .filter(a => a !== undefined)
            .reduce((unique, item) => unique.find(a => a.label === item.label) ? unique : [...unique, item], []);


        //Extracting only unique values from account Rating as label value pair
        const ratingList = accountList
            .map(a => (a.Rating) ? { label: a.Rating, value: a.Rating } : undefined)
            .filter(a => a !== undefined)
            .reduce((unique, item) => unique.find(a => a.label === item.label) ? unique : [...unique, item], []);


        //Extracting only unique values from account Finleap Rating as label value pair
        const finleapRatingList = accountList
            .map(a => (a.Finleap_Rating__c) ? { label: a.Finleap_Rating__c, value: a.Finleap_Rating__c } : undefined)
            .filter(a => a !== undefined)
            .reduce((unique, item) => unique.find(a => a.label === item.label) ? unique : [...unique, item], []);
        ratingList.push(...finleapRatingList)


        this.allaccounts = accountList;
        this.industryValues = industryList;
        this.ratingValues = ratingList.reduce((unique, item) => unique.find(a => a.label === item.label) ? unique : [...unique, item], []);
    }




}