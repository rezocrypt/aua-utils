# ----- Defining Variables -----

# Defining directories of original and formatted scripts
ORIGINAL_SCRIPTS_DIRECTORY := ../src/scripts
FORMATTED_SCRIPTS_DIRECTORY := ./output/scripts
METADATAS_DIRECTORY := ./metadata



# ----- Defining Targets -----

# Defining that clean and parse are targets and not files
.PHONY: build clean 

# Parsing scripts from original directory to tampermonkey scripts with adding metadata and putting into the special directory
# and from here it can be accessed using github url.
build: 
	# Ensuring formatted scripts directory
	mkdir -p $(FORMATTED_SCRIPTS_DIRECTORY)

	# Going for loop on each metadata file and combining it with script to get tampermonkey script
	@for file in $(METADATAS_DIRECTORY)/*; do \
		# Defining some variables for each script \
		NAME=$$(basename "$$file"); \
		METADATA_FILE="$$file";	\
		ORIGINAL_SCRIPT_FILE="$(ORIGINAL_SCRIPTS_DIRECTORY)/$$NAME.js"; \
		FORMATTED_SCRIPT_FILE="$(FORMATTED_SCRIPTS_DIRECTORY)/$$NAME.js"; \
		\
		# Echoing what is copied where \
		echo "[!] Processing script $$NAME: ($$METADATA_FILE, $$ORIGINAL_SCRIPT_FILE) -> $$FORMATTED_SCRIPT_FILE"; \
		\
		# First writing tampermonkey metadata to the file \
		cat "$$METADATA_FILE" > "$$FORMATTED_SCRIPT_FILE" ; \
		\
		# Then appending the actual script \
		cat "$$ORIGINAL_SCRIPT_FILE" >> "$$FORMATTED_SCRIPT_FILE" ; \
	done	

# Cleaning
clean:
	rm -rf $(FORMATTED_SCRIPTS_DIRECTORY)
	rmdir $(dir $(FORMATTED_SCRIPTS_DIRECTORY))
