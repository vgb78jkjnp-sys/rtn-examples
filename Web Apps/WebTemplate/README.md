# WebTemplate

React and Vite frontend for the PA MES WebTemplate application.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_API_BASE_URL` to the backend origin used for local development.
3. Start the backend API and then run `npm run dev`.

The frontend calls the API origin directly in development so Windows-authenticated requests resolve against the backend instead of going through the Vite dev server.

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint.

## IIS deployment

The production build uses relative API URLs, so when the frontend and API are served from the same IIS site no frontend code change is required.

- `public/web.config` adds an IIS rewrite rule so client-side routes such as `/webtemplate/operation` are rewritten to `index.html`.
- Requests under `/api/` are excluded from the SPA rewrite so backend endpoints continue to resolve normally.
- Windows Authentication must still be configured on the API side so `/api/<api project>service/auth-status` returns the authenticated user.

## Reusable API JSON response parser
Usage:
import parseCommandApiResponse from '../utils/parseApiResponse';

const parsed = parseApiResponse(apiResponse);

// Single-row datasets are flattened to an object
parsed.data.WORKORDER.PartNumber;        // "810-0297-203"
parsed.data.WORKORDER.SapProdOrder;      // "000102865435"

// Multi-row datasets stay as arrays
parsed.data.WORKORDEROPERATION[0].OperationId;
parsed.data.PARTNUMBER.length;

// Helpers
parsed.getValue('WORKORDER', 'EwoId');   // 3211
parsed.getRows('WORKORDEROPERATION');    // always returns an array

## Setup a new application using this web template project

1. Update application.config.js
  - Replace applicationId, preferably the repo name in lowercase, ex. webtemplate
  - Replace applicationName, preferably the repo name, ex. WebTemplate
  - Replace applicationRoles with the title of the application, ex
  - Add user roles to applicationRoles
  - Replace the icon of the application by changing the icon.name

2. Rename webtemplate-pipeline-trigger.yml to <applicationid>-pipeline-trigger.yml
  - Replace TriggerRepoName=WebTemplate to TriggerRepoName=<applicationName>
  - Replace applicationFolder=WebTemplate to applicationFolder=<applicationName>

3. Update package.json and package-lock.json name property with <applicationId>

4. Type "npm ci" in the terminal to rebuild libraries

5. Add new page under /src and then update the main.jsx route accordingly

6. Type "npm run dev" in the terminal to run the application

## Publishing project to Azure for the first time

1. Go to https://dev.azure.com/PaMesSW/Web%20Apps/_git/ and click New Repository. For example MyProjectName

2. Navigate to the Repos tab and copy the Git Remote URL

3. Open your React app folder in Visual Studio or VS Code

4. Open the integrated terminal and initialize Git, commit your files, and push them to your Azure Repo

git init
git add .
git commit -m "Initial React commit"
git remote add origin <YOUR_AZURE_DEVOPS_REPO_URL>
git push -u origin --all
