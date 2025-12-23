# Extension

This folder contains all the code for generating extensions for both Firefox and Chrome (not for Safari). The `./src/` folder contains all source files for Firefox and Chrome, and the `./output/` folder contains the final extensions compatible with each browser. Read more about contributing or making changes in [CONTRIBUTING.md](CONTRIBUTING.md) in the root of the project.

## Manifest Type Problem

Why do we use different manifests for Chrome and Firefox? Because we need a background worker. Manifest v3 is developed by Chrome, and Firefox hasn't embedded v3 background workers yet. Why not use Manifest v2? Because Chrome doesn't support v2, so it would be impossible to load any extension.

Read more: [https://stackoverflow.com/questions/75043889/manifest-v3-background-scripts-service-worker-on-firefox#75203925](https://stackoverflow.com/questions/75043889/manifest-v3-background-scripts-service-worker-on-firefox#75203925)
