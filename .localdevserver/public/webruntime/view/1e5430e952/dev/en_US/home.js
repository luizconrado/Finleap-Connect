Webruntime.moduleRegistry.define('webruntimegenerated/view__home', ['lwc', 'lightning/verticalNavigation', 'lightning/verticalNavigationSection', 'lightning/verticalNavigationItemIcon', 'lightning/icon'], function (lwc, _lightningVerticalNavigation, _lightningVerticalNavigationSection, _lightningVerticalNavigationItemIcon, _lightningIcon) { 'use strict';

    _lightningVerticalNavigation = _lightningVerticalNavigation && _lightningVerticalNavigation.hasOwnProperty('default') ? _lightningVerticalNavigation['default'] : _lightningVerticalNavigation;
    _lightningVerticalNavigationSection = _lightningVerticalNavigationSection && _lightningVerticalNavigationSection.hasOwnProperty('default') ? _lightningVerticalNavigationSection['default'] : _lightningVerticalNavigationSection;
    _lightningVerticalNavigationItemIcon = _lightningVerticalNavigationItemIcon && _lightningVerticalNavigationItemIcon.hasOwnProperty('default') ? _lightningVerticalNavigationItemIcon['default'] : _lightningVerticalNavigationItemIcon;
    _lightningIcon = _lightningIcon && _lightningIcon.hasOwnProperty('default') ? _lightningIcon['default'] : _lightningIcon;

    function stylesheet(hostSelector, shadowSelector, nativeShadow) {
      return ".slds-col" + shadowSelector + " + .slds-col" + shadowSelector + " {margin-top: 1rem;}\n@media (min-width: 48em) {.slds-col" + shadowSelector + " + .slds-col" + shadowSelector + " {margin-top: 0;}\n}";
    }
    var _implicitStylesheets = [stylesheet];

    function stylesheet$1(hostSelector, shadowSelector, nativeShadow) {
      return "\n" + (nativeShadow ? (":host {display: block;margin-left: auto;margin-right: auto;padding-left: .5rem;padding-right: .5rem;max-width: 80rem;}") : (hostSelector + " {display: block;margin-left: auto;margin-right: auto;padding-left: .5rem;padding-right: .5rem;max-width: 80rem;}")) + "\n\n" + (nativeShadow ? (":host.main-content {margin-top: 1rem;padding-bottom: 3rem;}") : (hostSelector + ".main-content {margin-top: 1rem;padding-bottom: 3rem;}")) + "\n@media (min-width: 48em) {\n" + (nativeShadow ? (":host.main-content {margin-top: 3rem;}") : (hostSelector + ".main-content {margin-top: 3rem;}")) + "\n}";
    }
    var _implicitStylesheets$1 = [stylesheet$1];

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        s: api_slot
      } = $api;
      return [api_slot("", {
        key: 2
      }, [], $slotset)];
    }

    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.slots = [""];
    tmpl.stylesheets = [];

    if (_implicitStylesheets$1) {
      tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets$1);
    }
    tmpl.stylesheetTokens = {
      hostAttribute: "localdevserver-layoutSection_layoutSection-host",
      shadowAttribute: "localdevserver-layoutSection_layoutSection"
    };

    /**
     * Used to enforce a consistent max-width and auto margins for
     * top-level layout sections.
     */

    class LayoutSection extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.mainContent = void 0;
      }

      connectedCallback() {
        if (this.mainContent) {
          this.classList.add('main-content');
        }
      }

    }

    lwc.registerDecorators(LayoutSection, {
      publicProps: {
        mainContent: {
          config: 0
        }
      }
    });

    var _localdevserverLayoutSection = lwc.registerComponent(LayoutSection, {
      tmpl: _tmpl
    });

    function stylesheet$2(hostSelector, shadowSelector, nativeShadow) {
      return ".components-panel" + shadowSelector + " {height: 100%;}\n.header" + shadowSelector + " {padding: 1.25rem 1.5rem;border-bottom: 1px solid #dddbda;flex-wrap: wrap;}\n.project-name" + shadowSelector + " {width: 100%;}\n.project-name-text" + shadowSelector + " {font-weight: bold;}\n@media (min-width: 48em) {.header" + shadowSelector + " {flex-wrap: nowrap;}\n.project-name" + shadowSelector + " {flex: 1;width: auto;max-width: 40%;}\n}.search" + shadowSelector + " {flex: 3.5;margin-top: 1rem;}\n@media (min-width: 48em) {.search" + shadowSelector + " {margin-top: 0;}\n}.search-input" + shadowSelector + " {height: 40px;font-size: 1rem;padding-left: 3.5rem;}\n.search-input" + shadowSelector + "::-ms-input-placeholder {font-size: 1rem;}\n.search-input" + shadowSelector + "::placeholder {font-size: 1rem;color: #706e6b;}\n.search-icon" + shadowSelector + " {width: 1.5rem;height: 1.5rem;margin-top: 0;top: 9px;left: 1rem;}\n.components-body" + shadowSelector + " {flex-wrap: wrap;}\n@media (min-width: 48em) {.components-body" + shadowSelector + " {flex-wrap: nowrap;}\n}.packages-list" + shadowSelector + " {background-color: #fafafb;padding-bottom: 1rem;}\n@media (min-width: 48em) {.packages-list" + shadowSelector + " {max-width: 300px;min-height: 300px;padding-bottom: 0;}\n.components-list" + shadowSelector + " {min-height: 100%;max-height: 60vh;}\n}.components-list" + shadowSelector + " .list-item" + shadowSelector + " + .list-item" + shadowSelector + " {margin-top: .75rem;}\n.components-list-label" + shadowSelector + " {color: #3e3e3c;}\n";
    }
    var _implicitStylesheets$2 = [stylesheet$2];

    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {
        d: api_dynamic,
        h: api_element,
        t: api_text,
        gid: api_scoped_id,
        b: api_bind,
        k: api_key,
        c: api_custom_element,
        i: api_iterator,
        fid: api_scoped_frag_id
      } = $api;
      const {
        _m0,
        _m1,
        _m2
      } = $ctx;
      return [api_element("section", {
        classMap: {
          "components-panel": true,
          "slds-card": true,
          "slds-grid": true,
          "slds-grid_vertical": true
        },
        key: 2
      }, [api_element("div", {
        classMap: {
          "header": true,
          "slds-grid": true,
          "slds-grid_align-spread": true,
          "slds-grid_vertical-align-center": true
        },
        key: 3
      }, [api_element("header", {
        classMap: {
          "project-name": true
        },
        key: 4
      }, [api_element("h2", {
        classMap: {
          "project-name-text": true,
          "slds-card__header-title": true,
          "slds-truncate": true,
          "slds-text-heading_medium": true,
          "slds-m-right_x-small": true
        },
        attrs: {
          "title": $cmp.projectName
        },
        key: 5
      }, [api_dynamic($cmp.projectName)])]), api_element("div", {
        classMap: {
          "search": true
        },
        key: 6
      }, [api_element("div", {
        classMap: {
          "slds-form-element": true
        },
        key: 7
      }, [api_element("label", {
        classMap: {
          "slds-form-element__label": true,
          "slds-no-flex": true,
          "slds-assistive-text": true
        },
        attrs: {
          "for": `${api_scoped_id("input")}`
        },
        key: 8
      }, [api_text("Search for a component")]), api_element("div", {
        classMap: {
          "slds-form-element__control": true,
          "slds-input-has-icon": true,
          "slds-input-has-icon_left-right": true
        },
        key: 9
      }, [api_element("svg", {
        classMap: {
          "search-icon": true,
          "slds-icon": true,
          "slds-input__icon": true,
          "slds-input__icon_left": true,
          "slds-icon-text-default": true,
          "slds-icon_medium": true
        },
        attrs: {
          "aria-hidden": "true"
        },
        key: 10
      }, [api_element("use", {
        attrs: {
          "xlink:href": lwc.sanitizeAttribute("use", "http://www.w3.org/2000/svg", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#search")
        },
        key: 11
      }, [])]), api_element("input", {
        classMap: {
          "slds-input": true,
          "search-input": true
        },
        attrs: {
          "id": api_scoped_id("input"),
          "type": "search",
          "placeholder": "Search for a component..."
        },
        props: {
          "disabled": $cmp.searchDisabled
        },
        key: 12,
        on: {
          "change": _m0 || ($ctx._m0 = api_bind($cmp.onSearchChange)),
          "keyup": _m1 || ($ctx._m1 = api_bind($cmp.onSearchChange))
        }
      }, []), $cmp.searchInProgress ? api_element("button", {
        classMap: {
          "slds-button": true,
          "slds-button_icon": true,
          "slds-input__icon": true,
          "slds-input__icon_right": true
        },
        attrs: {
          "title": "Clear"
        },
        key: 14,
        on: {
          "click": _m2 || ($ctx._m2 = api_bind($cmp.clearInput))
        }
      }, [api_element("svg", {
        classMap: {
          "slds-button__icon": true,
          "slds-icon-text-light": true
        },
        attrs: {
          "aria-hidden": "true"
        },
        key: 15
      }, [api_element("use", {
        attrs: {
          "xlink:href": lwc.sanitizeAttribute("use", "http://www.w3.org/2000/svg", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#clear")
        },
        key: 16
      }, [])]), api_element("span", {
        classMap: {
          "slds-assistive-text": true
        },
        key: 17
      }, [api_text("Clear")])]) : null])])])]), api_element("div", {
        classMap: {
          "components-body": true,
          "slds-grid": true,
          "slds-grow": true
        },
        key: 18
      }, [api_element("div", {
        classMap: {
          "packages-list": true,
          "slds-grow": true
        },
        key: 19
      }, [api_custom_element("lightning-vertical-navigation", _lightningVerticalNavigation, {
        props: {
          "shaded": "true",
          "selectedItem": $cmp.selectedPackage
        },
        key: 20
      }, [api_custom_element("lightning-vertical-navigation-section", _lightningVerticalNavigationSection, {
        props: {
          "label": "Packages"
        },
        key: 21
      }, api_iterator($cmp.packages, function (item) {
        return api_custom_element("lightning-vertical-navigation-item-icon", _lightningVerticalNavigationItemIcon, {
          props: {
            "label": item.packageName,
            "name": item.key,
            "iconName": "utility:open_folder"
          },
          key: api_key(23, item.key)
        }, []);
      }))])]), $cmp.hasVisibleComponents ? api_element("div", {
        classMap: {
          "components-list": true,
          "slds-scrollable_y": true,
          "slds-grow": true,
          "slds-p-left_x-large": true,
          "slds-p-right_small": true
        },
        key: 25
      }, [api_element("h3", {
        classMap: {
          "components-list-label": true,
          "slds-text-body_small": true,
          "slds-m-vertical_small": true
        },
        key: 26
      }, [api_dynamic($cmp.componentsListLabel)]), api_element("ul", {
        classMap: {
          "slds-m-vertical_small": true
        },
        key: 27
      }, api_iterator($cmp.components, function (item) {
        return api_element("li", {
          classMap: {
            "list-item": true,
            "slds-truncate": true
          },
          key: api_key(29, item.url)
        }, [api_element("a", {
          attrs: {
            "href": api_scoped_frag_id(item.url),
            "title": item.htmlName
          },
          key: 30
        }, [api_dynamic(item.htmlName)])]);
      }))]) : null, !$cmp.hasVisibleComponents ? api_element("div", {
        classMap: {
          "slds-grid": true,
          "slds-grid_vertical-align-center": true,
          "slds-grid_align-center": true,
          "slds-grow": true
        },
        key: 32
      }, [api_element("div", {
        classMap: {
          "slds-illustration": true,
          "slds-illustration_large": true
        },
        key: 33
      }, [api_element("img", {
        classMap: {
          "slds-illustration__svg": true
        },
        attrs: {
          "src": "/assets/images/empty-state.svg",
          "alt": ""
        },
        key: 34
      }, []), api_element("div", {
        classMap: {
          "slds-text-longform": true
        },
        key: 35
      }, [$cmp.searchInProgress ? api_element("h3", {
        classMap: {
          "slds-text-heading_medium": true
        },
        key: 37
      }, [api_text("Component not found")]) : null, $cmp.searchInProgress ? api_element("p", {
        classMap: {
          "slds-text-body_regular": true
        },
        key: 38
      }, [api_text("No results for \""), api_dynamic($cmp.searchValue), api_text("\""), api_element("br", {
        key: 39
      }, []), api_text("Check your spelling and try again.")]) : null, !$cmp.searchInProgress ? api_element("h3", {
        classMap: {
          "slds-text-heading_medium": true
        },
        key: 41
      }, [api_text("No components")]) : null, !$cmp.searchInProgress ? api_element("p", {
        classMap: {
          "slds-text-body_regular": true
        },
        key: 42
      }, [api_text("After you start creating components,"), api_element("br", {
        key: 43
      }, []), api_text("you'll find them here."), api_element("br", {
        key: 44
      }, []), api_element("a", {
        attrs: {
          "href": "https://developer.salesforce.com/docs/component-library/documentation/lwc"
        },
        key: 45
      }, [api_text("Get to Know Lightning Web Components")])]) : null])])]) : null])])];
    }

    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];

    if (_implicitStylesheets$2) {
      tmpl$1.stylesheets.push.apply(tmpl$1.stylesheets, _implicitStylesheets$2);
    }
    tmpl$1.stylesheetTokens = {
      hostAttribute: "localdevserver-componentsPanel_componentsPanel-host",
      shadowAttribute: "localdevserver-componentsPanel_componentsPanel"
    };

    async function loadMetadata() {
      if (window.LocalDev) {
        return Promise.resolve(window.LocalDev.project);
      } else {
        return Promise.reject(new Error('project metadata not set'));
      }
    }
    async function getProjectMetadata() {
      return loadMetadata();
    }

    class ComponentsPanel extends lwc.LightningElement {
      get components() {
        if (this.componentsFilter) {
          // TODO: highlight part of search that matches
          const normalizedFilter = this.componentsFilter.replace(/-/g, '').toLowerCase();
          return this._components.filter(item => {
            const normalizedName = item.htmlName.replace(/-/g, '').toLowerCase();
            return normalizedName.includes(normalizedFilter);
          });
        }

        return this._components;
      }

      get hasComponents() {
        return this._components && this._components.length > 0;
      }

      get hasVisibleComponents() {
        return this.components.length > 0;
      }

      get componentsListLabel() {
        return this.searchInProgress ? 'Search Results' : 'All Components';
      }

      get searchDisabled() {
        return !this.hasComponents;
      }

      get packages() {
        return this._packages;
      }

      set packages(packages) {
        this._packages = packages;
      }

      get selectedPackage() {
        return this._selectedPackage;
      }

      set selectedPackage(packageId) {
        this._selectedPackage = packageId;
        this._components = this.packages.find(pkg => pkg.key === this._selectedPackage).components;
      }

      constructor() {
        super();
        this.projectName = void 0;
        this._packages = [];
        this._components = [];
        this._selectedPackage = void 0;
        this.componentsFilter = void 0;
        this.searchInProgress = void 0;
        this.searchValue = void 0;
        getProjectMetadata().then(data => {
          this.projectName = data.projectName;
          this.packages = data.packages;

          if (this.packages.length) {
            this.selectedPackage = this.packages[0].key;
          }
        });
      }

      onSearchChange(e) {
        this.componentsFilter = e.srcElement.value.toLowerCase();
        this.searchInProgress = !!e.srcElement.value;
        this.searchValue = e.srcElement.value;
      }

      clearInput(event) {
        event.preventDefault();
        event.stopPropagation();
        const input = this.template.querySelector('.search-input');

        if (input) {
          input.value = '';
          input.focus();
          input.dispatchEvent(new CustomEvent('change', {
            composed: true,
            bubbles: true,
            detail: {
              value: ''
            }
          }));
        }
      }

    }

    lwc.registerDecorators(ComponentsPanel, {
      track: {
        projectName: 1,
        _packages: 1,
        _components: 1,
        _selectedPackage: 1,
        componentsFilter: 1,
        searchInProgress: 1,
        searchValue: 1
      }
    });

    var _localdevserverComponentsPanel = lwc.registerComponent(ComponentsPanel, {
      tmpl: _tmpl$1
    });

    function stylesheet$3(hostSelector, shadowSelector, nativeShadow) {
      return ".resources-panel" + shadowSelector + " {height: 100%;}\n.header" + shadowSelector + " {border-bottom: 1px solid #dddbda;}\n.heading-text" + shadowSelector + " {line-height: 1rem;}\n.heading-text" + shadowSelector + ",.resource-heading" + shadowSelector + " {font-weight: bold;}\n.resource-heading" + shadowSelector + "::before {content: '';display: block;height: 0;width: 0;margin-top: calc((1 - 1.5) * 0.5em);}\n";
    }
    var _implicitStylesheets$3 = [stylesheet$3];

    function tmpl$2($api, $cmp, $slotset, $ctx) {
      const {
        t: api_text,
        h: api_element,
        c: api_custom_element
      } = $api;
      return [api_element("section", {
        classMap: {
          "resources-panel": true,
          "slds-card": true
        },
        key: 2
      }, [api_element("div", {
        classMap: {
          "header": true,
          "slds-grid": true,
          "slds-p-vertical_x-large": true,
          "slds-p-horizontal_large": true
        },
        key: 3
      }, [api_element("header", {
        key: 4
      }, [api_element("h2", {
        classMap: {
          "heading-text": true,
          "slds-card__header-title": true,
          "slds-truncate": true,
          "slds-text-heading_medium": true
        },
        key: 5
      }, [api_text("Resources")])])]), api_element("div", {
        classMap: {
          "slds-p-horizontal_large": true
        },
        key: 6
      }, [api_element("div", {
        classMap: {
          "resource": true,
          "slds-grid": true,
          "slds-m-vertical_x-large": true
        },
        key: 7
      }, [api_element("div", {
        classMap: {
          "slds-m-right_large": true
        },
        key: 8
      }, [api_custom_element("lightning-icon", _lightningIcon, {
        props: {
          "src": "/assets/icons/component_customization.svg#icon"
        },
        key: 9
      }, [])]), api_element("div", {
        key: 10
      }, [api_element("h3", {
        classMap: {
          "resource-heading": true,
          "slds-text-body_regular": true,
          "slds-m-bottom_xx-small": true
        },
        key: 11
      }, [api_text("Component Library")]), api_element("p", {
        classMap: {
          "slds-p-right_large": true
        },
        key: 12
      }, [api_text("The Component Library is the Lightning Components developer reference. Rapidly develop apps with our building blocks.")]), api_element("a", {
        classMap: {
          "resource-button": true,
          "slds-button": true,
          "slds-button_neutral": true,
          "slds-m-top_medium": true
        },
        attrs: {
          "href": "https://developer.salesforce.com/docs/component-library"
        },
        key: 13
      }, [api_text("More Info")])])]), api_element("div", {
        classMap: {
          "resource": true,
          "slds-grid": true,
          "slds-m-vertical_x-large": true
        },
        key: 14
      }, [api_element("div", {
        classMap: {
          "slds-m-right_large": true
        },
        key: 15
      }, [api_custom_element("lightning-icon", _lightningIcon, {
        props: {
          "src": "/assets/icons/code_playground.svg#icon"
        },
        key: 16
      }, [])]), api_element("div", {
        key: 17
      }, [api_element("h3", {
        classMap: {
          "resource-heading": true,
          "slds-text-body_regular": true,
          "slds-m-bottom_xx-small": true
        },
        key: 18
      }, [api_text("VS Code Extensions")]), api_element("p", {
        classMap: {
          "slds-p-right_large": true
        },
        key: 19
      }, [api_text("This extension pack includes tools for development on the Salesforce platform in the lightweight, extensible VS Code editor.")]), api_element("a", {
        classMap: {
          "resource-button": true,
          "slds-button": true,
          "slds-button_neutral": true,
          "slds-m-top_medium": true
        },
        attrs: {
          "href": "https://forcedotcom.github.io/salesforcedx-vscode"
        },
        key: 20
      }, [api_text("More Info")])])]), api_element("div", {
        classMap: {
          "resource": true,
          "slds-grid": true,
          "slds-m-vertical_x-large": true
        },
        key: 21
      }, [api_element("div", {
        classMap: {
          "slds-m-right_large": true
        },
        key: 22
      }, [api_custom_element("lightning-icon", _lightningIcon, {
        props: {
          "src": "/assets/icons/report_issue.svg#icon"
        },
        key: 23
      }, [])]), api_element("div", {
        key: 24
      }, [api_element("h3", {
        classMap: {
          "resource-heading": true,
          "slds-text-body_regular": true,
          "slds-m-bottom_xx-small": true
        },
        key: 25
      }, [api_text("Issues and Feedback")]), api_element("p", {
        classMap: {
          "slds-p-right_medium": true
        },
        key: 26
      }, [api_text("Visit the Github Repository to submit issues and feedback.")]), api_element("a", {
        classMap: {
          "resource-button": true,
          "slds-button": true,
          "slds-button_neutral": true,
          "slds-m-top_medium": true
        },
        attrs: {
          "href": "https://github.com/forcedotcom/lwc-dev-server-feedback/issues"
        },
        key: 27
      }, [api_text("Go to GitHub")])])])])])];
    }

    var _tmpl$2 = lwc.registerTemplate(tmpl$2);
    tmpl$2.stylesheets = [];

    if (_implicitStylesheets$3) {
      tmpl$2.stylesheets.push.apply(tmpl$2.stylesheets, _implicitStylesheets$3);
    }
    tmpl$2.stylesheetTokens = {
      hostAttribute: "localdevserver-resourcesPanel_resourcesPanel-host",
      shadowAttribute: "localdevserver-resourcesPanel_resourcesPanel"
    };

    class ResourcesPanel extends lwc.LightningElement {}

    var _localdevserverResourcesPanel = lwc.registerComponent(ResourcesPanel, {
      tmpl: _tmpl$2
    });

    function tmpl$3($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element,
        h: api_element
      } = $api;
      return [api_element("main", {
        key: 2
      }, [api_custom_element("localdevserver-layout-section", _localdevserverLayoutSection, {
        props: {
          "mainContent": true
        },
        key: 3
      }, [api_element("div", {
        classMap: {
          "slds-grid": true,
          "slds-gutters": true,
          "slds-gutters_x-small": true,
          "slds-wrap": true,
          "slds-grid_vertical-stretch": true
        },
        key: 4
      }, [api_element("div", {
        classMap: {
          "slds-col": true,
          "slds-size_1-of-1": true,
          "slds-medium-size_2-of-3": true,
          "slds-large-size_9-of-12": true
        },
        key: 5
      }, [api_custom_element("localdevserver-components-panel", _localdevserverComponentsPanel, {
        key: 6
      }, [])]), api_element("div", {
        classMap: {
          "slds-col": true,
          "slds-size_1-of-1": true,
          "slds-medium-size_1-of-3": true,
          "slds-large-size_3-of-12": true
        },
        key: 7
      }, [api_custom_element("localdevserver-resources-panel", _localdevserverResourcesPanel, {
        key: 8
      }, [])])])])])];
    }

    var _tmpl$3 = lwc.registerTemplate(tmpl$3);
    tmpl$3.stylesheets = [];

    if (_implicitStylesheets) {
      tmpl$3.stylesheets.push.apply(tmpl$3.stylesheets, _implicitStylesheets);
    }
    tmpl$3.stylesheetTokens = {
      hostAttribute: "localdevserver-home_home-host",
      shadowAttribute: "localdevserver-home_home"
    };

    class Home extends lwc.LightningElement {}

    var _localdevserverHome = lwc.registerComponent(Home, {
      tmpl: _tmpl$3
    });

    function tmpl$4($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element
      } = $api;
      return [api_custom_element("localdevserver-home", _localdevserverHome, {
        key: 2
      }, [])];
    }

    var html = lwc.registerTemplate(tmpl$4);
    tmpl$4.stylesheets = [];
    tmpl$4.stylesheetTokens = {
      hostAttribute: "webruntimegenerated-view__home_view__home-host",
      shadowAttribute: "webruntimegenerated-view__home_view__home"
    };

    var view__home = {
      "html": html,
      "attributes": cmp => ({})
    };

    return view__home;

});
