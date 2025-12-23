# Tampermonkey

Tampermonkey is a special extension available for all browsers that helps run scripts inside certain websites. This folder contains the logic and components for generating Tampermonkey-compatible scripts automatically, instead of doing it by hand.

It is important to mention that the files in `tampermonkey/output/scripts/` must exist even if they are nearly full copies of the original scripts from `src/scripts/`, because it is convenient to install and update them using the GitHub raw link for the Tampermonkey script. These files are also automatically generated when running `make` from the root of the codebase, so no worries.

For more information, read [CONTRIBUTING.md](CONTRIBUTING.md) in the root of the project, where the section `Create New Plugin` describes how to create a new plugin and make it Tampermonkey compatible.


## Build

To build the scripts for Tampermonkey, just run the command below. It combines the scripts from `tampermonkey/metadata/[NAME]-plugin` and `src/scripts/[NAME]-plugin.js` into one file under the folder `/tampermonkey/output/scripts/`. For additional information, you can read the `Makefile`.

```bash
make
```
