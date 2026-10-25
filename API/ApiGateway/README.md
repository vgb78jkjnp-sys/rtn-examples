# RTN - API Gateway

This project is an API Gateway for RTN REST applications. It serves as a centralized entry point for various 
microservices, providing routing, authentication, and other essential functionalities. It is designed to facilitate communication between clients and 
backend services, ensuring secure and efficient data exchange. This gateway is intended for local development and testing purposes, enabling developers 
to run and interact with multiple REST API projects simultaneously. 

Any new microservice can be easily integrated into the gateway by adding its configuration to the `appsettings.Development.json` file. The gateway will 
automatically detect and route requests to the appropriate service based on the defined endpoints.

## Run locally

From this folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run.ps1
```

Or: `dotnet run --launch-profile http` (gateway listens on `http://localhost:5291`).
