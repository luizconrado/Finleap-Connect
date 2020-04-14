# Finleap-Connect
Finleap connect Org

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
