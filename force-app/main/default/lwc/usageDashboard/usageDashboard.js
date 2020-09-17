import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

import allRecords from '@salesforce/apex/UsageDashboardController.fetchAllTrackingRecords';
import allWeeks from '@salesforce/apex/UsageDashboardController.getPastYearWeeks';

import chartjs from '@salesforce/resourceUrl/charjs';
import charjs_treemap from '@salesforce/resourceUrl/charjs_treemap';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
const weeks = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52"];
const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
export default class UsageDashboard extends LightningElement {
    //filter values
    periodStart = [];
    periodEnd = [];
    profileValues = [];
    userValues = [];
    countValues = [];
    //filter variables
    filterByPeriodStart;
    filterByPeriodEnd;
    filterdByWeek;
    filterdByMonth;
    filterdByProfile;
    filterdByUser;
    filterByCount;
    //ui variables
    totalUsage = 0;
    totalChanges = 0;
    loading = false
    runbuttonVarient = 'brand';
    monthButtonVarient = 'neutral';
    weekButtonVarient = 'brand-outline';
    isWeek = true;
    //record variables
    records;
    changeRecords;
    usageGroup;
    //helper variables
    usageColor = 'rgb(144,173,165)';
    changesColor = 'rgb(79,112,165)';
    //date variables
    today = new Date();
    month_year = [];
    month_year_apex = [];
    week_year = [];
    week_year_apex = [];
    year_month_day;
    day_week;
    //init
    connectedCallback() {
        Promise.all([
            loadScript(this, chartjs),
            loadScript(this, charjs_treemap)
        ]);

        this.fetchDates();

    }
    fetchDates() {

        allWeeks().then(dates => {
            this.preapreDateValues(dates);
            this.prepareDateFilterValues();
            this.fetchData();
        }).catch(error => {
            console.error(error);

        });

    }

    fetchData() {
        this.loading = true;
        let start;
        let end;
        const weekInMilliseconds = 6 * 24 * 60 * 60 * 1000;
        if (this.isWeek) {
            let startDate = this.week_year_apex[this.filterByPeriodStart];
            let endDate = this.week_year_apex[this.filterByPeriodEnd];
            endDate = new Date(endDate.getTime() + weekInMilliseconds);//increment to week end date
            start = (startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' + startDate.getFullYear()
            end = (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' + endDate.getFullYear()

        }
        else {
            let startDate = this.month_year_apex[this.filterByPeriodStart];
            let endDate = this.month_year_apex[this.filterByPeriodEnd];
            endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);//increment to month end date
            start = (startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' + startDate.getFullYear()
            end = (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' + endDate.getFullYear()
        }

        allRecords({
            startDate: start,
            endDate: end
        }).then(data => {
            this.records = data;

            this.process();
        }).catch(error => {
            console.error(error);
            this.loading = false;
        });
    }

    process() {
        let changeTrackingRecords = this.records.filter(r => r.RecordType.Name === 'Field History');
        let usageTrackingRecords = this.records.filter(r => r.RecordType.Name === 'Usage Tracker');
        this.changeRecords = changeTrackingRecords;
        this.usageRecords = usageTrackingRecords;
        let changeGroup = this.groupByDateRange(this.changeRecords);
        let usageGroup = this.groupByDateRange(this.usageRecords);
        this.setupFilters(usageTrackingRecords, changeTrackingRecords)
        this.preapreLineChart(usageGroup, changeGroup);
        this.pepareBubbleChart(usageGroup, changeGroup);
        this.prepareTreeChart(usageGroup, changeGroup);
        this.loading = false;
    }
    //charts
    //Point size Chart
    pepareBubbleChart(usageTrackingRecords, changeTrackingRecords, type) {
        let changeDataset = this.getBubbleChartDataset(usageTrackingRecords, changeTrackingRecords);
        let [max, min] = this.getMinAndMax(changeDataset[0]);
        let data = {
            labels: changeDataset[1],
            datasets: changeDataset[0]
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
                            labelString: "Edits "
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

                            return dataset.label + ' : Views=' + obj.y + ', Edits=' + obj.x;
                        }
                    }
                }

            }
        }
        if (this.bubbleChart) {
            this.bubbleChart.data = data;
            this.bubbleChart.update();

        }
        else {
            this.bubbleChart = this.createChart('bubbleChart', bubbleChartJSON);
        }
    }
    getBubbleChartDataset(usageTrackingRecords, changeTrackingRecords) {
        let usageGroupByDates = usageTrackingRecords;
        let changeGroupByDates = changeTrackingRecords;

        let usageByUsers = this.groupByUsers(Object.values(usageGroupByDates).flat(Infinity));
        let changesByUsers = this.groupByUsers(Object.values(changeGroupByDates).flat(Infinity));
        let lineChartDataset = [];
        let edits = [];
        let views = [];

        if (!this.filterdByUser) {
            for (let changeUser of Object.keys(changesByUsers)) {


                //x=Edits
                //y=Views
                let tempChanges = changesByUsers[changeUser];
                let tempUsage = usageByUsers[changeUser];
                let tempx = 0;
                let tempy = 0;
                let tempName = '';
                let tempProfileId = '';

                if (tempChanges && tempChanges.length > 0) {
                    tempx = tempChanges.length;
                    tempName = (tempChanges[0].User__r) ? tempChanges[0].User__r.Name : '';
                    tempProfileId = (tempChanges[0].User__r) ? tempChanges[0].User__r.ProfileId : '';
                    edits.push(tempx);
                }
                if (tempUsage && tempUsage.length > 0) {
                    tempy = tempUsage.length;
                    tempName = (tempUsage[0].User__r) ? tempUsage[0].User__r.Name : '';
                    tempProfileId = (tempUsage[0].User__r) ? tempUsage[0].User__r.ProfileId : '';

                    views.push(tempy)
                }

                if (this.filterdByProfile) {
                    if (tempProfileId != this.filterdByProfile) {
                        tempx = 0;
                        tempy = 0;
                    }
                }

                if (tempx || tempy) {
                    let tempr = tempx + tempy;
                    lineChartDataset.push({
                        label: tempName,
                        data: [{
                            x: tempx,
                            y: tempy,
                            r: tempr
                        }],
                        backgroundColor: this.getBgColor(),
                        borderColor: this.getBgColor(),
                    })
                }

            }
        }
        else {
            //x=Edits
            //y=Views
            let tempChanges = changesByUsers[this.filterdByUser];
            let tempUsage = usageByUsers[this.filterdByUser];
            let tempx = 0;
            let tempy = 0;
            let tempName = '';

            if (tempChanges && tempChanges.length > 0) {
                tempx = tempChanges.length;
                tempName = (tempChanges[0].User__r) ? tempChanges[0].User__r.Name : '';
                edits.push(tempx);
            }
            if (tempUsage && tempUsage.length > 0) {
                tempy = tempUsage.length;
                tempName = (tempUsage[0].User__r) ? tempUsage[0].User__r.Name : '';
                views.push(tempy)
            }
            if (this.filterdByProfile) {
                if (tempUsage[0].User__r && tempUsage[0].User__r.ProfileId != this.filterdByProfile) {
                    tempx = 0;
                    tempy = 0;
                }
            }


            if (tempx || tempy) {
                let tempr = tempx + tempy;
                lineChartDataset.push({
                    label: tempName,
                    data: [{
                        x: tempx,
                        y: tempy,
                        r: tempr
                    }],
                    backgroundColor: this.getBgColor(),
                    borderColor: this.getBgColor(),
                })
            }

        }


        edits = [...new Set(edits)];

        return [lineChartDataset, edits];

    }

    //Line chart
    preapreLineChart(usageTrackingRecords, changeTrackingRecords, type) {
        let usage = this.getLineChartDataset(usageTrackingRecords, 'usage');
        let change = this.getLineChartDataset(changeTrackingRecords, 'changes');
        let labels = [...usage[1]];
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
                    text: 'Record Views and Changes Timeline'
                }

            }
        }

        if (this.lineChart) {
            this.lineChart.data = data;
            this.lineChart.update();

        }
        else {
            this.lineChart = this.createChart('lineChart', lineChartJSON);
        }
    }

    getLineChartDataset(trackingRecords, type) {
        let groupByDates = trackingRecords;
        let labels = this.getLabel();
        let lineChartDataset = [];
        let recordCount = [];
        let count = 0;
        for (let key of labels) {
            if (groupByDates[key] && groupByDates[key].length > 0) {
                let records = groupByDates[key];
                if (this.filterdByProfile) {
                    records = this.filterRecordByProfileId(records);
                }
                if (this.filterdByUser) {
                    records = this.filterRecordByUserId(records);
                }
                count += records.length;
                recordCount.push(records.length);
            }
            else {
                recordCount.push(0);
            }
        }
        if (type === 'usage') {
            this.totalUsage = count;
        }
        else if (type === 'changes') {
            this.totalChanges = count;
        }
        lineChartDataset.push({
            label: (type == 'usage') ? 'Views' : 'Changes',
            data: recordCount,
            borderColor: (type == 'usage') ? this.usageColor : this.changesColor,
            fill: false
        })

        return [lineChartDataset, labels];
    }

    //treemap chart
    prepareTreeChart(usageTrackingRecords, changeTrackingRecords, type) {
        let usage = this.getTreeChartDataset(usageTrackingRecords, 'usage');
        let change = this.getTreeChartDataset(changeTrackingRecords, 'change');
        if (this.countValues.length < 1) {
            let range = [...new Set([...usage, ...change].map(r => r.num))];
            this.countValues = range.sort((a, b) => a - b);
        }
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
        if (this.usageTreeChart && this.changesTreeChart) {

            this.usageTreeChart.data.datasets[0].tree = usage;
            this.usageTreeChart.update();
            this.changesTreeChart.data.datasets[0].tree = change;
            this.changesTreeChart.update();


        }
        else {
            this.usageTreeChart = this.createChart('treeUsageChart', usageTreeChartJSON);
            this.changesTreeChart = this.createChart('treeChangeChart', changeTreeChartJSON);
        }

    }

    getTreeChartDataset(trackingRecords, type) {
        let groupByRecord = this.groupByRecord(Object.values(trackingRecords).flat(Infinity));
        let treeChartDataset = [];
        for (let recordId of Object.keys(groupByRecord)) {
            let records = groupByRecord[recordId]
            if (this.filterdByProfile) {
                records = this.filterRecordByProfileId(records);
            }
            if (this.filterdByUser) {
                records = this.filterRecordByUserId(records);
            }

            if (this.filterByCount) {
                if (records && this.filterByCount <= records.length)
                    treeChartDataset.push({
                        tag: records[0].Object_Label__c + ' : ' + records[0].Record_Name__c,
                        num: records.length
                    });
            }
            else {
                if (records && records.length > 0) {
                    treeChartDataset.push({
                        tag: records[0].Object_Label__c + ' : ' + records[0].Record_Name__c,
                        num: records.length
                    });
                }
            }

        }



        return treeChartDataset;

    }

    //filter helper
    setupFilters(usageTrackingRecords, changeTrackingRecords) {
        if (this.profileValues.length > 0 && this.userValues.length > 0) return;
        let trackUsageName = usageTrackingRecords
            .map(r => {
                return {
                    label: (r.User__r) ? r.User__r.Name : '',
                    value: (r.User__c) ? r.User__c : '',
                    profileId: (r.User__c) ? r.User__r.ProfileId : '',
                    isVisible: true
                }
            })
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);
        let trackChangeName = changeTrackingRecords
            .map(r => {
                return {
                    label: (r.User__r) ? r.User__r.Name : '',
                    value: (r.User__c) ? r.User__c : '',
                    profileId: (r.User__c) ? r.User__r.ProfileId : '',
                    isVisible: true
                }
            })
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);
        let userNames = [...trackUsageName, ...trackChangeName]
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);

        let trackUsageProfiles = usageTrackingRecords.map(r => {
            return {
                label: (r.User__r) ? r.User__r.Profile.Name : '',
                value: (r.User__c) ? r.User__r.ProfileId : ''
            }
        })
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);

        let trackChangeProfile = changeTrackingRecords
            .map(r => {
                return {
                    label: (r.User__r) ? r.User__r.Profile.Name : '',
                    value: (r.User__c) ? r.User__r.ProfileId : ''
                }
            })
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);
        let profileNames = [...trackUsageProfiles, ...trackChangeProfile]
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);

        this.profileValues = profileNames.sort((a, b) => (a.label > b.label) ? 1 : -1);
        this.userValues = userNames.sort((a, b) => (a.label > b.label) ? 1 : -1);
    }
    filterRecordByUserId(list) {
        return list.filter(r => r.User__c == this.filterdByUser);
    }
    filterRecordByProfileId(list) {
        return list.filter(r => {
            if (r.User__r) {
                return r.User__r.ProfileId == this.filterdByProfile
            }
        });
    }


    //date helper
    preapreDateValues(weeks) {
        let pastYearMonths = new Date();
        pastYearMonths.setMonth(this.today.getMonth() - 12);
        for (let i = 0, j = 13; i < j; i++) {
            this.month_year.push(this.getMonthNameFromDate(pastYearMonths) + ' - ' + pastYearMonths.getFullYear());

            let firstDay = new Date(pastYearMonths.getFullYear(), pastYearMonths.getMonth(), 1);

            this.month_year_apex.push(firstDay);
            //incement by one month
            pastYearMonths.setMonth(pastYearMonths.getMonth() + 1);
        }

        for (let i = 0, j = weeks.length; i < j; i++) {
            let d = new Date(weeks[i]);

            this.week_year.push(this.getWeekFromDate(d) + ' - ' + d.getFullYear());
            this.week_year_apex.push(d);


        }




    }
    prepareDateFilterValues() {
        if (this.isWeek) {
            let weeks = this.week_year.map((w, i) => {
                return { label: w, value: i }
            });
            this.periodStart = weeks
            this.periodEnd = weeks

            this.filterByPeriodStart = 47;
            this.filterByPeriodEnd = 53;

        }
        else if (!this.isWeek) {
            let years = this.month_year.map((y, i) => {
                return { label: y, value: i }
            });
            this.prepareMonthDays(...this.month_year[12].split('-'));
            this.periodStart = years;
            this.periodEnd = years;

            this.filterByPeriodStart = 12;
            this.filterByPeriodEnd = 12;


            this.filterdByMonth = true;

        }
    }
    prepareMonthDays(tempMonth, tempYear) {
        // format = d.getFullYear() + '-' + tempMonth + '-' + d.getDate();
        this.year_month_day = [];
        for (let dayNumber of days) {
            this.year_month_day.push(tempYear.trim() + '-' + tempMonth.trim() + '-' + dayNumber);
        }
    }

    prepareWeekDays(week) {
        // format = weekDays[d.getDay()] + '-' + tempWeek;
        this.day_week = [];
        for (let dayName of weekDays) {
            this.day_week.push(dayName + '-' + week.trim());
        }
    }
    getMonthNameFromDate(date) {
        return months[date.getMonth()];
    }
    getWeekFromDate(date) {
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
            - 3 + (week1.getDay() + 6) % 7) / 7);
    }
    getMonday(d) {
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }
    //group utitly
    groupByDateRange(list) {
        let isWeekView = this.isWeek;
        let startCount = this.filterByPeriodStart;
        let endCount = this.filterByPeriodEnd;
        return list.reduce((r, a) => {
            let d = new Date(a.CreatedDate);
            let tempYear = d.getFullYear();
            let tempDay = d.getDate();
            let tempDate = d.getDay();

            let tempMonthName = this.getMonthNameFromDate(d);
            let tempWeek = this.getWeekFromDate(d);

            let dateString = tempYear + '-' + tempMonthName + '-' + tempDay;
            let weekDayString = weekDays[tempDate].trim() + '-' + tempWeek;

            let weekString = tempWeek + ' - ' + tempYear;
            let yearString = tempMonthName + ' - ' + tempYear;


            let tempMonthCount = this.month_year.indexOf(yearString);
            let tempWeekCount = this.week_year.indexOf(weekString);

            if (isWeekView) {
                if (this.filterdByWeek) {
                    if (startCount === tempWeekCount) {
                        //week
                        r[weekDayString] = [...r[weekDayString] || [], a];
                    }
                }
                else if (tempWeekCount >= startCount && tempWeekCount <= endCount) {
                    //weeks

                    r[weekString] = [...r[weekString] || [], a];
                }

            }
            else if (!isWeekView) {
                if (this.filterdByMonth) {
                    if (startCount === tempMonthCount) {
                        //month

                        r[dateString] = [...r[dateString] || [], a];
                    }
                }
                else {
                    if (tempMonthCount >= startCount && tempMonthCount <= endCount) {
                        //year

                        r[yearString] = [...r[yearString] || [], a];
                    }
                }

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
    getLabel() {
        let startCount = this.filterByPeriodStart;
        let endCount = this.filterByPeriodEnd;
        if (this.filterdByMonth) {
            return this.year_month_day;
            //month filter
        }
        else if (this.filterdByWeek) {
            return this.day_week;
        }
        else if (this.isWeek) {
            return this.week_year.slice(startCount, endCount + 1);
            //week view
        }
        else {
            return this.month_year.slice(startCount, endCount + 1);
            //year view
        }
    }
    //filters
    onResetFilters(event) {
        //onclick of reset button
        this.filterdByUser = '';
        this.filterdByProfile = '';
        this.template.querySelector('select.userProfile').value = '';
        this.template.querySelector('select.userValues').value = '';
        if (this.filterdByProfile) {
            this.userValues = this.userValues.map(value => {
                if (value.profileId == this.filterdByProfile) {
                    value.isVisible = true;
                }
                else {
                    value.isVisible = false;
                }
                return value;
            })
        }
        else {
            this.userValues = this.userValues.map(value => {
                value.isVisible = true;
                return value;
            })
        }

        if (this.isWeek) {
            this.onWeekView();
        }
        else {

            this.onMonthView();
        }
    }

    onPeriodStartFilter(event) {
        //on change of start filter
        let count = event.detail.value;
        if (typeof count === 'string') count = parseInt(count)
        if (count > this.filterByPeriodEnd) {
            this.showNotification('Invalid Start Period', 'Start cannot be greater then End', 'warning');
            this.filterByPeriodStart = this.filterByPeriodEnd - 1;
            return;
        }
        if (!this.isWeek && this.filterByPeriodEnd == count) {
            //filter by month
            this.filterdByMonth = true;
            this.prepareMonthDays(...this.month_year[count].split('-'));

        }
        else if (this.isWeek && this.filterByPeriodEnd == count) {
            //filter by week
            this.filterdByWeek = true;
            this.prepareWeekDays(...this.week_year[count].split('-'));
        }
        else {
            this.filterdByMonth = false;
            this.filterdByWeek = false;
        }
        this.filterByPeriodStart = count;
        this.fetchData();
    }
    onPeriodEndFilter(event) {
        //on change of end filter
        let count = event.detail.value;
        if (typeof count === 'string') count = parseInt(count)

        if (count < this.filterByPeriodStart) {
            this.showNotification('Invalid End Period', 'End cannot be greater then Start', 'warning');
            this.filterByPeriodEnd = this.filterByPeriodStart + 1;
            return;
        }
        if (!this.isWeek && this.filterByPeriodStart == count) {
            //filter by month
            this.filterdByMonth = true;
            this.prepareMonthDays(...this.month_year[count].split('-'));
        }
        else if (this.isWeek && this.filterByPeriodStart == count) {
            //filter by week
            this.filterdByWeek = true;
            this.prepareWeekDays(...this.week_year[count].split('-'));
        }
        else {
            this.filterdByMonth = false;
            this.filterdByWeek = false;
        }
        this.filterByPeriodEnd = count;
        this.fetchData()
    }
    onProfileFilter(event) {
        //on change of profile filter
        const profId = event.target.value;
        this.filterdByProfile = profId;
        this.filterdByUser = '';
        this.process();
        if (this.filterdByProfile) {
            this.userValues = this.userValues.map(value => {
                if (value.profileId == this.filterdByProfile) {
                    value.isVisible = true;
                }
                else {
                    value.isVisible = false;
                }
                return value;
            })
        }
        else {
            this.userValues = this.userValues.map(value => {
                value.isVisible = true;
                return value;
            })
        }
    }

    onUserFilter(event) {
        //on change of user filter
        const userId = event.target.value;
        this.filterdByUser = userId;
        this.process();
    }
    onCountFilter(event) {
        //on change of count filter
        const count = event.target.value;
        this.filterByCount = count;
        let changeGroup = this.groupByDateRange(this.changeRecords);
        let usageGroup = this.groupByDateRange(this.usageRecords);
        this.prepareTreeChart(usageGroup, changeGroup);
    }
    //handlers
    onMonthView() {
        //on selection of month view
        this.isWeek = false;
        this.filterdByMonth = true;
        this.filterdByWeek = false;
        this.monthButtonVarient = 'brand-outline';
        this.weekButtonVarient = 'neutral';
        this.prepareDateFilterValues();
        this.fetchData();

    }
    onWeekView() {
        //on selection of week view
        this.isWeek = true;
        this.filterdByMonth = false;
        this.filterdByWeek = false;
        this.weekButtonVarient = 'brand-outline';
        this.monthButtonVarient = 'neutral';
        this.prepareDateFilterValues();
        this.fetchData();
    }

    //utiltiy
    showNotification(title, msg, varient) {
        const evt = new ShowToastEvent({
            title: title,
            message: msg,
            variant: varient
        });
        this.dispatchEvent(evt);
    }

    scale(value, max, min) {

        let from = [min - 1, max + 1];
        let to = [5, 90];
        let scale = (to[1] - to[0]) / (from[1] - from[0]);
        let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
        return ~~(capped * scale + to[0]);
    }
    getMinAndMax(list) {
        let nums = list.map(l => l.data[0].r);
        return [Math.max(...nums), Math.min(...nums)];
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