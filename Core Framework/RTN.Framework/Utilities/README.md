# RTN.Framework.Utilities
A .NET Standard 2.0 class library for utility functions and helpers. This project is intended to be packaged as a NuGet package.

The .NET Standard 2.0 target ensures compatibility with a wide range of .NET platforms, including .NET Core, .NET Framework, and Xamarin.

This project includes various utility functions and helpers that can be used across different .NET applications. The specific utilities included in this library will depend on the needs of the project and may include functions for string manipulation, date and time handling, file operations, and more.

This project is designed to be easily extensible, allowing developers to add new utility functions as needed. The goal is to provide a centralized location for commonly used utility functions that can be easily shared across different projects and applications.

This project is intended to be used as a reference for developers looking to create their own utility libraries or as a starting point for building a more comprehensive utility library. It is not intended to be a complete solution for all utility needs, but rather a collection of useful functions and helpers that can be easily integrated into other projects.

This project can be built and published as a NuGet package, making it easy to distribute and use in other projects. The package can be published to the NuGet Gallery or a private NuGet feed, depending on the needs of the project.

This project can be used in a variety of applications, including web applications, desktop applications, and mobile applications. The utility functions included in this library can help developers save time and effort by providing commonly used functionality that can be easily integrated into their projects.

This project can be injected into other projects as a dependency, allowing developers to easily access the utility functions and helpers included in this library. This can help improve code reuse and reduce the amount of duplicate code across different projects.

Supported .NET Framework Versions 
•	.NET Framework 4.6.1 and above support .NET Standard 2.0 (with 4.7.2+ recommended for best compatibility).
•	.NET Framework 4.8 and 4.8.1 fully support .NET Standard 2.0 libraries.
•	All modern .NET versions (.NET Core 2.0+, .NET 5+, .NET 6+, .NET 7+, .NET 8+) support .NET Standard 2.0 libraries.

Included utilities
------------------
This repository includes a few concrete utility classes you can use directly:

- `FileUtilities` — common file operations (move, delete, list files).
- `FolderUtilities` — create, delete, and rename folders.
- `TextFileWriter` — simple helper to append or write text files.

Example: create a folder and write a file

```csharp
var folderUtil = new RTN.Framework.Utilities.FolderUtilities();
folderUtil.CreateFolder("C:\\temp\\myapp");

var fileUtil = new RTN.Framework.Utilities.FileUtilities();
fileUtil.MoveFile("C:\\temp\\in.txt", "C:\\temp\\myapp\\in.txt");
```

These helpers are lightweight and intended for common tasks; they throw `IOException` or `DirectoryNotFoundException` on failure so callers can handle errors consistently.
