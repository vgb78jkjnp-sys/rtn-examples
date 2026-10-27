# ApiTemplateService

The project is built using .NET 8 and an in-house data framework to enforce modularity and separation of concerns. The project is structured 
in a way that allows for easy maintenance and scalability. The API endpoints are designed to be RESTful and follow best practices for API development. 
Overall, this project serves as a backend for the WOOC application but can be used by other applications needing access to Work Oders, 
providing necessary data for its functionality.

App_Data: This folder contains the data models and database context for the application. It defines the structure of the database and how the 
application interacts with it. It includes classes that represent the entities in the database and the context class that manages the database 
connection and operations. 

This project can be used as a template for building similar applications that require a backend API to manage data and provide endpoints for 
client applications. It can be extended with additional features and functionality as needed, making it a versatile solution for various use cases. 
The only change needed to use this project for a different application would be to modify the data models (App_Data appCommands.xml and xxxxBean.xml) 
and API endpoints (WorkOrderController.cs) to fit the specific requirements of the new application.

Existing Issue:
You cannot define an actionname with plurarization conflict within the same transactionname. e.g. you cannot define GET_BY_PN and GET_BY_PNS 
within the same transaction. This will be addressed in future releases


## Setup a new Rest API project using this template

ApplicationId should be lowercase and without spaces. e.g. "travelerservice" for Traveler API.
ApplicationName should be mixed case and without spaces. e.g. "TravelerService" for Traveler API.

1. Open Program.cs and replace all occurrences of "apitemplateservice" to your new project name <ApplicationId>. e.g. logFileName = "travelerservice.log" for Traveler API.

2. Open Dockerfile and replace all occurences of "ApiTemplateService" to your new project name <ApplicationName>. e.g. "TravelerService" for Traveler API.

3. Open appsettings.Development.json and replace all occurences of "apitemplateservice" to your new project id <ApplicationId>. e.g. "travelerservice" for Traveler API.

4. Open apitemplateservice-pipeline-trigger.yml and replace all occurences of "ApiTemplateService" to your new project name <ApplicationName>. e.g. "TravelerService" for Traveler API.
   Rename the file to <ApplicationId>-pipeline-trigger.yml. e.g. "travelerservice-pipeline-trigger.yml" for Traveler API.

5. Open ApiTemplateController.cs and replace all occurences of "ApiTemplateService" to your new project name <ApplicationName>. e.g. "TravelerService" for Traveler API.
   Rename the file to <ApplicationName>Controller.cs. e.g. "TravelerServiceController.cs" for Traveler API.

6. Open HealthCheckController.cs and replace all occurences of "ApiTemplateService" to your new project name <ApplicationName>. e.g. "TravelerService" for Traveler API.

7. Update the data models in App_Data folder (appCommands.xml and xxxxBean.xml) to fit the specific requirements of the new application.
   
