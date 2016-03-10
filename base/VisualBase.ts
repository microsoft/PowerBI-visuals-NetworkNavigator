/// <reference path="./references.d.ts"/>
export class VisualBase implements powerbi.IVisual {
    protected element: JQuery;
    protected container: JQuery;
    private iframe : JQuery;

    /** This is called once when the visual is initialially created */
    public init(options: powerbi.VisualInitOptions, template: string = "", addCssToParent: boolean = false): void {
        var width = options.viewport.width;
        var height = options.viewport.height;
        this.container = options.element;
        this.iframe = $(`<iframe style="width:${width}px;height:${height}px;border:0;margin:0;padding:0" frameBorder="0"/>`);
        this.container.append(this.iframe);
        this.element = this.iframe.contents().find("body");
        var promises = this.getExternalCssResources().map((resource) => this.buildExternalCssLink(resource));
        $.when.apply($, promises).then((...styles) => this.element.append(styles.map((s)=> $(s))));

        if (addCssToParent) {
            this.container.append(this.getCss().map((css) => $("<st" + "yle>" + css + "</st" + "yle>")));
        }
        
        this.HACK_fonts();
        
        this.element.append(this.getCss().map((css) => $("<st" + "yle>" + css + "</st" + "yle>")));

        if (template) {
            this.element = this.element.append($(template));
        }
    }

    /**
     * Notifies the IVisual of an update (data, viewmode, size change).
     */
    public update(options: powerbi.VisualUpdateOptions) {
        this.iframe.css({ width: options.viewport.width, height: options.viewport.height });
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
        this.element.append(faces.map(n => $("<st" + "yle>" + n.cssText + "</st" + "yle>")));
    }
 
    private HACK_getFontFaces(obj?) {
        var sheet = document.styleSheets,
            rule = null,
            i = sheet.length, j, toReturn = [];
        while( 0 <= --i ){
            rule = sheet[i]['rules'] || sheet[i]['cssRules'] || [];
            j = rule.length;
            while( 0 <= --j ){
                if( rule[j].constructor.name === 'CSSFontFaceRule' ){ // rule[j].slice(0, 10).toLowerCase() === '@font-face'
                    //o[ rule[j].style.fontFamily ] = rule[j].style.src;
                    toReturn.push(rule[j]);
                };
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
                ? this.selectedIds.filter(d => !powerbi.data.Selector.equals(d.getSelector(), selectionId.getSelector()))
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