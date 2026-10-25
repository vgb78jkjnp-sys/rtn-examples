# RTN PartService

Backend service for the Part Master SPA.

## Local build

Uses **RTN.Framework** from the rtn-samples local feed (`..\..\SharedPackages`). If restore fails with **NU1101**, pack `RTN.Framework` in Release or ensure `RTN.Framework.*.nupkg` is in `SharedPackages`.

```powershell
powershell -ExecutionPolicy Bypass -File scripts\restore-nuget.ps1
```

### Local development (Debug)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build-debug.ps1
```

Or run directly:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\run.ps1
```

Output: `bin\Debug\net8.0\` — API at `http://localhost:5299/api/partservice`.

### Release (IIS deploy)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build-release.ps1
```

Output: `bin\Release\net8.0\`.
