# Finleap-Connect
Finleap connect Org

# Change Log
    - 14-04-2020 : Adding Record Type filter to all opportunity validation rules
                   Metadata Affected
                   1. Validation Rule
                   2. Custom Metadata


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
