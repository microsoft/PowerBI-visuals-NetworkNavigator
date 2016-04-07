/// <reference path="./references.d.ts"/>
import VisualCapabilities = powerbi.VisualCapabilities;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import * as $ from "jquery";

export class VisualBase implements powerbi.IVisual {
    protected element: JQuery;
    protected container: JQuery;
    private parent : JQuery;
    private _sandboxed: boolean;
    private width: number;
    private height: number;

    // TODO: Switch this to a build config
    public static EXPERIMENTAL_ENABLED = false;

    /**
     * True if the sandbox is enabled by default
     */
    public static DEFAULT_SANDBOX_ENABLED = window.parent === window /* Checks if we are in an iframe */;

    /**
     * The set of capabilities for the visual
     */
    public static capabilities: VisualCapabilities = VisualBase.EXPERIMENTAL_ENABLED ? {
        objects: {
            experimental: {
                displayName: "Experimental",
                properties: {
                    sandboxed: {
                        type: { bool: true },
                        displayName: "Enable to sandbox the visual into an IFrame"
                    }
                }
            }
        }
    } : {};

    /** This is called once when the visual is initialially created */
    public init(options: powerbi.VisualInitOptions, template: string = "", addCssToParent: boolean = false): void {
        const width = options.viewport.width;
        const height = options.viewport.height;
        this.container = options.element;
        this.element = $("<div/>");
        this.sandboxed = VisualBase.DEFAULT_SANDBOX_ENABLED;
        const promises = this.getExternalCssResources().map((resource) => this.buildExternalCssLink(resource));
        $.when.apply($, promises).then((...styles: string[]) => this.element.append(styles.map((s)=> $(s))));

        if (addCssToParent) {
            this.container.append(this.getCss().map((css) => $("<st" + "yle>" + css + "</st" + "yle>")));
        }

        this.element.append($("<st" + "yle>" + this.getCss().join("\n") + "</st" + "yle>"));

        if (template) {
            this.element = this.element.append($(template));
        }
    }

    /**
     * Notifies the IVisual of an update (data, viewmode, size change).
     */
    public update(options: powerbi.VisualUpdateOptions) {
        this.width = options.viewport.width;
        this.height = options.viewport.height;

        const dataView = options.dataViews && options.dataViews[0];
        if (dataView) {
            if (VisualBase.EXPERIMENTAL_ENABLED) {
                const objs = dataView.metadata.objects;
                const experimental = objs && objs['experimental'];
                let sandboxed = experimental && experimental['sandboxed'];
                sandboxed = typeof sandboxed === "undefined" ? VisualBase.DEFAULT_SANDBOX_ENABLED : sandboxed;
                if (this.sandboxed !== sandboxed) {
                    this.sandboxed = sandboxed;
                }
            }
        }
        this.parent.css({ width: this.width, height: this.height });
    }

    /**
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
        if (options.objectName === 'experimental' && VisualBase.EXPERIMENTAL_ENABLED) {
            return [{
                selector: null,
                objectName: 'experimental',
                properties: {
                    sandboxed: this.sandboxed
                }
            }];
        }
    }

    /**
     * Sets the sandboxed state
     */
    public set sandboxed(value: boolean) {
        this._sandboxed = value;
        this.element.detach();

        if (this.parent) {
            this.parent.remove();
        }
        if (value) {
            this.parent = $(`<iframe style="width:${this.width}px;height:${this.height}px;border:0;margin:0;padding:0" frameBorder="0"/>`);

            // Important that this happens first, otherwise there might not be a body
            this.container.append(this.parent);

            if(typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                // If you append the element without doing this, the iframe will load after you've appended it and remove everything that you added
                this.parent[0].onload = () => {
                    setTimeout(() => {
                        this.HACK_fonts();
                        this.parent.contents().find("body").append(this.element);
                    }, 0);
                };
            } else {
                this.parent.contents().find("head").append($('<meta http-equiv="X-UA-Compatible" content="IE=edge">'));
                this.parent.contents().find("body").append(this.element);
                this.HACK_fonts();
            }
        } else {
            this.parent = $(`<div style="width:${this.width}px;height:${this.height}px;border:0;margin:0;padding:0"/>`);
            this.parent.append(this.element);
            this.container.append(this.parent);
        }
    }

    /**
     *
     */
    public get sandboxed() {
        return this._sandboxed;
    }

    /**
     * Gets the inline css used for this element
     */
    protected getCss() : string[] {
        return [require("!css!sass!./css/main.scss")];
    }

    /**
     * Builds the link for the given external css resource
     */
    protected buildExternalCssLink(resource: ExternalCssResource) : JQueryPromise<string> {
        var link = 'li' + 'nk';
        var integrity = resource.integrity ? `integrity="${resource.integrity}"` : '';
        var href = `href="${resource.url}"`;
        var crossorigin = resource.crossorigin ? ` crossorigin="${resource.crossorigin}"` : '';
        var rel = 'rel="stylesheet"';
        var defer = $.Deferred<string>();
        defer.resolve(`<${link} ${href} ${rel} ${integrity} ${crossorigin}>`);
        return defer.promise();
    }

    /**
     * Gets the external css paths used for this visualization
     */
    protected getExternalCssResources() : ExternalCssResource[] {
        return [];
    }

    private HACK_fonts() {
        let faces = this.HACK_getFontFaces();
        this.element.prepend($("<st" + "yle>" + (Object.keys(faces).map(n => faces[n].cssText)).join("\n") + "</st" + "yle>"));
    }

    private HACK_getFontFaces(obj?: any) {
        var sheet = document.styleSheets,
            rule: any = null,
            i = sheet.length, j: any, toReturn = {};
        while( 0 <= --i ){
            try {
                rule = sheet[i]['rules'] || sheet[i]['cssRules'] || [];
                j = rule.length;
                while( 0 <= --j ){
                    if( rule[j].constructor.name === 'CSSFontFaceRule' ||
                        rule[j].constructor.toString().indexOf('CSSFontFaceRule') >= 0){ // rule[j].slice(0, 10).toLowerCase() === '@font-face'
                        //o[ rule[j].style.fontFamily ] = rule[j].style.src;
                        const style = rule[j].style;
                        let fontFamily = style.fontFamily;
                        if (!fontFamily && style.getPropertyValue) {
                            fontFamily = style.getPropertyValue('font-family');
                        }
                        toReturn[fontFamily] = rule[j];
                    };
                }
            } catch (e) {
                if (e.name !== 'SecurityError') {
                    throw e;
                }
            }
        }
        return toReturn;
    }
    // private HACK_getFontFaces(obj?) {
    //     var o = obj || {},
    //         sheet = document.styleSheets,
    //         rule = null,
    //         i = sheet.length, j;
    //     while( 0 <= --i ){
    //         rule = sheet[i]['rules'] || sheet[i]['cssRules'] || [];
    //         j = rule.length;
    //         while( 0 <= --j ){
    //             if( rule[j].constructor.name === 'CSSFontFaceRule' ){ // rule[j].slice(0, 10).toLowerCase() === '@font-face'
    //                 o[ rule[j].style.fontFamily ] = rule[j].style.src;
    //             };
    //         }
    //     }
    //     return o;
    // }
}

/**
 * Specifies an external css resource
 */
export interface ExternalCssResource {
    /**
     * The url of the resource
     */
    url: string;

    /**
     * The integrity string of the resource
     */
    integrity?: string;

    /**
     * The cross origin of the resource
     */
    crossorigin?: string;
}

/* HACK FIXES */
if (powerbi.visuals.utility.SelectionManager.prototype['selectInternal'] ) {
    powerbi.visuals.utility.SelectionManager.prototype['selectInternal'] = function(selectionId: powerbi.visuals.SelectionId, multiSelect: boolean) {
        if (powerbi.visuals.utility.SelectionManager.containsSelection(this.selectedIds, selectionId)) {
            this.selectedIds = multiSelect
                ? this.selectedIds.filter((d: any) => !powerbi.data.Selector.equals(d.getSelector(), selectionId.getSelector()))
                : this.selectedIds.length > 1
                    ? [selectionId] : [];
        } else {
            if (multiSelect)
                this.selectedIds.push(selectionId);
            else
                this.selectedIds = [selectionId];
        }
    };
    console.warn("Monkey Patched: powerbi.visuals.utility.SelectionManager.prototype.selectInternal");
}
