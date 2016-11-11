const ConverterProto = require("typedoc/lib/converter/converter").Converter.prototype;
const CliApplication = require("typedoc").CliApplication;

const originalConvert = ConverterProto.convert;
ConverterProto.convert = function() {
    const result = originalConvert.apply(this, arguments);

    // Ignore errors coming from node_modules because TypeScript spews errors.
    result.errors = result.errors.filter((a) => a.file.fileName.indexOf("node_modules") < 0);
    return result;
};

module.exports = new CliApplication();
