# APIWORKSPACE

A lightweight, Git-friendly API collection built with **Bruno** inside VS Code. Requests are stored as plain `.yml` files and version-controlled alongside your code.

## Prerequisites

Install the **Bruno** VS Code extension before opening this collection:

- **Extension:** Bruno API Client
- **Marketplace:** https://marketplace.visualstudio.com/items?itemName=bruno-api-client.bruno

Install the **Pretty XML** VS Code extension to format XML data

## Project Structure

```
opencollection.yml          # Bruno collection root
environments/
    Development.yml         # http://PA-MFGWEB-Dev3:8090
    Localhost.yml           # http://localhost:5291
    Production.yml          # http://PA-MFGSCPT-PRD1:8090
auth/                       # Authentication endpoints
fma/                        # FMA endpoints
print/                      # Print endpoints
traveler/                   # Traveler endpoints
users/                      # User endpoints
workorder/                  # Work Order endpoints
    Get Work Order Numbers.yml
mrsi/                       # MRSI endpoints
sapinterface/               # SAP Interface endpoints
part/                       # Part endpoints
    GETPARTMASTERROWS.yml
    GETPARTASSEMBLYTREEBYVENDORLOT.yml
```

## How to Run Requests

1. Open this folder in VS Code.
2. The Bruno extension will detect `opencollection.yml` and display the collection in the **Bruno** side panel.
3. Select a request from the panel (e.g., `workorder > Get Work Order Numbers`).
4. Choose an environment from the environment selector at the top of the Bruno panel.
5. Click **Send** to execute the request and view the response.

## Switching Environments

Three environments are pre-configured via the `environments/` folder:

| Environment | Host |
|---|---|
| Local | `http://localhost:5291` |
| Development | `http://PA-MFGWEB-Dev3:8090` |
| Production | `http://PA-MFGSCPT-PRD1:8090` |

Select the active environment from the Bruno panel's environment dropdown before sending a request.

## Security Note

**Never commit sensitive credentials (API keys, passwords, or production tokens) to Git.** Use Bruno's secret variable support or keep tokens in a local environment file excluded from source control.
