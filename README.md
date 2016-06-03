[![wercker status](https://app.wercker.com/status/650d0e3d9f6085dde6626c5cd59e6c85/s/master "wercker status")](https://app.wercker.com/project/bykey/650d0e3d9f6085dde6626c5cd59e6c85)

#Visuals
This is a base project for developing Essex's visuals.

#Getting Started
* Fork this repo
* Install *gulp* globally by running `npm install -g gulp`
* Run `npm install` on the project directory
* The `src` directory contains all of the visual's code.
    * If you are creating a PowerBI version of the component
        * Create a new class file, and name it the name of your visual, and put the following in it:

```
import { VisualBase } from "../../base/VisualBase"; // Provides some base functionality
import { Visual } from "../../base/Utils";

@Visual(JSON.parse(require("./build.json").output.PowerBI)) // This line will register the class as a visual in power bi
export default class LineUpVisual extends VisualBase implements IVisual {

    /**
     * The set of capabilities for the visual
     */
    public static capabilities: VisualCapabilities = {
        dataRoles: [{
            name: 'Values',
            kind: VisualDataRoleKind.Grouping
        }],
        dataViewMappings: [{
            table: {
                rows: {
                    for: { in: 'Values' },
                    dataReductionAlgorithm: { window: { count: 100 } }
                },
                rowCount: { preferred: { min: 1 } }
            }
        }],
        objects: {}
    };

    /**
     * The element template for your visual
     */
    private template: string = `
        <div>My New Visual</div>
    `;


    /** This is called once when the visual is initialially created */
    public init(options: VisualInitOptions): void {
        super.init(options, this.template, true);
    }

    /** Update is called for data updates, resizes & formatting changes */
    public update(options: VisualUpdateOptions) {
        super.update(options);
    }

    /**
     * Gets the css used for this visual
     */
    protected getCss() : string[] {
        return super.getCss().concat([require("!css!sass!./css/MyVisualCss.scss")]);
    }
}

```
* Create a file called build.json, and put the following values in it

```
{
    "output": {
        "PowerBI": { // The powerbi version of the component (if it exists)
            "visualName": "<Class Name of the Visual >",
            "projectId": "<Random Id: (13 digits)>",
            "icon": "<File name of icon>",
            "entry": "<The entry point file name, i.e The main class name for the visual>"
        },
        "react": { // The react version of the component (if it exists)
            "entry": "<The entry point file name, i.e The main class name for the react component>"
        },
        "component": { // The base component, that can be used by itself
            "entry": "<The entry point file name, i.e The main class name for the individual component>"
        }
    },
    "lintFiles": [<List of files to lint>]
}
```

* Review the Power BI [Visuals Getting Started](https://github.com/Microsoft/PowerBI-visuals/wiki).

#Building
* Running `npm run build` will do the following:
  * Compiles the `src` directory.
  * Creates a `.pbiviz` file in the `dist\powerbi` directory.
    * Go to [Power BI](https://app.powerbi.com/), and to import your new visual.