test: test-unit
test-unit: src/caseable-api.js tests/unit/test_api.js node_modules
	npm run unit-test

.PHONY: dist
dist: src/caseable.catalog.js node_modules
	mkdir -p dist
	cp src/caseable.catalog.js dist
	npm run make-dist

.PHONY: docs
docs: src/caseable.catalog.js node_modules
	npm run make-docs

clean:
	rm -rf dist docs

node_modules: package.json
	npm install .
