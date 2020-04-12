:: This batch file is for windows os for deploying to scratch org
@ECHO OFF
ECHO ============================
ECHO Getting All Trigger
ECHO ============================
call  sfdx force:source:retrieve -m ApexTrigger
ECHO ============================
ECHO Getting All Apex
ECHO ============================
call  sfdx force:source:retrieve -m ApexClass
ECHO ============================
ECHO Getting All Lighting Components
ECHO ============================
call  sfdx force:source:retrieve -m AuraDefinitionBundle
