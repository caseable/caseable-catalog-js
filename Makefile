.PHONY: test test-unit
test: test-unit
test-unit: node_modules
	npm run unit-test

dist: src/caseable.catalog.js node_modules
	mkdir -p dist
	cp src/caseable.catalog.js dist
	npm run make-dist

docs: src/caseable.catalog.js node_modules
	npm run make-docs

.PHONY: clean
clean:
	rm -rf dist docs

node_modules: package.json
	npm install
