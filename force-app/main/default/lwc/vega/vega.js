import { LightningElement } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

import vegajs from '@salesforce/resourceUrl/Vegajs';
import myActivitys from '@salesforce/apex/VegaController.myactivitys'


export default class Vega extends LightningElement {

    taskList;
    eventList;

    values;

    allaccounts;
    industryValues;
    ratingValues;
    taskValues;
    monthValues;
    eventValues;


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
        loadScript(this, vegajs)
            .then(() => this.loadData());
    }

    initialize() {

        console.log('vega', vega);


        let data = []
        data.push({
            "name": "activitys",
            "values": this.values,
            "transform": [
                {
                    "type": "stack",
                    "groupby": ["x"],
                    "sort": { "field": "c" },
                    "field": "y"
                }
            ]
        })

        let signals = []
        signals.push({
            "name": "tooltip",
            "value": {},
            "on": [
                { "events": "rect:mouseover", "update": "datum" },
                { "events": "rect:mouseout", "update": "{}" }
            ]
        })

        let scales = []
        scales.push({
            "name": "x",
            "type": "band",
            "range": "width",
            "domain": { "data": "activitys", "field": "x" }
        })
        scales.push({
            "name": "y",
            "type": "linear",
            "range": "height",
            "nice": true, "zero": true,
            "domain": { "data": "activitys", "field": "y1" }
        })
        scales.push({
            "name": "color",
            "type": "ordinal",
            "range": "category",
            "domain": { "data": "activitys", "field": "c" }
        })
        let axes = [];
        axes.push({ "orient": "bottom", "scale": "x", "zindex": 1 })
        axes.push({ "orient": "left", "scale": "y", "zindex": 1 })
        let marks = [];
        marks.push({
            "type": "rect",
            "from": { "data": "activitys" },
            "encode": {
                "enter": {
                    "x": { "scale": "x", "field": "x" },
                    "width": { "scale": "x", "band": 1, "offset": -1 },
                    "y": { "scale": "y", "field": "y0" },
                    "y2": { "scale": "y", "field": "y1" },
                    "fill": { "scale": "color", "field": "c" }
                },
                "update": {
                    "fillOpacity": { "value": 1 }
                },
                "hover": {
                    "fillOpacity": { "value": 0.5 },
                }
            }
        })
        marks.push({
            "type": "text",
            "encode": {
                "update": {
                    "x": { "scale": "x", "signal": "tooltip.x", "band": 0.5 },
                    "text": { "signal": "tooltip.y" }
                }
            }
        })


        let legends = [];
        legends.push({
            "fill": "color"
        })

        let payload = {}
        payload.description = "Basic Actitvy Stack";
        payload.width = 1000
        payload.height = 500
        payload.padding = 5
        payload.data = data;
        payload.signals = signals;
        payload.scales = scales;
        payload.axes = axes;
        payload.marks = marks;
        payload.legends = legends;
        console.log('payload', payload)
        this.loadChart(payload);
    }

    loadChart(spec) {
        const container = this.template.querySelector('.vega')
        const view = new vega.View(vega.parse(spec), {
            renderer: 'canvas',  // renderer (canvas or svg)
            container: container,   // parent DOM container
            hover: true       // enable hover processing
        });
        view.runAsync();
    }

    loadData() {
        myActivitys()
            .then(result => {
                console.log(result)


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
                this.initialize();

            }).catch(error => {


            });
    }

    parseChartData(taskGroup, eventGroup) {
        let values = [];
        for (let date of Object.keys(taskGroup)) {
            this.taskValues.forEach(type => {
                const templist = taskGroup[date];
                if (templist) {
                    let tempCount = templist.reduce((sum, item) => {
                        return (item.TaskSubtype === type.value || item.Type === type.value) ? sum + 1 : sum
                    }, 0);
                    values.push({
                        x: date,
                        c: type.value,
                        y: tempCount
                    });
                }

            })
        }
        for (let date of Object.keys(eventGroup)) {
            this.eventValues.forEach(type => {
                const templist = eventGroup[date];
                if (templist) {
                    let tempCount = templist.reduce((sum, item) => {
                        return (item.EventSubtype === type.value || item.Type === type.value) ? sum + 1 : sum
                    }, 0);

                    values.push({
                        x: date,
                        c: type.value,
                        y: tempCount
                    });
                }
            })
        }

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


        this.allaccounts = accountList;
        this.industryValues = industryList;
        this.ratingValues = ratingList;
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


    onMonthFilter(event) {
        const value = event.target.value;
        this.monthFilter = value;
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
            eventList = eventList.filter(e => accountIndIdList.includes(e.WhatId))
            taskList = taskList.filter(t => accountIndIdList.includes(t.WhatId))
        }





        if (this.eventFilter)
            eventList = this.filterEventTypes(this.eventList, this.eventFilter);


        if (this.taskFilter)
            taskList = this.filterTaskTypes(this.taskList, this.taskFilter);

        let taskGroup = this.parseTaskGroup(taskList);
        let eventGroup = this.parseEventGroup(eventList);

        this.values = this.parseChartData(taskGroup, eventGroup)
        this.initialize();
    }

}