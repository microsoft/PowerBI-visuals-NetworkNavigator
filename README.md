#Power VI Visuals
This is a base project for developing Power BI visuals.  It is hopefully a temporary thing until the PowerBI folks come out with something better.

#Getting Started
* Run `npm install` on the project directory
* Create a folder with some project name, under the `visuals` directory.
* Create a new class file, and name it the name of your visual, and put this in it

```
import { VisualBase } from "../../base/VisualBase"; // Provides some base functionality
import { Visual } from "../../base/Utils";

@Visual(JSON.parse(require("./visualconfig.json"))) // This line will register the class as a visual in power bi
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
* Create an index.ts that does `require('./MyVisual.ts')`
* Create a file called visualconfig.json, and put two values: The `projectName` and `projectId` fields, which are your visual's name, and a random id (13 digits) respectively
    * If your project includes an icon for the visual, put it in the top level directory of your visual, and then add another field into the config file called `icon`, which contains your icons file name.
* Review the Power BI [Visuals Getting Started](https://github.com/Microsoft/PowerBI-visuals/wiki).

#Building
* Run `gulp package --project <projectFolder>`, this will create a `.pbiviz` file in the `build\<projectFolder>` directory. Go to [Power BI](https://app.powerbi.com/), and to import your new visual.