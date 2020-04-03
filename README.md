# Finleap-Connect
Finleap connect Org

# Log
    - Adding Standard and Finleap Investment Record Type To Contact,Opportunity,Task,Event,Campaing,Account
    - Adding Log__c,Trigger_Setting__mdt,Contant__mdt
    - Adding Task,Contact,Event Trigger

    - Delete Sharing Rules 
    - Removing Finleap Investment Record Type from Account,Contact,Campaing,Task,Event
    - Removing Finleap Investment Layout from Account,Contact,Campaing,Task,Event
    - Removing Task,Event Trigger




# Utility Classes
    - Constant : All Global Constant's 
    - DatabaseUtility : Utility Call to insert records
    - LoggerService : Utility Class to log errors,Exceptions to log__c object
    - RandomUtility : Utility Class to generate random number or string
    - SchemaUtility : Utillity Class to retrive schema related details
    - TriggerHandler : Virtual Class that needs to be extended by trigger handlers



# Commands
## Fetch Metadata
sfdx force:source:retrieve -x ./manifest/package.xml 

## Deploy
### Convert to Metadata
sfdx force:source:convert -d metadata
### Deploy to Org
sfdx force:mdapi:deploy -d metadata  --testlevel RunLocalTests
### Check Status
sfdx force:mdapi:deploy:report 

# Windows script to deploy
config\deploy.bat


force-app-live\main\default\reports\Sales_and_Marketing_Reports\Closed_opportunity.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Exec_Bookings_Trend.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Exec_Closed_Deals_QTD.report-meta.xml
force-app-live\main\default\reports\SalesReports\OpportunitiesOverview\Opps_by_Prio.report-meta.xml
force-app-live\main\default\reports\SalesReports\OpportunitiesOverview\New_Report_nKz.report-meta.xml
force-app-live\main\default\reports\Sales_Marketing_Reports\Win_Ratio.report-meta.xml
force-app-live\main\default\reports\Sales_Marketing_Reports\Open_Oppties_This_Q.report-meta.xml
force-app-live\main\default\reports\Sales_Marketing_Reports\Closed_Won_80_This_Q_by_Owner.report-meta.xml
force-app-live\main\default\reports\Sales_Marketing_Reports\Closed_Won_by_Type.report-meta.xml
force-app-live\main\default\reports\Sales_Marketing_Reports\Closed_Won_This_Q_by_Owner.report-meta.xml
force-app-live\main\default\reports\Sales_Marketing_Reports\Closed_Won_This_Q_by_Type.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Exec_Open_Deals.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Exec_Open_Pipeline_next_90_days.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Exec_Open_Pipeline.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Exec_Top_Closed_Deals.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Exec.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Manager_Closed_Deals.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Manager_Open_Opportunities.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Manager_Open_Pipeline.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Manager_Pipeline_Next_90_days.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Person_MTD_Sales.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Person_Open_Pipeline_by_stage.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\SP_Current_Month_Open_Pipeline.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Closed_opportunity.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Exec_Bookings_Trend.report-meta.xml
force-app-live\main\default\reports\Sales_and_Marketing_Reports\Sales_Exec_Closed_Deals_QTD.report-meta.xml