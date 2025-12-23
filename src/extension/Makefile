# ----- Defining Variables -----

OUTPUT_PATH := ./output

COMPATIBLE_SOURCE_PATH := $(OUTPUT_PATH)/src
CHROME_SOURCE_PATH := $(OUTPUT_PATH)/chrome-source
FIREFOX_SOURCE_PATH := $(OUTPUT_PATH)/firefox-source

CHROME_MANIFEST_FILENAME := manifestChrome.json
FIREFOX_MANIFEST_FILENAME := manifestFirefox.json

ORIGINAL_SCRIPTS_DIRECTORY := ../scripts
COMPATIBLE_SCRIPTS_DIRECTORY := $(COMPATIBLE_SOURCE_PATH)/scripts

CHROME_EXTENSION_ARCHIVE_NAME := chromeExtension.zip
FIREFOX_EXTENSION_ARCHIVE_NAME := firefoxExtension.zip


# Defining that these are not files just targets
.PHONY: all compatible-source-setup chrome firefox clean



# ----- Defining Targets -----

# This script will build both for chrome and firefox and
# as executables we will get .zip archives.
all: clean chrome firefox

# Setups source part which is compatible yet
compatible-source-setup: 
	# Ensuring output directory exists
	mkdir -p $(OUTPUT_PATH)

	# Ensuring source directory exists to copy there source files
	mkdir -p $(COMPATIBLE_SOURCE_PATH)

	# Copying all source files there and then removing unnecessary files
	cp -r ./src/* $(COMPATIBLE_SOURCE_PATH) 

	# Removing not compatible or automatically generated files
	rm -rf $(COMPATIBLE_SOURCE_PATH)/scripts

	# Generating scripts
	mkdir -p $(COMPATIBLE_SCRIPTS_DIRECTORY)
	cp $(ORIGINAL_SCRIPTS_DIRECTORY)/* $(COMPATIBLE_SCRIPTS_DIRECTORY)/ 


# Generating source and archive for chrome
chrome: compatible-source-setup
	# Creating chrome specific source path
	mkdir -p $(CHROME_SOURCE_PATH)

	# Copying compatible source to chrome source path
	cp -r $(COMPATIBLE_SOURCE_PATH)/* $(CHROME_SOURCE_PATH)/

	# Setupping manifest specific for chrome
	cp $(CHROME_SOURCE_PATH)/$(CHROME_MANIFEST_FILENAME) $(CHROME_SOURCE_PATH)/manifest.json

	# Cleaning manifests that are not needed
	rm $(CHROME_SOURCE_PATH)/$(CHROME_MANIFEST_FILENAME)
	rm $(CHROME_SOURCE_PATH)/$(FIREFOX_MANIFEST_FILENAME)
	
	# Generating archive
	cd $(CHROME_SOURCE_PATH) && zip -r ../../$(OUTPUT_PATH)/$(CHROME_EXTENSION_ARCHIVE_NAME) . 


# Generating source and archive for firefox 
firefox: compatible-source-setup
	# Creating firefox specific source path
	mkdir -p $(FIREFOX_SOURCE_PATH)

	# Copying compatible source to firefox source path
	cp -r $(COMPATIBLE_SOURCE_PATH)/* $(FIREFOX_SOURCE_PATH)/

	# Setupping manifest specific for firefox 
	cp $(FIREFOX_SOURCE_PATH)/$(FIREFOX_MANIFEST_FILENAME) $(FIREFOX_SOURCE_PATH)/manifest.json

	# Cleaning manifests that are not needed
	rm $(FIREFOX_SOURCE_PATH)/$(CHROME_MANIFEST_FILENAME)
	rm $(FIREFOX_SOURCE_PATH)/$(FIREFOX_MANIFEST_FILENAME)
	
	# Generating archive
	cd $(FIREFOX_SOURCE_PATH) && zip -r ../../$(OUTPUT_PATH)/$(FIREFOX_EXTENSION_ARCHIVE_NAME) . 

# Cleaning output
clean: 
	rm -rf $(OUTPUT_PATH)
	
