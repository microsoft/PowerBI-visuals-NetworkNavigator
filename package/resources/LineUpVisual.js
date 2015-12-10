var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var LineUp1450434005853;
        (function (LineUp1450434005853) {
            var LineUp = (function () {
                function LineUp() {
                    this.template = "\n            <div class=\"load-container load5\">\n                <div class=\"loader\">Loading...</div>\n            </div>";
                }
                /** This is called once when the visual is initialially created */
                LineUp.prototype.init = function (options) {
                    this.element = options.element;
                    this.element.append(this.template);
                };
                /** Update is called for data updates, resizes & formatting changes */
                LineUp.prototype.update = function (options) {
                };
                LineUp.capabilities = {
                    dataRoles: [{
                        name: 'Values',
                        kind: powerbi.VisualDataRoleKind.GroupingOrMeasure
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
                return LineUp;
            })();
            LineUp1450434005853.LineUp = LineUp;
        })(LineUp1450434005853 = visuals.LineUp1450434005853 || (visuals.LineUp1450434005853 = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var plugins;
        (function (plugins) {
            plugins.LineUp1450434005853 = {
                name: 'LineUp1450434005853',
                class: 'LineUp1450434005853',
                capabilities: powerbi.visuals.LineUp1450434005853.LineUp.capabilities,
                custom: true,
                create: function () { return new powerbi.visuals.LineUp1450434005853.LineUp(); }
            };
        })(plugins = visuals.plugins || (visuals.plugins = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
