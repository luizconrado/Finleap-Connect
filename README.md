# Finleap-Connect
Finleap connect Org

# Change Log
    - 14-04-2020 : Adding Record Type filter to all opportunity validation rules
                   Metadata Affected
                   1. Validation Rule
                   2. Custom Metadata
    - 05-04-2020 : Adding Record Type filter to all opportunity process builder 
                   Adding Roles
                   Metadata Affected
                   1. Process builder
                   2. Roles
    - 16-04-2020 : Rearranging Roles and sharing rules of opportuntiys
                    Metadata Affected
                    1.Roles
                    2.Sharing rules


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
