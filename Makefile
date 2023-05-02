install:
	npm ci

link:
	sudo npm link

lint:
	npx eslint .

nws:
	npx webpack serve