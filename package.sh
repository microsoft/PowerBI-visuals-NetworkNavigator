rm -rf ./pbiviz
cp -r ./package pbiviz

echo "Storing Lineup"
LINEUP=`cat visuals/lineup.ts`

echo "Copying file"
cp visuals/LineUpVisual.ts pbiviz/resources/LineUpVisual.ts

echo "Sedding"
sed -i '/\/\/\/ <reference \*/c/g' pbiviz/resources/LineUpVisual.ts

echo "$LINEUP" >> pbiviz/resources/LineUpVisual.ts

echo "Compiling";
tsc visuals/LineUpVisual.ts --out pbiviz/resources/LineUpVisual.js

# cp ./visuals/css/fontawesome.css pbiviz/resources/LineUpVisual.css
cp ./visuals/css/lineup.css pbiviz/resources/LineUpVisual.css
cat ./visuals/css/demo.css >> pbiviz/resources/LineUpVisual.css
cat ./visuals/css/LineUpVisual.css >> pbiviz/resources/LineUpVisual.css

cd pbiviz
zip -r lineup.pbiviz .