# PSMS Project DevOps/Ops

AusPayNet have created the PSMS project to run in Azure DevOps and be hosted via Azure App Services.
This is to run in Azure App Services and use the Azure DevOps to both run a pipeline for building from a private github repo and run the releases to dev (with each build), UAT via the release pipeline and prod via the release pipeline.
Each environment has a separate environment variable called "environment" which has the value of nothing (dev), uat or prod.
This allows Simon to configure the environment for each separate environment.

### Github

Github has been set up as a standard private repo with 2FA; Simon having the Google Authenticator access and Jack having the SMS backup access.\
The username is auspaynet. The repository is auspaynet/psmsproject.

### Pipelines

Node Version: Node 14-lts\
OS Version: ubuntu-latest\
Package type: Zip\
\
There is currently one pipeline for the project which builds the main branch automatically on commit.
It will package the frontend code and place it in the build folder of the backend and then build the backend and package the entire application into a zip called psms-dev-&lt;date&gt;.&lt;buildnum&gt;-&lt;branch&gt;/psms-.zip.

This is only auto-triggered for the main branch but can be manually triggered for any branch or commit id via the AusPayNetPSMS/PSMS/Pipelines/auspaynet.psmsproject pipeline by clicking Run pipeline (top right) and selecting the branch in the dropdown, a commit id can also be entered to build an old version etc.

The artifacts are published for each build and retained for 30 days, however if a version is tagged it can be rebuilt forever afterwards using the manual process.

### Releases

Deploying OS: Win Server 2019\
Target: Web App on Linux (Azure App Service)\
Node Version: Node 14-lts

A release for UAT or PROD is created manually by running the AusPayNetPSMS/PSMS/Pipelines/Releases/UAT or PROD release pipeline.
This deployment is performed on a windows server machine but the target is the Web App on Linux.
To do this see procedures below.

From what I've seen it takes about 10 minutes for Azure to get the process completed.
Be aware - creating the release does not perform the deployment, if you merely create the release the deployment will never happen.

### App Service Plans

The app services and slots need a plan to pay for the usage. There are currently two ASPs, ASP-PSMSDEV-bdda (for dev and uat) and ASP-psms-prod-main-a60a (for prod).

Unfortunately due to the need for slots for a release pipeline for UAT this requires at least an S1 plan otherwise I could've chosen basic/free tier.

Production is also set to an S1 plan.

The two of these are ~$120/m each for a total of ~$240/m.

### App Services

App Services: psms-dev-main (the app service itself or primary and uat deployment slots), psms-prod-main (prod app service or primary and a prod deployment slot)

Every time there's a git commit the pipeline is run which builds the app and deploys it to the app service on psms-dev-main.
The release pipeline for UAT deploys to the psms-dev-main/uat slot.

The release pipeline for prod deploys to the psms-prod-main-psms-prod-main, this then has to be swapped to the be the app service itself which is done by going to the psms-prod-main app service, Deployment/Deployment slots in the left menu, clicking Swap at the top and then clicking Swap in the pane on the right to accept the swap.

This will take the current production app service and swap it for the newly deployed production slot.
Traffic values can also be altered in the Deployment slots screen to perform A/B testing i.e. 5% of traffic goes to the newly deployed slot to ensure it won't break etc.

Additional environment variables can be added if required with other data such as db connection strings and keys or key file locations to each app service and slot.

Going to the external address i.e. https://psms-prod-main.azurewebsites.net will forward the traffic to the primary and not to any of the slots. You may go to the slot directly by using the slot's address.

### Databases

There are currently two separate database servers; psmsdevdbserver and psmsproddbserver. These contain several databases each;\
dev - PSMS_DEV_DB and psmsuatdbserver\
prod - psmsproddb\
These have been separated again to separate the dev/uat/test traffic from prod to avoid issues.
The prod db should be maintained as a separate production database with a strong password and strict user security etc.
The prod username/pw I have already emailed to Simon, Nikhil, Peter and Ivan.
This should probably be changed to ensure myself and Ivan no longer have access.

### Procedures
#### Commits/Builds
Use git commits as normal and the build pipeline will auto-trigger and produce an artifact or fail with a reason which is visible in the devops pipeline.
#### Dev Release
Automatically deployed via git commits and the build pipeline to psms-dev-main app service primary.
#### Prod/Uat Release
1. Log in to the Azure Portal
2. Go to Azure DevOps PSMS Project/PSMS
3. In the left menu select Pipelines/Releases
4. Select either UAT or PROD Release
5. Click the blue Create release button at the top right
6. In the Create a new release pane 
   1. Select the stage (Prod Release or uat)
   2. Select the artifact (defaults to latest)
   3. Add a Release description if required
   4. Click Create
7. Click on the previously created Release
8. Hover over the Stage (Prod Release or uat) and click Deploy
9. Hover over the stage and click Logs to see the progress
10. Watch green ticks should appear next to Initialize Job, Download artifact, Deploy Azure App Service to Slot and Finalize Job as each completes - estimated time ~7-10mins.
11. FOR PROD ONLY Once the deployment succeeds go to Azure Portal
12. Go to the App Service psms-prod-main
13. Go to Deployment/Deployment slots in the left menu
14. Two options here
    1. Select Swap to change the newly deployed slot to be the primary
    2. Increase the traffic percentage to the deployment slot to test if there are any failures with a small amount of traffic before increasing it to 100%
15. Wait for azure to swap slots and test

Be aware - creating the release (step 5) does not perform the deployment (step 7), if you merely create the release the deployment will never happen.\
The prod deployment slot should always be swapped to become the primary unless it has problems in which case the slot can be redeployed with a fixed release at a later time.

#### Updating environment variables
1. Go to Azure Portal
2. Go to the relevant App Service or Slot
3. Go to Settings/Configuration
4. Change whichever setting you need to change
