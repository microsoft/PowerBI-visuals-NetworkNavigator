module powerbi.visuals {
    export class LineUp implements IVisual {
        private dataView: DataView;
        private element : JQuery;

        public static capabilities: VisualCapabilities = {
            dataRoles: [{
                name: 'Values',
                kind: VisualDataRoleKind.GroupingOrMeasure
            }],
            dataViewMappings: [{
                table: {
                    rows: {
                        for: { in: 'Values' },
                        dataReductionAlgorithm: { window: { count: 100 } }
                    },
                    rowCount: { preferred: { min: 1 } }
                },
            }]
        };        
        
        private template : string = `
            <div class="load-container load5">
                <div class="loader">Loading...</div>
            </div>`;

        /** This is called once when the visual is initialially created */
        public init(options: VisualInitOptions): void {
            this.element = options.element;
            this.element.append(this.template);
        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
        }
    }
}