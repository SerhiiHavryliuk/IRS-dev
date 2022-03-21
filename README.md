# Front-End Stand

To start work with this project:
* npm install -g gulp
* npm install -g concurrently
* npm install (installation dependencies for node project)
* npm install node-sass (for work with scss files)
* //manual install gulp plugins which contain into /gulpfile.js example: npm i gulp-rename -D


After installation all dependencies:

* npm start - run server on http://localhost:3001 + watch for sass change and jade

Build

* gulp
* gulp ftp - fast deploy into ftp


pages.json

Write page name, to create new page:

```
{
    "index": {},
    "components": {},
    "about": {}

}
```

Сборка с комментариями в HTML
Для расстонавко комментов по html выполняем следующее после npm install
* заходим в папку _for-jade-dir
* переносим содержимое папки (два файла) с заменой в папку node_modules/jade/lib/
* папку _for-jade-dir удаляем


	