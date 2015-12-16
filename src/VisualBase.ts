/// <reference path="./references.d.ts"/>
/// <reference path="./lineup.ts"/>

class VisualBase {
    protected element: JQuery;
    protected container: JQuery;
    private iframe : JQuery;

    /** This is called once when the visual is initialially created */
    public init(options: powerbi.VisualInitOptions, template?: string): void {
        this.container = options.element;
        this.iframe = $('<iframe style="width:' + options.viewport.width + 'px;height:' + options.viewport.height + 'px"/>');
        this.container.append(this.iframe);
        this.element = this.iframe.contents().find("body");
        this.element.append(this.getExternalCssResources().map((resource) => this.buildExternalCssLink(resource)));
        this.element.append("<st" + "yle>" + this.getCss() + "</st" + "yle>");
    }

    public update(options: powerbi.VisualUpdateOptions) {
        this.iframe.css({ width: options.viewport.width, height: options.viewport.height });
    }

    /**
     * Gets the inline css used for this element
     */
    protected getCss() : string[] {
        return [`/*INLINE_CSS*/`];
    }

    /**
     * Builds the link for the given external css resource
     */
    protected buildExternalCssLink(resource: ExternalCssResource) : string {
        var link = 'li' + 'nk';
        var integrity = resource.integrity ? `integrity="${resource.integrity}"` : '';
        var href = `href="${resource.url}"`;
        var crossorigin = resource.crossorigin ? ` crossorigin="${resource.crossorigin}"` : '';
        var rel = 'rel="stylesheet"';
        return `<${link} ${href} ${rel} ${integrity} ${crossorigin}>`;
    }

    /**
     * Gets the external css paths used for this visualization
     */
    protected getExternalCssResources() : ExternalCssResource[] {
        return [];
    }
}

/**
 * Specifies an external css resource
 */
interface ExternalCssResource {
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