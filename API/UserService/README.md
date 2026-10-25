# RTN UserService

The project is built using .NET 8 and **RTN.Framework** to enforce modularity and separation of concerns. The project is structured 
in a way that allows for easy maintenance and scalability. The API endpoints are designed to be RESTful and follow best practices for API development. 
Overall, this project serves as a backend for the WOOC application but can be used by other applications needing access to user authentication and management, 
providing necessary data for its functionality.

App_Data: This folder contains the data models and database context for the application. It defines the structure of the database and how the 
application interacts with it. It includes classes that represent the entities in the database and the context class that manages the database 
connection and operations. 

This project can be used as a template for building similar applications that require a backend API to manage data and provide endpoints for 
client applications. It can be extended with additional features and functionality as needed, making it a versatile solution for various use cases. 
The only change needed to use this project for a different application would be to modify the data models (App_Data appCommands.xml and xxxxBean.xml) 
and API endpoints (User	Controller.cs) to fit the specific requirements of the new application.

Existing Issue:
You cannot define an actionname with plurarization conflict within the same transactionname. e.g. you cannot define GET_BY_PN and GET_BY_PNS 
within the same transaction. This will be addressed in future releases

Endpoints:
Method	Path			Auth	Description
GET		/{commandId}	No		Run a read command (no body)
POST	/{commandId}	No		Run a command with a JSON body
GET		/auth-status	Yes		Returns auth status, user name, and environment
POST	/login			No		Authenticate with credentials

Request Body:
{
  "userId": "string",
  "password": "string"
}

Success Response:
{
  "userId": "...",
  "firstName": "...",
  "lastName": "...",  
  "email": "...",
  "roles": "...",
  "status": "..."
}

## Run locally

Requires `RTN.Framework` on the local feed (`rtn-samples/SharedPackages`). Pack `RTN.Framework` in Release if the package is missing.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run.ps1
```

Or: `dotnet restore --configfile NuGet.config` then `dotnet run --launch-profile http`.