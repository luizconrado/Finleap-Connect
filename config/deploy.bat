:: This batch file is for windows os for deploying to scratch org
@ECHO OFF
ECHO Depolying to default scratch org.
ECHO ============================
ECHO Converting to  Meatadata
ECHO ============================
call  sfdx force:source:convert -d metadata 
ECHO ============================
ECHO Deploying Meatadata to scracth
ECHO ============================
call  sfdx force:mdapi:deploy -d metadata 
ECHO ============================
ECHO Report
ECHO ============================

@echo OFF
FOR /L %%y IN (0, 1, 3,4,5) DO ( 
call sfdx force:mdapi:deploy:report 
TIMEOUT /T 30
)
PAUSE


PAUSE