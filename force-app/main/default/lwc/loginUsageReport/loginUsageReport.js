import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

import allLoginRecords from '@salesforce/apex/UsageDashboardController.getLoginHistory';

import chartjs from '@salesforce/resourceUrl/charjs';
import charjs_treemap from '@salesforce/resourceUrl/charjs_treemap';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
const weeks = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52"];
const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
export default class LoginUsageReport extends LightningElement {
    //filter values
    periodStart
    periodEnd
    profileValues = [];
    userValues = [];
    countValues = [];
    //filter variables
    filterByPeriodStart
    filterByPeriodEnd
    filterByCount
    filterdByProfile
    filterdByUser
    filterdByMonth = false;
    filterdByWeek = false;
    //records
    records
    loginRecords
    userRecords
    //ui variables
    totalLogins
    monthButtonVarient = 'neutral';
    weekButtonVarient = 'brand-outline';
    isWeek = true;
    usageColor = 'rgb(144,173,165)';
    changesColor = 'rgb(79,112,165)';
    loading = false;
    //date variables
    today = new Date();
    month_year = [];
    month_year_apex = [];
    week_year = [];
    week_year_apex = [];
    year_month_day;
    day_week;
    //charts
    lineChart
    usageTreeChart
    pieTreeChart
    //init
    connectedCallback() {
        Promise.all([
            loadScript(this, chartjs),
            loadScript(this, charjs_treemap)
        ]);
        this.preapreDateValues();
        this.prepareDateFilterValues();
        this.fetchData();
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
        console.log('start', start);
        console.log('end', end);

        allLoginRecords({
            startDate: start,
            endDate: end
        }).then(data => {
            console.log('usage data', data);
            this.records = data;
            this.loginRecords = data.Logins
            this.userRecords = data.Users;
            this.process();
        }).catch(error => {
            console.error(error);
            this.loading = false;
        });
    }

    process() {
        this.setUserDetails();
        this.setupFilters();
        let data = this.groupByDateRange(this.loginRecords);
        this.preapreLineChart(data);
        this.prepareTreeChart(data);
        this.preparePieChart(data);
        this.loading = false;

    }
    //chart
    //Line chart
    preapreLineChart(records) {
        let usage = this.getLineChartDataset(records, 'usage');
        let labels = usage[1];
        let lineChartDataset = usage[0];



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
                    text: 'User Logins '
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

    getLineChartDataset(groupByDates) {
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

                recordCount.push(records.length);
                count += records.length;
            }
            else {
                recordCount.push(0);
            }
        }
        this.totalLogins = count;
        lineChartDataset.push({
            label: 'Logins',
            data: recordCount,
            borderColor: this.usageColor,
            fill: false
        })

        return [lineChartDataset, labels];
    }
    //treemap chart
    prepareTreeChart(loginRecords) {
        let usage = this.getTreeChartDataset(loginRecords, 'usage');
        if (this.countValues.length < 1) {
            let range = [...new Set(usage.map(r => r.num))];
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
                    text: 'User Login  By Concentration'
                }
            }
        }
        if (this.usageTreeChart) {
            this.usageTreeChart.data.datasets[0].tree = usage;
            this.usageTreeChart.update();
        }
        else {
            this.usageTreeChart = this.createChart('treeUsageChart', usageTreeChartJSON);
        }

    }

    getTreeChartDataset(usageRcords) {
        let groupByRecord = this.groupByUser(Object.values(usageRcords).flat(Infinity));

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
                        tag: (records[0].User) ? records[0].User.Name : records[0].UserId,
                        num: records.length
                    });
            }
            else {
                if (records && records.length > 0) {
                    treeChartDataset.push({
                        tag: (records[0].User) ? records[0].User.Name : records[0].UserId,
                        num: records.length
                    });
                }
            }

        }



        return treeChartDataset;

    }

    //pie chart
    preparePieChart(loginRecords, type) {
        let data = this.groupByBrowser(Object.values(loginRecords).flat(Infinity));
        let labels = []
        let values = [];
        let color = [];
        for (let key of Object.keys(data)) {
            let records = data[key]
            if (records.length > 0) {
                if (this.filterdByProfile) {
                    records = this.filterRecordByProfileId(records);
                }
                if (this.filterdByUser) {
                    records = this.filterRecordByUserId(records);
                }

                labels.push(key);
                values.push(records.length);
                color.push(this.getBgColor());
            }

        }

        let dataset = [{
            label: "Logins by browser type.",
            backgroundColor: color,
            data: values
        }]
        let chartDatadata = {
            labels: labels,
            datasets: dataset
        }
        let pieChartJSON = {
            type: 'pie',
            data: chartDatadata,
            options: {
                title: {
                    display: true,
                    text: 'Browser usage'
                },
                legend: {
                    display: false
                }

            }
        }
        if (this.pieTreeChart) {

            this.pieTreeChart.data = chartDatadata;
            this.pieTreeChart.update();
        }
        else {
            this.pieTreeChart = this.createChart('pieUsageChart', pieChartJSON);
        }
    }

    //date helper
    preapreDateValues() {
        let pastYearMonths = new Date();
        pastYearMonths.setMonth(this.today.getMonth() - 12);
        for (let i = 0, j = 13; i < j; i++) {
            this.month_year.push(this.getMonthNameFromDate(pastYearMonths) + ' - ' + pastYearMonths.getFullYear());

            let firstDay = new Date(pastYearMonths.getFullYear(), pastYearMonths.getMonth(), 1);

            this.month_year_apex.push(firstDay);
            //incement by one month
            pastYearMonths.setMonth(pastYearMonths.getMonth() + 1);
        }
        let pastYearWeeks = new Date();
        pastYearWeeks.setMonth(this.today.getMonth() - 12);
        const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
        for (let i = 0, j = 53; i < j; i++) {
            this.week_year.push(this.getWeekFromDate(pastYearWeeks) + ' - ' + pastYearWeeks.getFullYear());

            this.week_year_apex.push(this.getMonday(pastYearWeeks));
            //incement by one week
            pastYearWeeks.setTime(this.getMonday(pastYearWeeks).getTime() + weekInMilliseconds);
        }
        console.log('this.week_year', this.week_year)
        console.log('this.month_year', this.month_year)


    }

    prepareDateFilterValues() {
        if (this.isWeek) {
            let weeks = this.week_year.map((w, i) => {
                return { label: w, value: i }
            });
            this.periodStart = weeks
            this.periodEnd = weeks

            this.filterByPeriodStart = 47;
            this.filterByPeriodEnd = 52;

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
    //record processing helper
    setUserDetails() {
        let userMap = this.userRecords.reduce((r, a) => {
            r[a.Id] = [...r[a.Id] || [], a];
            return r;
        }, {});
        this.loginRecords = this.loginRecords.map(u => {

            if (userMap[u.UserId] && userMap[u.UserId].length > 0) {
                let userDetails = userMap[u.UserId][0];
                u.User = userDetails;
                u.ProfileId = userDetails.ProfileId;
            }

            return u;
        })
    }
    //filter helper
    setupFilters() {
        if (this.profileValues.length > 0 && this.userValues.length > 0) return;
        let userNames = this.userRecords
            .map(r => {
                return {
                    label: (r.Name) ? r.Name : '',
                    value: (r.Id) ? r.Id : '',
                    profileId: (r.ProfileId) ? r.ProfileId : '',
                    isVisible: true
                }
            })
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);

        let profilesNames = this.userRecords.map(r => {
            return {
                label: (r.Profile) ? r.Profile.Name : '',
                value: (r.ProfileId) ? r.ProfileId : ''
            }
        })
            .reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);


        this.profileValues = profilesNames.sort((a, b) => (a.label > b.label) ? 1 : -1);
        this.userValues = userNames.sort((a, b) => (a.label > b.label) ? 1 : -1);
    }
    filterRecordByUserId(list) {
        return list.filter(r => r.UserId == this.filterdByUser);
    }
    filterRecordByProfileId(list) {
        return list.filter(r => r.ProfileId == this.filterdByProfile);
    }
    //group utility
    groupByDateRange(list) {
        let isWeekView = this.isWeek;
        let startCount = this.filterByPeriodStart;
        let endCount = this.filterByPeriodEnd;
        return list.reduce((r, a) => {
            let d = new Date(a.LoginTime);
            let tempYear = d.getFullYear();
            let tempDay = d.getDate();
            let tempDate = d.getDay();
            let tempMonth = d.getMonth();
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
    groupByUser(list) {
        return list.reduce((r, a) => {
            r[a.UserId] = [...r[a.UserId] || [], a]
            return r;
        }, {});
    }
    groupByBrowser(list) {
        return list.reduce((r, a) => {
            let key = a.Browser;
            if (key == 'Unknown') key = a.LoginType;
            r[key] = [...r[key] || [], a]
            return r;
        }, {});
    }
    //filter handlers
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
        this.filterByCount = count;
        let data = this.groupByDateRange(this.loginRecords);
        this.prepareTreeChart(data);
    }
    //handler
    onMonthView() {
        this.isWeek = false;
        this.filterdByMonth = true;
        this.filterdByWeek = false;
        this.monthButtonVarient = 'brand-outline';
        this.weekButtonVarient = 'neutral';
        this.prepareDateFilterValues();
        this.fetchData();
    }
    onWeekView() {
        this.isWeek = true;
        this.filterdByMonth = false;
        this.filterdByWeek = false;
        this.weekButtonVarient = 'brand-outline';
        this.monthButtonVarient = 'neutral';
        this.prepareDateFilterValues();
        this.fetchData();
    }
    onResetFilters() {
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

}