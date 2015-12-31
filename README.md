#Power VI Visuals
This is a base project for developing Power BI visuals.  It is hopefully a temporary thing until the PowerBI folks come out with something better.

#Getting Started
* Run `npm install` on the project directory
* Open gulpfile.js and change the `projectName` and the `projectId` fields to your visual's name, and a random id (13 digits) respectively
* Review the Power BI [Visuals Getting Started](https://github.com/Microsoft/PowerBI-visuals/wiki).
* TypeScript code goes into the `src` folder, css goes into the `src/css` folder.
    * Your project does not need to be in a single typescript file, however you may only export **one** visual, due to limitations of the power bi dev tools.
    * For your main visual, extend `VisualBase.ts`, it contains some logic to load external css, and loading the frame, please review it, and extend as needed.

#Debugging
* Run `gulp --project <projectFolder>` or `gulp --project <projectFolder> build`, this will create two files in the `build\<projectFolder>` directory. Go to [Power BI Dev Tools](https://app.powerbi.com/devTools), copy the contents of the `project.ts` file into the Script Pane, and copy the contents of `project.css` into the Styling pane, and run `Run + Compile`. This will then show your Visual in the right pane. You can then go back to [Power BI](https://app.powerbi.com), and use this new visual.