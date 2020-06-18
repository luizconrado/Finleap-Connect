import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import allRecords from '@salesforce/apex/ProductInstanceUsageChartController.fetchAllUsageRecords';
import chartjs from '@salesforce/resourceUrl/charjs';
import charjs_treemap from '@salesforce/resourceUrl/charjs_treemap';



import Pricing_Type from '@salesforce/schema/Product_Instance__c.Pricing_Type__c';
import Percentage_Per_Usage from '@salesforce/schema/Product_Instance__c.Percentage_Per_Usage__c';
import Base_Price from '@salesforce/schema/Product_Instance__c.Base_Price__c';
import Base_Limit from '@salesforce/schema/Product_Instance__c.Base_Limit__c';
import One_Time_Setup_Price from '@salesforce/schema/Product_Instance__c.One_Time_Setup_Price__c';
import Excess_Limit_Bucket_1 from '@salesforce/schema/Product_Instance__c.Excess_Limit_Bucket_1__c';
import Excess_Price_Bucket_1 from '@salesforce/schema/Product_Instance__c.Excess_Price_Bucket_1__c';
import Excess_Limit_Bucket_2 from '@salesforce/schema/Product_Instance__c.Excess_Limit_Bucket_2__c';
import Excess_Price_Bucket_2 from '@salesforce/schema/Product_Instance__c.Excess_Price_Bucket_2__c';
import Excess_Limit_Bucket_3 from '@salesforce/schema/Product_Instance__c.Excess_Limit_Bucket_3__c';
import Excess_Price_Bucket_3 from '@salesforce/schema/Product_Instance__c.Excess_Price_Bucket_3__c';
import Excess_Limit_Bucket_4 from '@salesforce/schema/Product_Instance__c.Excess_Limit_Bucket_4__c';
import Excess_Price_Bucket_4 from '@salesforce/schema/Product_Instance__c.Excess_Price_Bucket_4__c';
import Excess_Limit_Bucket_5 from '@salesforce/schema/Product_Instance__c.Excess_Limit_Bucket_5__c';
import Excess_Price_Bucket_5 from '@salesforce/schema/Product_Instance__c.Excess_Price_Bucket_5__c';
import fetchRecordHistory from '@salesforce/apex/RelatedHistoryController.fetchRecordHistory';


const FIELDS = [Percentage_Per_Usage, Pricing_Type, Base_Price, Base_Limit, One_Time_Setup_Price, Excess_Limit_Bucket_1, Excess_Price_Bucket_1, Excess_Price_Bucket_5, Excess_Limit_Bucket_2, Excess_Price_Bucket_2, Excess_Limit_Bucket_3, Excess_Price_Bucket_3, Excess_Limit_Bucket_4, Excess_Price_Bucket_4, Excess_Limit_Bucket_5];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
const weeks = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52"];
const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
export default class ProductInstanceUsageChart extends LightningElement {
    @api recordId;

    //recrods
    records;
    recordPricingInfo;
    pricingDetails;
    //filters
    filterdByMonth = false;
    filterdByWeek = false;
    monthButtonVarient = 'neutral';
    weekButtonVarient = 'brand-outline';
    filterByPeriodStart = 1;
    filterByPeriodEnd = 53;

    //views
    isWeekView = true;
    //charts
    lineChart
    //days
    month_year = [];
    week_year = [];

    year_month_day = [];
    day_week = [];
    //variables
    usageColor = 'rgb(144,173,165)';
    today = new Date();
    //Filter values
    periodStart;
    periodEnd;
    @wire(allRecords, { insatnceId: '$recordId' })
    wiredRecords({ error, data }) {
        if (data) {
            console.log('data', data);
            this.records = data;
            this.apexLoaded = true;
            this.route();

        } else if (error) {
            console.error(error);
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            this.recordLoaded = true;
            this.recordPricingInfo = data;
            this.route();
        }
        else {
            console.error(error);
        }

    }

    connectedCallback() {
        Promise.all([
            loadScript(this, chartjs),
            loadScript(this, charjs_treemap)
        ]).then(() => {
            this.scriptLoaded = true;
            this.route();
        }).catch(e => {
            console.error(e)
            this.scriptLoaded = true;
            this.route();
        });

    }
    apexLoaded = false;
    scriptLoaded = false;
    recordLoaded = false;
    route() {

        if (this.apexLoaded && this.scriptLoaded && this.recordLoaded) {
            this.process();
        }

    }

    process() {
        this.processDates();
        this.processFilters();
        const data = this.groupByDateRange(this.records);
        this.preapreLineChart(data, 'new');
        this.calculatePrice();

    }

    //calculate
    calculatePrice() {
        let groupByDates = this.groupByMonth(this.records);
        const data = this.recordPricingInfo;
        const label = this.month_year;

        const basePrice = data.fields.Base_Price__c.value;
        const baseUsage = data.fields.Base_Limit__c.value;

        const bucket1 = data.fields.Excess_Limit_Bucket_1__c.value;
        const bucket2 = data.fields.Excess_Limit_Bucket_2__c.value;
        const bucket3 = data.fields.Excess_Limit_Bucket_3__c.value;
        const bucket4 = data.fields.Excess_Limit_Bucket_4__c.value;
        const bucket5 = data.fields.Excess_Limit_Bucket_5__c.value;


        const bucketPrice1 = data.fields.Excess_Price_Bucket_1__c.value;
        const bucketPrice2 = data.fields.Excess_Price_Bucket_2__c.value;
        const bucketPrice3 = data.fields.Excess_Price_Bucket_3__c.value;
        const bucketPrice4 = data.fields.Excess_Price_Bucket_4__c.value;
        const bucketPrice5 = data.fields.Excess_Price_Bucket_5__c.value;

        const type = data.fields.Pricing_Type__c.value;
        const percentage = data.fields.Percentage_Per_Usage__c.value;
        console.log('groupByDates', groupByDates)
        console.log('label', percentage, type, label)
        let values = [];
        for (let key of label) {
            if (groupByDates[key] && groupByDates[key].length > 0) {
                let records = groupByDates[key];
                if (type === 'Steps')
                    values.push(this.calculateStepsPricing(key, records, basePrice, baseUsage, bucket1, bucket2, bucket3, bucket4, bucket5, bucketPrice1, bucketPrice2, bucketPrice3, bucketPrice4, bucketPrice5));
                else if (type === 'Progressive') {
                    values.push(this.calculateProgressivePricing(key, records, basePrice, baseUsage, bucket1, bucket2, bucket3, bucket4, bucket5, bucketPrice1, bucketPrice2, bucketPrice3, bucketPrice4, bucketPrice5));
                }
                else if (type === 'Packages') {
                    values.push(this.calculatePackagesPricing(key, records, basePrice, baseUsage, bucket1, bucket2, bucket3, bucket4, bucket5, bucketPrice1, bucketPrice2, bucketPrice3, bucketPrice4, bucketPrice5));
                }

            }
        }
        console.log('values', values)
        this.pricingDetails = values.reverse();
    }
    calculatePackagesPricing(monthName, records, basePrice, baseUsage, bucket1, bucket2, bucket3, bucket4, bucket5, bucketPrice1, bucketPrice2, bucketPrice3, bucketPrice4, bucketPrice5) {
        let currentMonthUsage = records.reduce((total, currentElement) => {
            total += currentElement.Usage_Count__c;
            return total;
        }, 0);
        let buckets = [];
        if (currentMonthUsage <= baseUsage) {
            buckets.push({
                key: 'base',
                usage: currentMonthUsage,
                usagePrice: basePrice,
                price: basePrice,
                usageAllowed: baseUsage
            });
        }
        else if (currentMonthUsage <= bucket1) {
            buckets.push({
                key: 'stuffe 1',
                usage: currentMonthUsage,
                usagePrice: bucket1,
                price: bucketPrice1,
                usageAllowed: bucket1
            });
        }
        else if (currentMonthUsage <= bucket2) {
            buckets.push({
                key: 'stuffe 2',
                usage: currentMonthUsage,
                usagePrice: bucket2,
                price: bucketPrice2,
                usageAllowed: bucket2
            });
        }
        else if (currentMonthUsage <= bucket3) {
            buckets.push({
                key: 'stuffe 3',
                usage: currentMonthUsage,
                usagePrice: bucket3,
                price: bucketPrice3,
                usageAllowed: bucket3
            });
        }
        else if (currentMonthUsage <= bucket4) {
            buckets.push({
                key: 'stuffe 4',
                usage: currentMonthUsage,
                usagePrice: bucket4,
                price: bucketPrice4,
                usageAllowed: bucket4
            });
        }
        else if (currentMonthUsage <= bucket5) {
            buckets.push({
                key: 'stuffe 5',
                usage: currentMonthUsage,
                usagePrice: bucket5,
                price: bucketPrice5,
                usageAllowed: bucket5
            });
        }
        else {
            buckets.push({
                key: 'extra',
                usage: currentMonthUsage,
                price: bucketPrice5,
                usagePrice: bucket5,
                usageAllowed: 'unlimited'
            });
        }
        const currentMonthPrice = buckets.reduce((total, currentValue) => total += currentValue.price, 0);

        return {
            month: monthName,
            totalUsage: currentMonthUsage,
            totalPrice: currentMonthPrice,
            buckets: buckets,
            expanded: false
        }
    }
    calculateProgressivePricing(monthName, records, basePrice, baseUsage, bucket1, bucket2, bucket3, bucket4, bucket5, bucketPrice1, bucketPrice2, bucketPrice3, bucketPrice4, bucketPrice5) {
        let currentMonthUsage = records.reduce((total, currentElement) => {
            total += currentElement.Usage_Count__c;
            return total;
        }, 0);
        let buckets = [];
        if (currentMonthUsage <= baseUsage) {
            buckets.push({
                key: 'base',
                usage: currentMonthUsage,
                usagePrice: basePrice,
                price: currentMonthUsage * basePrice,
                usageAllowed: baseUsage
            });
        }
        else if (currentMonthUsage <= bucket1) {
            buckets.push({
                key: 'stuffe 1',
                usage: currentMonthUsage,
                usagePrice: bucket1,
                price: currentMonthUsage * bucketPrice1,
                usageAllowed: bucket1
            });
        }
        else if (currentMonthUsage <= bucket2) {
            buckets.push({
                key: 'stuffe 2',
                usage: currentMonthUsage,
                usagePrice: bucket2,
                price: currentMonthUsage * bucketPrice2,
                usageAllowed: bucket2
            });
        }
        else if (currentMonthUsage <= bucket3) {
            buckets.push({
                key: 'stuffe 3',
                usage: currentMonthUsage,
                usagePrice: bucket3,
                price: currentMonthUsage * bucketPrice3,
                usageAllowed: bucket3
            });
        }
        else if (currentMonthUsage <= bucket4) {
            buckets.push({
                key: 'stuffe 4',
                usage: currentMonthUsage,
                usagePrice: bucket4,
                price: currentMonthUsage * bucketPrice4,
                usageAllowed: bucket4
            });
        }
        else if (currentMonthUsage <= bucket5) {
            buckets.push({
                key: 'stuffe 5',
                usage: currentMonthUsage,
                usagePrice: bucket5,
                price: currentMonthUsage * bucketPrice5,
                usageAllowed: bucket5
            });
        }
        else {
            buckets.push({
                key: 'extra',
                usage: currentMonthUsage,
                price: currentMonthUsage * bucketPrice5,
                usagePrice: bucket5,
                usageAllowed: 'unlimited'
            });
        }
        const currentMonthPrice = buckets.reduce((total, currentValue) => total += currentValue.price, 0);

        return {
            month: monthName,
            totalUsage: currentMonthUsage,
            totalPrice: currentMonthPrice,
            buckets: buckets,
            expanded: false
        }
    }
    calculateStepsPricing(monthName, records, basePrice, baseUsage, bucket1, bucket2, bucket3, bucket4, bucket5, bucketPrice1, bucketPrice2, bucketPrice3, bucketPrice4, bucketPrice5) {
        let currentMonthUsage = records.reduce((total, currentElement) => {
            total += currentElement.Usage_Count__c;
            return total;
        }, 0);

        let usageSplit = this.splitNumberInBuckets(currentMonthUsage, [baseUsage, bucket1, bucket2, bucket3, bucket4, bucket5]);
        let buckets = [];
        let extraPrice = 0;
        //base
        if (usageSplit[0]) {
            buckets.push({
                key: 'base',
                usage: usageSplit[0],
                price: basePrice,
                usagePrice: basePrice,
                usageAllowed: baseUsage
            });
            extraPrice = basePrice;
        }
        //bucket 1
        if (usageSplit[1]) {

            buckets.push({
                key: 'stuffe 1',
                usage: usageSplit[1],
                price: usageSplit[1] * bucketPrice1,
                usagePrice: bucketPrice1,
                usageAllowed: bucket1
            });
            extraPrice = bucketPrice1;
        }
        //bucket 2
        if (usageSplit[2]) {

            buckets.push({
                key: 'stuffe 2',
                usage: usageSplit[2],
                price: usageSplit[2] * bucketPrice2,
                usagePrice: bucketPrice2,
                usageAllowed: bucket2
            });
            extraPrice = bucketPrice2;
        }
        //bucket 3
        if (usageSplit[3]) {

            buckets.push({
                key: 'stuffe 3',
                usage: usageSplit[3],
                price: usageSplit[3] * bucketPrice3,
                usagePrice: bucketPrice3,
                usageAllowed: bucket3
            });
            extraPrice = bucketPrice3;
        }
        //bucket 4
        if (usageSplit[4]) {

            buckets.push({
                key: 'stuffe 4',
                usage: usageSplit[4],
                price: usageSplit[4] * bucketPrice4,
                usagePrice: bucketPrice4,
                usageAllowed: bucket4
            });
            extraPrice = bucketPrice4;
        }
        //bucket 5
        if (usageSplit[5]) {

            buckets.push({
                key: 'stuffe 5',
                usage: usageSplit[5],
                price: usageSplit[5] * bucketPrice5,
                usagePrice: bucketPrice5,
                usageAllowed: bucket5
            });
            extraPrice = bucketPrice5;
        }
        //extra
        if (usageSplit[6]) {

            buckets.push({
                key: 'extra',
                usage: usageSplit[6],
                price: usageSplit[6] * extraPrice,
                usagePrice: extraPrice,
                usageAllowed: 'unlimited'
            });
        }

        const currentMonthPrice = buckets.reduce((total, currentValue) => total += currentValue.price, 0);

        return {
            month: monthName,
            totalUsage: currentMonthUsage,
            totalPrice: currentMonthPrice,
            buckets: buckets,
            expanded: false
        }
    }

    //Line chart
    preapreLineChart(records, type) {

        let usage = this.getLineChartDataset(records);

        let labels = [...usage[1]];
        let lineChartDataset = [];
        lineChartDataset.push(...usage[0]);
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
                    text: 'Product Usage Over Time.'
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

    getLineChartDataset(groupByDates) {
        let labels = this.getLabel();
        let lineChartDataset = [];
        let recordCount = [];
        for (let key of labels) {
            if (groupByDates[key] && groupByDates[key].length > 0) {
                let records = groupByDates[key];
                recordCount.push(records.reduce((t, a) => t += a.Usage_Count__c, 0));
            }
            else {
                recordCount.push(0);
            }
        }

        lineChartDataset.push({
            label: 'Usage',
            data: recordCount,
            borderColor: this.usageColor,
            fill: false
        })

        return [lineChartDataset, labels];
    }


    processDates() {
        let pastYear = new Date();
        pastYear.setMonth(this.today.getMonth() - 12);
        for (let i = 0, j = 13; i < j; i++) {
            this.month_year.push(this.getMonthNameFromDate(pastYear) + ' - ' + pastYear.getFullYear());
            //incement by one month
            pastYear.setMonth(pastYear.getMonth() + 1);
        }
        pastYear.setMonth(this.today.getMonth() - 12);
        const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
        for (let i = 0, j = 55; i < j; i++) {
            this.week_year.push(this.getWeekFromDate(pastYear) + ' - ' + pastYear.getFullYear());
            //incement by one week
            pastYear.setTime(this.getMonday(pastYear).getTime() + weekInMilliseconds);
        }
    }
    processFilters() {
        if (this.isWeekView) {
            let weeks = this.week_year.map((w, i) => {
                return { label: w, value: i }
            });
            this.periodStart = weeks

            this.periodEnd = weeks

            this.setDateFilterDefaults(0, 54);

        }
        else if (!this.isWeekView) {
            let years = this.month_year.map((y, i) => {
                return { label: y, value: i }
            });
            this.periodStart = years;
            this.periodEnd = years;
            this.setDateFilterDefaults(0, 12);
        }
    }
    setDateFilterDefaults(startValue, endValue) {
        this.filterByPeriodStart = startValue;
        this.filterByPeriodEnd = endValue;
    }

    //group
    groupByDateRange(list) {
        let isWeekView = this.isWeekView;
        let startCount = this.filterByPeriodStart;
        let endCount = this.filterByPeriodEnd;
        return list.reduce((r, a) => {
            let d = new Date(a.Usage_Period__c);
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
    groupByMonth(list) {
        return list.reduce((r, a) => {
            let d = new Date(a.Usage_Period__c);
            let tempYear = d.getFullYear();
            let tempMonthName = this.getMonthNameFromDate(d);
            let yearString = tempMonthName + ' - ' + tempYear;
            //year
            r[yearString] = [...r[yearString] || [], a];
            return r;
        }, {});



    }
    //filter
    onPeriodStartFilter(event) {
        let count = event.detail.value;
        if (typeof count === 'string') count = parseInt(count)
        if (count > this.filterByPeriodEnd) {
            this.showNotification('Invalid Start Period', 'Start cannot be greater then End', 'warning');
            this.filterByPeriodStart = this.filterByPeriodStart;
            return;
        }
        if (!this.isWeekView && this.filterByPeriodEnd == count) {
            //filter by month
            this.filterdByMonth = true;

            this.prepareMonthDays(...this.month_year[count].split('-'));
        }
        else if (this.isWeekView && this.filterByPeriodEnd == count) {
            //filter by week
            this.filterdByWeek = true;
            this.prepareWeekDays(...this.week_year[count].split('-'));
        }
        else {
            this.filterdByMonth = false;
            this.filterdByWeek = false;
        }
        this.filterByPeriodStart = count;
        this.filterChart();

    }
    onPeriodEndFilter(event) {
        let count = event.detail.value;
        if (typeof count === 'string') count = parseInt(count)

        // const count = (this.isWeekView) ? this.week_year.indexOf(end) + 1 : this.month_year.indexOf(end) + 1;
        if (count < this.filterByPeriodStart) {
            this.showNotification('Invalid End Period', 'End cannot be greater then Start', 'warning');
            this.filterByPeriodEnd = this.filterByPeriodEnd
            return;
        }
        if (!this.isWeekView && this.filterByPeriodStart == count) {
            //filter by month
            this.filterdByMonth = true;
            this.prepareMonthDays(...this.month_year[count].split('-'));
        }
        else if (this.isWeekView && this.filterByPeriodStart == count) {
            //filter by week
            this.filterdByWeek = true;
            this.prepareWeekDays(...this.week_year[count].split('-'));
        }
        else {
            this.filterdByMonth = false;
            this.filterdByWeek = false;
        }
        this.filterByPeriodEnd = count;
        this.filterChart();

    }

    filterChart() {
        let data = this.groupByDateRange(this.records)
        this.preapreLineChart(data, 'update');
    }
    //views
    onMonthView() {
        this.isWeekView = false;
        this.filterdByMonth = false;
        this.filterdByWeek = false;
        this.monthButtonVarient = 'brand-outline';
        this.weekButtonVarient = 'neutral';
        this.filterByPeriodStart = 1;
        this.filterByPeriodEnd = 13;
        this.processFilters();
        let records = this.groupByDateRange(this.records);
        this.preapreLineChart(records, 'update');
    }
    onWeekiew() {
        this.isWeekView = true;
        this.filterdByMonth = false;
        this.filterdByWeek = false;
        this.weekButtonVarient = 'brand-outline';
        this.monthButtonVarient = 'neutral';
        this.filterByPeriodStart = 1;
        this.filterByPeriodEnd = 53;
        this.processFilters();
        let records = this.groupByDateRange(this.records);
        this.preapreLineChart(records, 'update');
    }
    //hanlders
    togglePriceTable(event) {
        const datasets = event.currentTarget.dataset
        this.pricingDetails = this.pricingDetails.map(currentElement => {
            if (currentElement.month == datasets.value) {
                currentElement.expanded = !currentElement.expanded;
            }
            return currentElement;
        })
    }

    //utility
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
    getMonthNameFromDate(date) {
        return months[date.getMonth()];
    }
    getMonday(d) {
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }
    getLabel() {
        let isWeekView = this.isWeekView;
        let startCount = this.filterByPeriodStart;
        let endCount = this.filterByPeriodEnd;
        if (isWeekView) {
            if (this.filterdByWeek) {
                return this.day_week;
            }
            return this.week_year.slice(startCount, endCount + 1);
        }
        else if (!isWeekView) {
            if (this.filterdByMonth) {
                return this.year_month_day
            }
            return this.month_year.slice(startCount, endCount + 1);
        }
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
    showNotification(title, msg, varient) {
        const evt = new ShowToastEvent({
            title: title,
            message: msg,
            variant: varient
        });
        this.dispatchEvent(evt);
    }
    prepareMonthDays(tempMonth, tempYear) {
        // let dateString = d.getFullYear() + '-' + tempMonth + '-' + d.getDate();

        this.year_month_day = [];
        for (let dayNumber of days) {
            this.year_month_day.push(tempYear.trim() + '-' + tempMonth.trim() + '-' + dayNumber);
        }
    }
    prepareWeekDays(week) {
        //let weekDayString = weekDays[d.getDay()] + '-' + tempWeek;

        this.day_week = [];
        for (let dayName of weekDays) {
            this.day_week.push(dayName + '-' + week.trim());
        }



    }
    splitNumberInBuckets(number, arrayOfbuckets) {
        let bucket = [];
        for (let i of arrayOfbuckets) {
            if (number > 0) {
                let currentBucket = number - (number - i);
                number = number - i;
                bucket.push(currentBucket);
            }
        }
        if (number > 0) bucket.push(number);
        return bucket;
    }

    getDateMonthFromWeek(weekNo) {
        let d1 = new Date();
        let numOfdaysPastSinceLastMonday = eval(d1.getDay() - 1);
        d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
        let weekNoToday = this.getWeekFromDate(d1);
        let weeksInTheFuture = eval(weekNo - weekNoToday);
        d1.setDate(d1.getDate() + eval(7 * weeksInTheFuture));
        let rangeIsFrom = eval(d1.getMonth() + 1) + "/" + d1.getDate() + "/" + d1.getFullYear();
        let d = new Date(rangeIsFrom);
        return d.getMonth()
    }

}