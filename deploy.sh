#!/bin/bash

git checkout main
git branch -D gh-pages
git checkout -b gh-pages

mkdir docs

npm run build-prod
mv dist/* docs
git add docs/
git commit -m "Deploy website"

git push -u origin gh-pages --force-with-lease
git checkout main
