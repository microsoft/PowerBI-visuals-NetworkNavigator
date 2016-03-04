import { ExternalCssResource, VisualBase } from "../../base/VisualBase";
import { Visual } from "../../base/Utils";
// import { DocumentViewer, IDocumentViewerData, IDocumentViewerDocument } from "./DocumentViewer";

import IVisual = powerbi.IVisual;
import DataView = powerbi.DataView;
import VisualCapabilities = powerbi.VisualCapabilities;
import VisualInitOptions = powerbi.VisualInitOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import VisualDataRoleKind = powerbi.VisualDataRoleKind;
const Thumbnails = require("./lib/strippets_thumbnails/uncharted_thumbnails");

@Visual(require("./build.js").output.PowerBI)
export default class StrippetsThumbnailsVisual extends VisualBase implements IVisual {

    /**
     * Represents the capabilities for this visual
     */
    public static capabilities: VisualCapabilities = {
        dataRoles: [{
            name: "EntityFields",
            displayName: "Entity Fields",
            kind: VisualDataRoleKind.Grouping
        }, {
                name: "DocumentFields",
                displayName: "Documents Fields",
                kind: VisualDataRoleKind.Grouping
            }],
        dataViewMappings: [{
            table: {
                rows: {
                    select: [
                        { bind: { to: 'EntityFields' } },
                        { bind: { to: 'DocumentFields' } },
                    ]
                },
                rowCount: 1
            }
        }],
        objects: {}
    };

    private thumbnailEle: JQuery;

    /**
     * The font awesome resource
     */
    private fontAwesome: ExternalCssResource = {
        url: '//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css',
        integrity: 'sha256-3dkvEK0WLHRJ7/Csr0BZjAWxERc5WH7bdeUya2aXxdU= sha512-+L4yy6FRcDGbXJ9mPG8MT' +
        '/3UCDzwR9gPeyFNMCtInsol++5m3bk2bXWKdZjvybmohrAsn3Ua5x8gfLnbE1YkOg==',
        crossorigin: "anonymous"
    };

    /**
     * Initializes an instance of the IVisual.
     *
        * @param options Initialization options for the visual.
        */
    public init(options: VisualInitOptions) {
        super.init(options, '<div id="thumbnails-panel"></div>');
        this.thumbnailEle = this.element.find("#thumbnails-panel");
        Thumbnails.asJQueryPlugin();
        this.thumbnailEle['thumbnails']({
            readerview: {
                onLoadUrl: function(/* readerUrl */) {
                    return new Promise(function(resolve) {
                        setTimeout(function() {
                            resolve(require("./temp.js"));
                        }, 500);
                    });
                },
            },
            thumbnail: {
                height: '400px'
            },
        });

        // let sampleData = JSON.parse(require("./example/sampledata.json"));
        // this.thumbnailEle['thumbnails']("loaddata", sampleData);
        // this.thumbnailEle['thumbnails']("onInfinite", function() {
        //     var nextDataId = 13;
        //     return new Promise(function(resolve) {
        //         // simulate async call
        //         setTimeout(function() {
        //             var data = JSON.parse(JSON.stringify(sampleData));
        //             data.forEach(function(data) {
        //                 data.id = nextDataId;
        //                 data.rank = nextDataId;
        //                 nextDataId += 1;
        //             });
        //             resolve(data);
        //         }, 500);
        //     });
        // });
    }

    /**
     * Notifies the IVisual of an update (data, viewmode, size change).
     */
    public update(options: VisualUpdateOptions) {
        super.update(options);
        if (options.dataViews && options.dataViews.length > 0) {
            var table = options.dataViews[0].table;
            var data = StrippetsThumbnailsVisual.converter(options.dataViews[0]);
            if (data && data.length) {
                this.thumbnailEle['thumbnails']("loaddata", data);
            }
        }
    }

    /**
     * Gets the inline css used for this element
     */
    protected getCss(): string[] {
        return super.getCss().concat([
            require("!css!sass!./lib/strippets_thumbnails/strippets.css"),
            require("!css!sass!./lib/strippets_thumbnails/thumbnails.css")
        ]);
    }


    /**
    * Gets the external css paths used for this visualization
    */
    protected getExternalCssResources(): ExternalCssResource[] {
        return super.getExternalCssResources().concat(this.fontAwesome);
    }

    /**
     * Converts the dataview into our own model
     */
    public static converter(dataView: DataView) {
        let table = dataView.table;
        let docColumnMapping = {};
        let entityColumnMapping = {};

        var entityFields = [
            'id',
            'name',
            'type',
            'description',
            'firstPosition'
        ];
        var docFields = [
            'id',
            'rank',
            'imageUrl',
            'source',
            'sourceUrl',
            'sourceimage',
            'title',
            'author',
            'articledate',
            'summary',
            'url',
            'readerUrl'
            // 'entities'
        ];
        if (dataView.metadata.columns.length < docFields.length + entityFields.length) {
            return [];
        }
        dataView.metadata.columns.forEach((n, i) => {
            if (n.roles['DocumentFields']) {
                docColumnMapping[n.displayName] = i;
            }
            if (n.roles['EntityFields']) {
                entityColumnMapping[n.displayName] = i;
            }
        });
        var docMap = {};
        table.rows.forEach(rowValues => {
            let docId = rowValues[docColumnMapping["id"]];
            let doc = docMap[docId];
            if (!doc) {
                doc = docMap[doc] = {
                    entities: []
                };
            }
            docFields.forEach(field => {
                let value = rowValues[docColumnMapping[field]];
                if (field === "imageUrl") {
                    let urls = value.split(",");
                    for (let i = 0, n = urls.length; i < n; ++i) {
                        urls[i] = decodeURIComponent(urls[i]);
                    }
                    value = urls;
                } else {
                    value = decodeURIComponent(value);
                }
                doc[field] = value;
            });

            let entity = {};
            entityFields.forEach(field => {
                entity[field] = rowValues[entityColumnMapping[field]];
            });
            doc.entities.push(entity);
        });
        return Object.keys(docMap).map(n => docMap[n]);
    }
}