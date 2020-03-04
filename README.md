# Finleap-Connect
Finleap connect Org

# Log








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
