install:
	npm ci

link:
	sudo npm link

lint:
	npx eslint .

nws:
	npx webpack serve

build:
	NODE_ENV=production npx webpack