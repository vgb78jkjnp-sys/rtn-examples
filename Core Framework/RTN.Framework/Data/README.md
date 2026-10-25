# RTN.Framework.Data
A .NET Standard 2.0 class library for data access. This project is intended to be packaged as a NuGet package.

This project contains the data access layer for the RTN.Framework. It provides a set of classes and interfaces 
for interacting with databases, including repositories, unit of work, and data context. The goal is to abstract away 
the details of data access and provide a clean and consistent API for working with data in the application.

This implementation is a solid foundation for handling WinForms, ASP.NET Core, and mobile applications, with a few considerations:
Why it works well:
•	Separation of Concerns: The data access logic is decoupled from UI and web layers. Both JSON and dynamic object 
    outputs are supported, making it flexible for different consumers.
•	Thread Safety: The static _commands dictionary is only written once at startup, so it is safe for concurrent reads 
    in typical usage scenarios.
•	Extensibility: You can easily add more output types or extend command/action mapping logic as needed.
•	Reusability: The same data access layer can be used across WinForms, ASP.NET Core, and mobile (Xamarin/MAUI) projects.
Considerations for Each Platform:
•	WinForms:
•	Use the dynamic/object output for direct data binding or manipulation.
•	Use JSON if you want to log or display raw results.
•	ASP.NET Core:
•	Use the dynamic/object output for further processing, then return as JSON from your API controller.
•	The async methods are suitable for web scalability.
•	Mobile (Xamarin/MAUI):
•	Use the dynamic/object output for in-app logic.
•	If you need to persist or transmit data, you can serialize to JSON.
•	Dependency Injection: Register ICommandExecutor and IXmlDbExecutor in your DI container for ASP.NET Core and mobile apps.

•	Error Handling: Consider more granular exception types for better error reporting in UI/web/mobile layers.
•	Thread Safety: If you ever plan to reload commands at runtime, add locking or use ConcurrentDictionary.

@@ Example Usage:
dynamic result = await executor.ExecuteCommandDynamicAsync([CommandId], [paramValues]);
var firstRow = result.Data[0];
 result.Data[0]["name"] works for dictionaries or JSON objects.
 Use result.Data[0].name for dynamic/anonymous types

@@ Return JSON Responses:
Successful command execution
{
  "Status": "success",
  "Message": null,
  "Data": {
    "id": 123,
    "name": "John Doe",
    "address": "Allentown, PA"
  }
}
Failed command execution
{
  "Status": "error",
  "Message": "Command 'invalidCommandId' not found in AppCommands.xml.",
  "Data": null
}

The dynamic object will have the properties: Status, Message, and Data, 
matching the JSON structure, but as a C# object.
new {
    Status = "success", // or "error"
    Message = null,     // or error message string
    Data = new {
        id = 123,
        name = "John Doe",
        address = "Allentown, PA"
    }
}

Each project consuming this data access layer will need to reference this assembly and ensure that the App_Data/AppCommands.xml and 
App_Data/BEAN-INF/xxxxBean.xml files exists in their project structure. The XML files should be set to copy to the output directory 
so that they are available at runtime. Below is an example of how to set up the XML files in a typical project:

- MyProject
  - App_Data
    - AppCommands.xml
    - BEAN-INF
      - UserBean.xml
      - ProductBean.xml
  - MyProject.csproj

Sample AppCommands.xml:
<?xml version="1.0" encoding="utf-8" ?>
<COMMANDS>
	<COMMAND id="GETWORKORDERNUMBERS" transactiontype="WRITE" outputtype="" viewid="" comment="" >
		<ACTION id="1" beanname="WORKORDERBEAN" transaction="WORKORDER" action="READ_DATA_BY_WORKORDER_NUMBER" />
		<ACTION id="2" beanname="WORKORDERBEAN" transaction="WORKORDERPARAMETRICS" action="READ_BY_WORKORDER_NUMBER" />
	</COMMAND>
</COMMANDS>

Sample Bean XML (WorkOrderBean.xml):
<?xml version="1.0" encoding="utf-8" ?>
<DATABEAN NAME="WORKORDERBEAN" DATASOURCE="Manufacturing">
	<TRANSACTIONS>
		<TRANSACTION NAME="WORKORDER">
			<ACTIONS>
				<ACTION NAME="READ_BY_WORKORDER_NUMBER" TYPE="S">
					<STATEMENT>
						select wo.WorkOrderNum,wo.PartNumber,wo.PartNumberRev,wo.RouteId,pm.EWO,wo.PartId,(select OperationId from UDF_WorkOrderOperationCurrent(wo.WorkOrderNum)) as OperationId
						from workorder wo WITH (NOLOCK)
						left join PartMaster pm WITH (NOLOCK) on pm.PartId=wo.PartId
						left join PartNumber pn WITH (NOLOCK) on pn.PartNumber=wo.PartNumber
						where wo.workordernum in @WorkOrderNumbers
					</STATEMENT>
					<PARAMETERS>
						<PARAMETER ID="1" NAME="WorkOrderNumbers" TYPE="LST"></PARAMETER>
					</PARAMETERS>
				</ACTION>
			</ACTIONS>
		</TRANSACTION>
		<TRANSACTION NAME="WORKORDERPARAMETRICS">
			<ACTIONS>
				<ACTION NAME="READ_BY_WORKORDER_NUMBER" TYPE="S">
					<STATEMENT>
						select wo.WorkOrderNum,wo.RouteId,rd.OperationNumber,rd.OperationId,roop.ParamName,roop.ParamSequence,roop.ParamType
						,case roop.ParamType
						when 'int' then CAST(woop.ParamValueInt as varchar(max))
						when 'float' then CAST(woop.ParamValueFloat as varchar(max))
						when 'varchar' then isnull(woop.ParamValueVarchar,'')
						else null
						end AS ParamValue
						from WorkOrder wo WITH (NOLOCK)
						inner join RouteDetail rd WITH (NOLOCK) on rd.RouteId = wo.RouteId
						inner join RouteOperationOutputParametrics roop WITH (NOLOCK) on roop.RouteId=wo.RouteId and roop.OperationNumber=rd.OperationNumber and roop.OperationId=rd.OperationId
						left outer join WorkOrderOperationParametrics woop WITH (NOLOCK) on woop.WorkOrderNum=wo.WorkOrderNum and woop.RouteId=roop.RouteId and woop.OperationNumber=roop.OperationNumber and woop.OperationId=roop.OperationId and woop.ParamName=roop.ParamName
						where wo.WorkOrderNum in @WorkOrderNumbers
						order by rd.Sequence,roop.ParamSequence
					</STATEMENT>
					<PARAMETERS>
						<PARAMETER ID="1" NAME="WorkOrderNumbers" TYPE="LST"></PARAMETER>
					</PARAMETERS>
				</ACTION>
			</ACTIONS>
		</TRANSACTION>

	</TRANSACTIONS>
</DATABEAN>


# Database Connection Factory Usage:
return sp.GetRequiredService<IDbConnectionFactory>()
    .Create("sqlserver", connectionString);

return sp.GetRequiredService<IDbConnectionFactory>()
    .Create("mysql", connectionString);

return sp.GetRequiredService<IDbConnectionFactory>()
    .Create("oracle", connectionString);

var mongo = sp.GetRequiredService<IDbConnectionFactory>()
    .CreateMongo(connectionString);

var client = mongo.Client;
var database = client.GetDatabase("MyDatabase");

Connection strings and encryption
-------------------------------
This library supports both plain and encrypted connection strings.

1) Plain connection string (no change):

```csharp
var conn = new MySqlConnectionImpl("Server=...;Database=...;User Id=...;Password=plainpwd;", logger);
```

2) Encrypted using the legacy `CryptorEngine` (TripleDES/MD5) shipped in this project:

```csharp
// Encrypt once (compatibility example)
string encrypted = RTN.Framework.Data.CryptorEngine.Encrypt(plainConnectionString);

// At runtime the DbConnectionBase will attempt to auto-decrypt base64-looking values using CryptorEngine.
var conn = new MySqlConnectionImpl(encrypted, logger);
```

3) DPAPI encrypted (Windows-only) using `DpapiConnectionStringDecryptor`:

```csharp
// Encrypt once on the same machine/account where it will be decrypted:
var protectedBytes = System.Security.Cryptography.ProtectedData.Protect(System.Text.Encoding.UTF8.GetBytes(plainConnectionString), null, System.Security.Cryptography.DataProtectionScope.CurrentUser);
string base64 = Convert.ToBase64String(protectedBytes);

// At runtime:
var decryptor = new RTN.Framework.Data.DpapiConnectionStringDecryptor();
var conn = new MySqlConnectionImpl(base64, logger, decryptor);
```

4) Custom decryptor via function:

```csharp
Func<string,string> myDecrypt = encrypted => MyVaultClient.Decrypt(encrypted);
var conn = new MySqlConnectionImpl(encryptedValue, logger, myDecrypt);
```

Security note: `CryptorEngine` preserves behavior from the original VB code but is not secure for new data. Prefer DPAPI, a secrets manager, or AES-GCM.


Dependency injection / Service registration
----------------------------------------
Below are concise DI registration examples you can copy into your application's `Startup` or composition root.

1) Plain connection strings (no decryptor):

```csharp
services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
services.AddSingleton<IDbExecutor>(sp =>
	new DbExecutor(
		"App_Data/BEAN-INF",
		connectionFactory: name =>
		{
			var cs = System.Configuration.ConfigurationManager.ConnectionStrings[name]?.ConnectionString;
			if (string.IsNullOrWhiteSpace(cs))
				throw new InvalidOperationException($"Connection string '{name}' was not found.");
			return sp.GetRequiredService<IDbConnectionFactory>().Create("sqlserver", cs);
		},
		logger: sp.GetRequiredService<RTN.Framework.Utilities.IRotatingLogger>()
	)
);
```

2) Explicit legacy `CryptorEngine` decryptor (compatibility):

```csharp
// helper adapter
public class FuncConnectionStringDecryptor : IConnectionStringDecryptor
{
	private readonly Func<string, string> _f;
	public FuncConnectionStringDecryptor(Func<string, string> f) => _f = f;
	public string Decrypt(string encrypted) => _f(encrypted);
}

// registration
services.AddSingleton<IConnectionStringDecryptor>(_ => new FuncConnectionStringDecryptor(s => RTN.Framework.Data.CryptorEngine.Decrypt(s)));
services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();

services.AddSingleton<IDbExecutor>(sp =>
	new DbExecutor(
		"App_Data/BEAN-INF",
		connectionFactory: name =>
		{
			var cs = System.Configuration.ConfigurationManager.ConnectionStrings[name]?.ConnectionString;
			if (string.IsNullOrWhiteSpace(cs))
				throw new InvalidOperationException($"Connection string '{name}' was not found.");
			var decryptor = sp.GetService<IConnectionStringDecryptor>();
			return sp.GetRequiredService<IDbConnectionFactory>().Create("sqlserver", cs, decryptor);
		},
		logger: sp.GetRequiredService<RTN.Framework.Utilities.IRotatingLogger>()
	)
);
```

3) DPAPI decryptor (Windows-only, recommended over legacy TripleDES):

```csharp
services.AddSingleton<IConnectionStringDecryptor, RTN.Framework.Data.DpapiConnectionStringDecryptor>();
services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();

services.AddSingleton<IDbExecutor>(sp =>
	new DbExecutor(
		"App_Data/BEAN-INF",
		connectionFactory: name =>
		{
			var cs = System.Configuration.ConfigurationManager.ConnectionStrings[name]?.ConnectionString;
			if (string.IsNullOrWhiteSpace(cs))
				throw new InvalidOperationException($"Connection string '{name}' was not found.");
			var decryptor = sp.GetRequiredService<IConnectionStringDecryptor>();
			return sp.GetRequiredService<IDbConnectionFactory>().Create("sqlserver", cs, decryptor);
		},
		logger: sp.GetRequiredService<RTN.Framework.Utilities.IRotatingLogger>()
	)
);
```

Notes:
- `DbConnectionBase` will still attempt to auto-decrypt base64-looking values with `CryptorEngine` when no decryptor is provided — this keeps compatibility but is implicit.
- Explicitly registering and passing an `IConnectionStringDecryptor` is clearer and recommended.
- For cross-platform scenarios prefer a secrets manager or platform-appropriate protector instead of DPAPI.

