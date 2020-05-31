import { LightningElement } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

import chartjs from '@salesforce/resourceUrl/charjs';
import myActivitys from '@salesforce/apex/VegaController.myactivitys'
export default class Chart extends LightningElement {
    STACKCHART;
    RADARCHART;

    values;
    values2;

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

    radarMaxValue = 0;

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
            .then(() => this.loadData());
    }
    loadData() {
        myActivitys()
            .then(result => {
                console.log('result', result)

                //combain types
                const taskList = result.Task;
                taskList.forEach(t => {
                    if (!t.Type) {
                        t.Type = t.TaskSubtype;
                    }
                })
                const eventList = result.Event;
                eventList.forEach(e => {
                    if (!e.Type) {
                        e.Type = e.EventSubtype;
                    }
                })

                this.taskList = taskList;
                this.eventList = eventList;


                //get filter picklist vlaues
                this.eventValues = this.parseValues(eventList);
                this.eventValues.push({
                    label: 'None',
                    value: 'None'
                })
                this.taskValues = this.parseValues(taskList);
                this.taskValues.push({
                    label: 'None',
                    value: 'None'
                })

                const accountList = result.Account;
                this.parseAccountValues(accountList);

                //Group activity by month
                let taskGroup = this.praseGroups(taskList);
                let eventGroup = this.praseGroups(eventList);



                //create chart data
                this.values = this.parseChartData(taskGroup, eventGroup);
                this.values2 = this.parseChartDataRadar(taskGroup, eventGroup);
                this.loadChart();
                this.loadRadarChart();

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
            let chart = new window.Chart(ctx, dataset);
            this.STACKCHART = chart;
            this.template.querySelector('div.chart').appendChild(canvas);

        }
        catch (e) {
            console.error(e);
        }
    }
    loadRadarChart(spec) {
        try {
            // disable Chart.js CSS injection
            //window.Chart.platform.disableCSSInjection = true;

            const canvas = document.createElement('canvas');
            //canvas.style.height = '50%';
            //canvas.style.width = '50%';

            const ctx = canvas.getContext('2d');


            const dataset = {
                type: 'radar',
                data: this.values2,
                options: {
                    responsive: true,
                    legend: {
                        position: 'right' // place legend on the right side of chart
                    },
                    scale: {
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: this.radarMaxValue,
                            stepSize: 20
                        }
                    }
                }
            }

            let chart = new window.Chart(ctx, dataset);
            this.RADARCHART = chart;
            this.template.querySelector('div.radar').appendChild(canvas);

        }
        catch (e) {
            console.error(e);
        }
    }

    parseChartDataRadar(taskGroup, eventGroup) {
        this.radarMaxValue = 0;
        let values = {};
        let labels = this.industryValues.map(i => i.value);
        let datasets = [];

        //get all tasks
        let taskList = Object.values(taskGroup).flat(Infinity);
        // get all events
        let eventList = Object.values(eventGroup).flat(Infinity);

        this.taskValues.forEach(type => {
            if (type.value !== 'None') {
                let industryData = [];
                for (let industry of labels) {
                    //get accountId of all industry
                    const industryAccountId = this.filterIndustryType(industry);
                    //get all task of cusrent type
                    const taskTypeList = this.filterTypes(taskList, type.value);
                    //get all industry tasks 
                    const industryTasks = taskTypeList.filter(t => industryAccountId.includes(t.WhatId))
                    industryData.push(industryTasks.length);
                    if (this.radarMaxValue < industryTasks.length) {
                        this.radarMaxValue = industryTasks.length + 10;
                    }

                }

                let t = industryData.reduce((a, b) => a + b, 0);
                if (t > 0) {
                    datasets.push({
                        label: type.value,
                        backgroundColor: "transparent",
                        borderColor: this.getBgColor(),
                        data: industryData,
                        fill: false
                    })
                }

            }
        });




        this.eventValues.forEach(type => {
            if (type.value !== 'None') {
                let industryData = [];
                for (let industry of labels) {
                    //get accountId of all industry
                    const industryAccountId = this.filterIndustryType(industry);
                    //get all task of cusrent type
                    const eventTypeList = this.filterTypes(eventList, type.value);
                    //get all industry tasks 
                    const industryevents = eventTypeList.filter(t => industryAccountId.includes(t.WhatId))
                    industryData.push(industryevents.length);
                    if (this.radarMaxValue < industryevents.length) {
                        this.radarMaxValue = industryevents.length + 10;
                    }
                }
                let t = industryData.reduce((a, b) => a + b, 0);
                if (t > 0) {
                    datasets.push({
                        label: type.value,
                        backgroundColor: "transparent",
                        borderColor: this.getBgColor(),
                        data: industryData,
                        fill: false
                    })
                }

            }

        })

        values.labels = labels;
        values.datasets = datasets;


        return values;
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
            if (type.value !== 'None') {
                let dataCount = [];
                for (let date of labels) {
                    const templist = taskGroup[date];
                    if (templist) {
                        let tempCount = templist.reduce((sum, item) => {
                            return (item.Type === type.value) ? sum + 1 : sum
                        }, 0);
                        dataCount.push(tempCount);
                    }
                    else {
                        dataCount.push(0);
                    }
                }

                let t = dataCount.reduce((a, b) => a + b, 0);
                if (t > 0) {
                    datasets.push({
                        label: type.value,
                        backgroundColor: this.getBgColor(),
                        data: dataCount
                    })
                }
            }

        })


        this.eventValues.forEach(type => {
            if (type.value !== 'None') {
                let dataCount = [];
                for (let date of labels) {
                    const templist = eventGroup[date];
                    if (templist) {
                        let tempCount = templist.reduce((sum, item) => {
                            return (item.Type === type.value) ? sum + 1 : sum
                        }, 0);
                        dataCount.push(tempCount);
                    }
                    else {
                        dataCount.push(0);
                    }
                }
                let t = dataCount.reduce((a, b) => a + b, 0);
                if (t > 0) {
                    datasets.push({
                        label: type.value,
                        backgroundColor: this.getBgColor(),
                        data: dataCount
                    })
                }
            }
        })

        values.labels = labels;
        values.datasets = datasets;


        return values;
    }

    praseGroups(list) {
        return list.reduce((r, a) => {
            let tempMonth = this.getMonthFromDate(a.ActivityDate);
            if (this.monthFilter === tempMonth) {
                r[a.ActivityDate] = [...r[a.ActivityDate] || [], a];
            }
            else if (!this.monthFilter) {
                r[tempMonth] = [...r[tempMonth] || [], a];
            }
            return r;
        }, {});
    }

    //filters
    onMonthFilter(event) {
        const monthFilter = event.target.value;
        this.monthFilter = monthFilter;
        this.filterData();
    }

    onEventFilter(event) {
        const eventType = event.target.value;
        this.eventFilter = eventType;

        this.filterData();
    }
    onTaskFilter(event) {
        const taskType = event.target.value;
        this.taskFilter = taskType;

        this.filterData();
    }
    onIndustryFilter(event) {
        const industryType = event.target.value;
        this.industryFilter = industryType;

        this.filterData();
    }
    onRatingFilter(event) {
        const ratingType = event.target.value;
        this.ratingFilter = ratingType;

        this.filterData();
    }
    filterData() {

        let eventList = this.eventList
        let taskList = this.taskList;
        let accountIds = []
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
            eventList = this.filterTypes(eventList, this.eventFilter);


        if (this.taskFilter)
            taskList = this.filterTypes(taskList, this.taskFilter);

        let taskGroup = this.praseGroups(taskList);
        let eventGroup = this.praseGroups(eventList);

        let values = this.parseChartData(taskGroup, eventGroup)
        let values2 = this.parseChartDataRadar(taskGroup, eventGroup)

        this.STACKCHART.data = values;
        this.STACKCHART.update();
        this.RADARCHART.data = values2;
        this.RADARCHART.options.scale.ticks.max = this.radarMaxValue;
        this.RADARCHART.update();


    }
    //utility
    getMonthFromDate(date) {
        let d = new Date(date);
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
        return month[d.getMonth()];
    }
    getBgColor() {
        let x = Math.floor(Math.random() * 256);
        let y = Math.floor(Math.random() * 256);
        let z = Math.floor(Math.random() * 256);
        return "rgb(" + x + "," + y + "," + z + ")";
    }

    filterTypes(list, option) {
        return list.filter(e => e.Type === option);
    }

    filterIndustryType(option) {
        return this.allaccounts.filter(a => a.Industry === option).map(a => a.Id);
    }
    filterRatingType(option) {
        return this.allaccounts.filter(a => a.Finleap_Rating__c === option || a.Rating === option).map(a => a.Id);
    }

    //helper to extrack filter values
    parseValues(list) {
        return list.map(e => (e.Type) ? { label: e.Type, value: e.Type } : undefined)
            .filter(e => e !== undefined)
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);

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


={
    type: "line",
        data: {
        labels: [],
            datasets: [],
                options: []
    }
}

}