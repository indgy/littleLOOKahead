# we have a build folder called dist, so mark it as phony to force update
.PHONY: dist

dist:
	# minify javascript
	esbuild \
		--minify \
		--outfile=dist/littleLOOKahead.min.js \
		src/littleLOOKahead.js 
	cp dist/littleLOOKahead.min.js examples/littleLOOKahead.min.js
	gzip -c dist/littleLOOKahead.min.js > dist/littleLOOKahead.gz
	ls -alh dist

tidy: 
	# prettify the code
	prettier -w src/littleLOOKahead.js 