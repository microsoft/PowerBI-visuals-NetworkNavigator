/// <reference path="../lib/powerbi-visuals.d.ts"/>
/// <reference path="../lib/powerbi-externals.d.ts"/>
/// <reference path="./lineup.ts"/>

class VisualBase {
    protected element: JQuery;
    private container: JQuery;
    private iframe : JQuery;

    /** This is called once when the visual is initialially created */
    public init(options: powerbi.VisualInitOptions, template?: string): void {
        this.container = options.element;
        this.iframe = $('<iframe style="width:' + options.viewport.width + 'px;height:' + options.viewport.height + 'px"/>');
        this.container.append(this.iframe);
        this.element = this.iframe.contents().find("body");

        this.element.append("<st" + "yle>" + this.getCss() + "</st" + "yle>");
    }

    public update(options: powerbi.VisualUpdateOptions) {
        this.iframe.css({ width: options.viewport.width, height: options.viewport.height });
    }

    /**
        * Gets the css used for this element
        */
    protected getCss() : string[] {
        return [`/*INLINE_CSS*/`];
    }
}