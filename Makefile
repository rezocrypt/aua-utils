# Defining subdirs where are also other makefiles which this makefile needs to make
SUBDIRS := ./src/extension ./tampermonkey

# Makes sure that it doesn't treat targets as files
.PHONY: all clean $(SUBDIRS)

# Defining all target which will call for other subdirectories
all: $(SUBDIRS)

# This defines specific target for each subdir
$(SUBDIRS):
	$(MAKE) -C $@

# This one calls make clean for each target 
clean:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir clean; \
	done

