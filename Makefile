# we have a build folder called dist, so mark it as phony to force update
.PHONY: dist

dist:
	# minify javascript from src to dist
	esbuild \
		--minify \
		--outfile=dist/littleLOOKahead.min.js \
		src/littleLOOKahead.js 
	# copy minified file to examples
	cp dist/littleLOOKahead.min.js examples/littleLOOKahead.min.js
	# copy css to examples
	cp src/littleLOOKahead.css examples/littleLOOKahead.css
	# gzip and list just to eyeball filesizes
	gzip -c dist/littleLOOKahead.min.js > dist/littleLOOKahead.gz
	ls -alh dist

prettify: 
	# prettify the code - 
	# CAUTION this will clobber the file, hopefully not too badly
	prettier -w src/littleLOOKahead.js 