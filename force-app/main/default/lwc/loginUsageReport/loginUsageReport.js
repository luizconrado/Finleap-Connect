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
    //https://finleap-connect--partial.lightning.force.com/lightning/n/Usage_Dashboard
    //days
    month_year = [];
    year_month_day = [];
    week_year = [];
    day_week = [];
    //filter values
    monthValues = months
    periodStart;
    periodEnd;
    userValues;
    profileValues;
    countValues = [];
    //filters
    filterdByMonth = false;
    filterdByWeek = false;
    filterdByUser;
    filterdByProfile;
    filterByCount;

    filterByPeriodStart;
    filterByPeriodEnd;
    //charts
    lineChart;
    bubbleChart;
    usageTreeChart;
    changesTreeChart;
    //records
    loginRecords;
    userRecords;
    //colors
    usageColor = 'rgb(144,173,165)';
    changesColor = 'rgb(79,112,165)';;

    //toggle
    isWeek = true
    monthButtonVarient = 'neutral';
    weekButtonVarient = 'brand-outline';

    loading = true;
    //variables
    today = new Date();
    tempStartCount = 0;
    tempEndCount = 53;
    connectedCallback() {
        this.processDates();
        Promise.all([
            loadScript(this, chartjs),
            loadScript(this, charjs_treemap)
        ]);
        allLoginRecords().then(result => {
            console.log(result)
            this.loginRecords = result.Logins
            this.userRecords = result.Users;

            this.process();
        }).catch(error => {
            console.error(error)
        });

    }
    processDates() {
        let pastYear = new Date();
        pastYear.setMonth(this.today.getMonth() - 6);
        for (let i = 0, j = 13; i < j; i++) {
            this.month_year.push(this.getMonthNameFromDate(pastYear) + ' - ' + pastYear.getFullYear());
            //incement by one month
            pastYear.setMonth(pastYear.getMonth() + 1);
        }
        pastYear.setMonth(this.today.getMonth() - 6);
        const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
        for (let i = 0, j = 55; i < j; i++) {
            this.week_year.push(this.getWeekFromDate(pastYear) + ' - ' + pastYear.getFullYear());
            //incement by one week
            pastYear.setTime(this.getMonday(pastYear).getTime() + weekInMilliseconds);
        }

    }
    process() {
        this.processDateFilters();
        this.setUserDetails();
        this.setupFilters();
        console.log('this.loginRecords', this.loginRecords)
        let data = this.groupByDateRange(this.loginRecords);
        console.log('login data', data)
        this.preapreLineChart(data, 'new');
    }

    //Line chart
    preapreLineChart(records, type) {
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

    getLineChartDataset(groupByDates, type) {
        let labels = this.getLabel();
        let lineChartDataset = [];
        let recordCount = [];
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
            }
            else {
                recordCount.push(0);
            }
        }

        lineChartDataset.push({
            label: 'Logins',
            data: recordCount,
            borderColor: this.usageColor,
            fill: false
        })

        return [lineChartDataset, labels];
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




            if (isWeekView) {
                if (this.filterdByWeek) {
                    if (startCount === tempWeek) {
                        //week
                        r[weekDayString] = [...r[weekDayString] || [], a];
                    }
                }
                else if (tempWeek >= startCount && tempWeek <= endCount) {
                    //weeks

                    r[weekString] = [...r[weekString] || [], a];
                }

            }
            else if (!isWeekView) {
                if (this.filterdByMonth) {
                    if (startCount === tempMonth) {
                        //month

                        r[dateString] = [...r[dateString] || [], a];
                    }
                }
                else {
                    if (tempMonth >= startCount && tempMonth <= endCount) {
                        //year

                        r[yearString] = [...r[yearString] || [], a];
                    }
                }

            }
            return r;
        }, {});
    }
    setUserDetails() {
        let userMap = this.userRecords.reduce((r, a) => {
            r[a.Id] = [...r[a.Id] || [], a];
            return r;
        }, {});
        console.log('userMap', userMap)
        this.loginRecords = this.loginRecords.map(u => {

            if (userMap[u.UserId]) {
                u.User = userMap[u.UserId];
            }

            return u;
        })
    }
    //fillter utility
    setupFilters() {
        let userNames = this.userRecords
            .map(r => {
                return {
                    label: (r.Name) ? r.Name : '',
                    value: (r.Name) ? r.Name : '',
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


        this.profileValues = profilesNames;
        this.userValues = userNames;
    }

    // Dates utility
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
    processDateFilters() {
        if (this.isWeek) {
            let weeks = this.week_year.map((w, i) => {
                return { label: w, value: i }
            });
            this.periodStart = weeks

            this.periodEnd = weeks
            this.filterByPeriodStart = 26 - 5;
            this.filterByPeriodEnd = 26;

        }
        else if (!this.isWeek) {
            let years = this.month_year.map((y, i) => {
                return { label: y, value: i }
            });
            this.periodStart = years;
            this.periodEnd = years;
            this.filterByPeriodStart = 6 - 2;
            this.filterByPeriodEnd = 6;
        }
    }
    //chart utility
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
    showNotification(title, msg, varient) {
        const evt = new ShowToastEvent({
            title: title,
            message: msg,
            variant: varient
        });
        this.dispatchEvent(evt);
    }
}