Webruntime.moduleRegistry.define('c/usageDashboard', ['lightning/layout', 'lightning/layoutItem', 'lwc', 'force/lds', 'wire-service', 'webruntime/configProvider', 'lightning/platformResourceLoader'], function (_lightningLayout, _lightningLayoutItem, lwc, lds, wireService, configProvider, platformResourceLoader) { 'use strict';

    _lightningLayout = _lightningLayout && _lightningLayout.hasOwnProperty('default') ? _lightningLayout['default'] : _lightningLayout;
    _lightningLayoutItem = _lightningLayoutItem && _lightningLayoutItem.hasOwnProperty('default') ? _lightningLayoutItem['default'] : _lightningLayoutItem;

    function stylesheet(hostSelector, shadowSelector, nativeShadow) {
      return ".chart" + shadowSelector + "{width: 100%;height: 100%;}\n.white-background" + shadowSelector + "{background: white;}\n";
    }
    var _implicitStylesheets = [stylesheet];

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        t: api_text,
        gid: api_scoped_id,
        h: api_element,
        c: api_custom_element,
        d: api_dynamic,
        k: api_key,
        i: api_iterator,
        f: api_flatten,
        b: api_bind
      } = $api;
      const {
        _m0
      } = $ctx;
      return [api_custom_element("lightning-layout", _lightningLayout, {
        key: 2
      }, [api_custom_element("lightning-layout-item", _lightningLayoutItem, {
        props: {
          "size": "2",
          "padding": "around-small"
        },
        key: 3
      }, [api_element("nav", {
        classMap: {
          "slds-card": true,
          "slds-nav-vertical": true
        },
        attrs: {
          "aria-label": "Sub page"
        },
        key: 4
      }, [api_element("div", {
        classMap: {
          "slds-nav-vertical__section": true
        },
        key: 5
      }, [api_element("h2", {
        classMap: {
          "slds-nav-vertical__title": true
        },
        attrs: {
          "id": api_scoped_id("entity-header")
        },
        key: 6
      }, [api_text("Reports")]), api_element("ul", {
        attrs: {
          "aria-describedby": `${api_scoped_id("entity-header")}`
        },
        key: 7
      }, [api_element("li", {
        classMap: {
          "slds-nav-vertical__item": true,
          "slds-is-active": true
        },
        key: 8
      }, [api_element("a", {
        classMap: {
          "slds-nav-vertical__action": true
        },
        attrs: {
          "href": "javascript:void(0);",
          "aria-current": "true"
        },
        key: 9
      }, [api_text("Tracking")])])])])])]), api_custom_element("lightning-layout-item", _lightningLayoutItem, {
        props: {
          "size": "10",
          "padding": "around-small"
        },
        key: 10
      }, [api_custom_element("lightning-layout", _lightningLayout, {
        classMap: {
          "x-large": true
        },
        props: {
          "verticalAlign": "  ",
          "multipleRows": "true"
        },
        key: 11
      }, [api_custom_element("lightning-layout-item", _lightningLayoutItem, {
        classMap: {
          "slds-card": true
        },
        props: {
          "size": "12",
          "padding": "around-small"
        },
        key: 12
      }, [api_element("div", {
        classMap: {
          "slds-grid": true
        },
        key: 13
      }, [api_element("div", {
        classMap: {
          "slds-col": true,
          "slds-form-element": true
        },
        key: 14
      }, [api_element("label", {
        classMap: {
          "slds-form-element__label": true
        },
        attrs: {
          "for": `${api_scoped_id("monthValues")}`
        },
        key: 15
      }, [api_text("Filter Month")]), api_element("div", {
        classMap: {
          "slds-form-element__control": true
        },
        key: 16
      }, [api_element("div", {
        classMap: {
          "slds-select_container": true
        },
        key: 17
      }, [api_element("select", {
        classMap: {
          "slds-select": true
        },
        attrs: {
          "id": api_scoped_id("monthValues")
        },
        key: 18,
        on: {
          "change": _m0 || ($ctx._m0 = api_bind($cmp.onMonthFilter))
        }
      }, api_flatten([api_element("option", {
        attrs: {
          "value": ""
        },
        key: 19
      }, [api_text("All")]), api_iterator($cmp.monthValues, function (itm) {
        return api_element("option", {
          attrs: {
            "value": itm
          },
          key: api_key(21, itm)
        }, [api_dynamic(itm)]);
      })]))])])])])]), api_custom_element("lightning-layout-item", _lightningLayoutItem, {
        classMap: {
          "white-background": true
        },
        props: {
          "size": "12",
          "padding": "around-small"
        },
        key: 22
      }, [api_element("div", {
        classMap: {
          "slds-grid": true
        },
        key: 23
      }, [api_element("div", {
        classMap: {
          "slds-col": true,
          "slds-size_1-of-1": true
        },
        key: 24
      }, [api_element("div", {
        classMap: {
          "lineChart": true,
          "slds-m-around_medium": true
        },
        context: {
          lwc: {
            dom: "manual"
          }
        },
        key: 25
      }, [])])])])])])])];
    }

    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];

    if (_implicitStylesheets) {
      tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
    }
    tmpl.stylesheetTokens = {
      hostAttribute: "lwc-usageDashboard_usageDashboard-host",
      shadowAttribute: "lwc-usageDashboard_usageDashboard"
    };

    const apexInvoker = lds.getApexInvoker("", "UsageDashboardController", "fetchAllTrackingRecords", false);
    wireService.register(apexInvoker, lds.generateGetApexWireAdapter("", "UsageDashboardController", "fetchAllTrackingRecords", false));

    var chartjs = `${configProvider.getBasePath()}/assets/3f66ea6516/charjs`;

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    class UsageDashboard extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.monthValues = months;
        this.records = void 0;
        this.filterdByMonth = void 0;
        this.lineChart = void 0;
        this.changeRecords = void 0;
        this.usageRecords = void 0;
      }

      wiredRecords({
        error,
        data
      }) {
        if (data) {
          console.log('data', data);
          this.records = data;
          this.process();
        } else if (error) {
          console.error(error);
        }
      }

      connectedCallback() {
        platformResourceLoader.loadScript(this, chartjs);
      }

      process() {
        let changeTrackingRecords = this.records.filter(r => r.RecordType.Name === 'Field History');
        let usageTrackingRecords = this.records.filter(r => r.RecordType.Name === 'Usage Tracker');
        this.changeRecords = changeTrackingRecords;
        this.usageRecords = usageTrackingRecords;
        this.preapreLineChart(usageTrackingRecords, changeTrackingRecords, 'new');
        this.peparePointChart(usageTrackingRecords, changeTrackingRecords, 'new');
      } //Point size Chart


      peparePointChart(usageTrackingRecords, changeTrackingRecords, type) {
        let trackUsageName = usageTrackingRecords.map(r => {
          return {
            label: r.User__r ? r.User__r.Name : '',
            value: r.User__c ? r.User__c : ''
          };
        }).reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);
        let trackChangeName = changeTrackingRecords.map(r => {
          return {
            label: r.User__r ? r.User__r.Name : '',
            value: r.User__c ? r.User__c : ''
          };
        }).reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);
        let userNames = [...trackUsageName, ...trackChangeName].reduce((unique, item) => unique.find(e => e.label === item.label) ? unique : [...unique, item], []);
        console.log('userNames', userNames);
        this.getUserUsageByMonth(usageTrackingRecords);
      }

      getUserUsageByMonth(usageTrackingRecords) {
        let usageByDates = this.groupByDates(usageTrackingRecords);

        for (let label of months) {
          if (usageByDates[label]) {
            let monthRecords = usageByDates[label];
            let usageByUsers = this.groupByUsers(monthRecords);
            console.log('monthRecords', monthRecords);
            console.log('usageByUsers', usageByUsers);
          }
        }
      } //Line chart


      preapreLineChart(usageTrackingRecords, changeTrackingRecords, type) {
        let usage = this.getUsageByMonth(usageTrackingRecords);
        let change = this.getChangesByMonth(changeTrackingRecords);
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
        };
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
        };

        if (type == 'new') {
          this.lineChart = this.createChart('lineChart', lineChartJSON);
        } else if (type == 'update') {
          this.lineChart.data = data;
          this.lineChart.update();
        }
      }

      getUsageByMonth(usageTrackingRecords) {
        let usageByDates = this.groupByDates(usageTrackingRecords);
        let labels = Object.keys(usageByDates);
        let lineChartDataset = [];
        let usageCount = [];

        if (!this.filterdByMonth) {
          for (let label of months) {
            if (usageByDates[label]) {
              usageCount.push(usageByDates[label].length);
            } else {
              usageCount.push(0);
            }
          }
        } else {
          labels = labels.sort(function (a, b) {
            b = new Date(a);
            a = new Date(b);
            return a > b ? -1 : a < b ? 1 : 0;
          });

          for (let label of labels) {
            if (usageByDates[label]) {
              usageCount.push(usageByDates[label].length);
            } else {
              usageCount.push(0);
            }
          }
        }

        lineChartDataset.push({
          label: 'Usage',
          data: usageCount,
          borderColor: this.getBgColor(),
          fill: false
        });
        return [lineChartDataset, !this.filterdByMonth ? months : labels];
      }

      getChangesByMonth(changeTrackingRecords) {
        let changeByDates = this.groupByDates(changeTrackingRecords);
        let labels = Object.keys(changeByDates);
        let lineChartDataset = [];
        let changeCount = [];

        if (!this.filterdByMonth) {
          for (let label of months) {
            if (changeByDates[label]) {
              changeCount.push(changeByDates[label].length);
            } else {
              changeCount.push(0);
            }
          }
        } else {
          labels = labels.sort(function (a, b) {
            b = new Date(a);
            a = new Date(b);
            return a > b ? -1 : a < b ? 1 : 0;
          });

          for (let label of labels) {
            if (changeByDates[label]) {
              changeCount.push(changeByDates[label].length);
            } else {
              changeCount.push(0);
            }
          }
        }

        lineChartDataset.push({
          label: 'Changes',
          data: changeCount,
          borderColor: this.getBgColor(),
          fill: false
        });
        return [lineChartDataset, !this.filterdByMonth ? months : labels];
      } //filters


      onMonthFilter(event) {
        const month = event.target.value;
        this.filterdByMonth = month;
        this.processFilters();
      }

      processFilters() {
        this.preapreLineChart(this.usageRecords, this.changeRecords, 'update');
      } //utility


      getMonthFromDate(date) {
        let d = new Date(date);
        return months[d.getMonth()];
      }

      getDateFromMonth(date) {
        let d = new Date(date);
        return d.getDate();
      }

      groupByDates(list) {
        return list.reduce((r, a) => {
          let tempMonth = this.getMonthFromDate(a.CreatedDate);
          let tempDate = this.getDateFromMonth(a.CreatedDate);

          if (this.filterdByMonth === tempMonth) {
            r[tempDate] = [...(r[tempDate] || []), a];
          } else if (!this.filterdByMonth) {
            r[tempMonth] = [...(r[tempMonth] || []), a];
          }

          return r;
        }, {});
      }

      groupByUsers(list) {
        return list.reduce((r, a) => {
          let tempMonth = a.User__c;

          if (!this.filterdByMonth) {
            r[tempMonth] = [...(r[tempMonth] || []), a];
          }

          return r;
        }, {});
      }

      createChart(divClass, dataset) {
        try {
          // disable Chart.js CSS injection
          //window.Chart.platform.disableCSSInjection = true;
          const canvas = document.createElement('canvas'); //canvas.style.height = '50%';
          //canvas.style.width = '50%';

          const ctx = canvas.getContext('2d');
          let chart = new window.Chart(ctx, dataset);
          this.template.querySelector('div.' + divClass).appendChild(canvas);
          return chart;
        } catch (e) {
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

    lwc.registerDecorators(UsageDashboard, {
      wire: {
        wiredRecords: {
          adapter: apexInvoker,
          method: 1
        }
      }
    });

    var usageDashboard = lwc.registerComponent(UsageDashboard, {
      tmpl: _tmpl
    });

    return usageDashboard;

});
