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
