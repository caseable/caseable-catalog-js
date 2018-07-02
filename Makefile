test-unit: src/caseable-api.js tests/unit/test_api.js node_modules
	npm run unit-test

dist: src/caseable-api.js node_modules
	mkdir -p dist && \
	cp src/caseable-api.js dist && \
	if [ ! -z $(CASEABLE_API_BASE) ]; then sed -i 's@http://catalog.caseable.com@$(CASEABLE_API_BASE)@g' dist/caseable-api.js; fi && \
	./node_modules/google-closure-compiler/cli.js --js_output_file dist/caseable-api.min.js dist/caseable-api.js

node_modules: package.json
	npm install .
