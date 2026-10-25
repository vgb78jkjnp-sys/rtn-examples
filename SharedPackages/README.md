# SharedPackages

Local NuGet feed for rtn-samples. Place package `.nupkg` files in this folder root (for example `RTN.Framework.1.0.0-alpha.4.nupkg`).

`RTN.Framework` Release pack copies packages here automatically.

Restore API projects with each project's `NuGet.config`, which references `..\..\SharedPackages`.
