# Finleap-Connect
Finleap connect Org

# Functionality 

1. Opportunitys are private shared with users based on role and profile
    Metadata
    a. roles
    b. sharing settings
    c. profile
2. User who dont have access to Opportunity can view limited fileds via Global Opportunity component
    Metadata
    a.field set
    b.apex
    c.aura component
3. User who dont have access to Activity can view limited fileds via Global activity component
    Metadata
    a.field set
    b.apex
    c.aura component
4. User cannot delete file 
    Metadata
    a.trigger
    b.apex
5. on change ot account or opportunity owner, respective team memebers are not lost
    Metadata
    a.trigger
    b.apex
6. Custom Component to upload files that has preconfigred options retrived from custom metadata.
    Metadata
    a.apex
    b.Custom metadata
    c.aura component
7. User cannot upload file from standard upload button. for specifed object
    a.custom label
    b.trigger
    c.apex
    d.custom field
8. Alert Component for opportunity page shows all open opponrtunities of same account 
    a.apex
    b.aura component
    c.custom metadata
    d.flexi page

# Change Log
    - 14-04-2020 :  Adding Record Type filter to all opportunity validation rules
                    Metadata Affected
                    1. Validation Rule
                    2. Custom Metadata
    - 05-04-2020 :  Adding Record Type filter to all opportunity process builder 
                    Adding Roles
                    Metadata Affected
                    1. Process builder
                    2. Roles
    - 16-04-2020 :  Rearranging Roles and sharing rules of opportuntiys
                    Metadata Affected
                    1.Roles
                    2.Sharing rules
    - 19-04-2020 :  Adding Global Related List,Global Activity Timleine,Restriction on delete opration on 
                    files,Preserve team member on change or owner for account and opportuntiy
                    Metadata Affected
                    1.Apex
                    2.Trigger
                    3.Aura Component
                    4.Page Layout
                    5.Flexi Page
                    6.Custom metadata
                    7.Custom Label
    -21-04-2020 : Adding opportunity report type filter to reprts
                    Metadata affected
                    1.reports
    -21-04-2020 : Adding Related Attachments component and its respective configuration
                    Metadata Affected
                    1.Apex
                    2.Trigger
                    3.RecordType
                    4.FlexiPage
                    5.Layout
                    6.Custom Filed
                    7.Custom Metadata
                    8.Custom Label
    -22-04-2020 : Adding Opportunity Alert component and its respective configurations
                    Metadata Affected
                    1.Apex
                    2.Aura Component
                    3.Flexi Page
                    4.Custom Metadata



# Commands
## Fetch Metadata
sfdx force:source:retrieve -x ./manifest/package.xml 

## Deploy
### Convert to Metadata
sfdx force:source:convert -d metadata
### Deploy to Org
sfdx force:mdapi:deploy -d metadata  
### Check Status
sfdx force:mdapi:deploy:report 
