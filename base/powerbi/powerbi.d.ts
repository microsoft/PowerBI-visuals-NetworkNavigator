


declare module powerbi {
    import IStringResourceProvider = jsCommon.IStringResourceProvider;
    interface ServiceError {
        statusCode: number;
        /**
         * This error code corresponds with a PowerBIServiceException that happened on the server.
         */
        errorCode?: string;
        /**
         * Message and stack trace should only be sent in non-production environments.
         */
        message?: string;
        stackTrace?: string;
        errorDetails?: PowerBIErrorDetail[];
        parameters?: ErrorParameter[];
    }
    interface PowerBIErrorDetail {
        code: string;
        detail: PowerBIErrorDetailValue;
    }
    interface ErrorParameter {
        Key: string;
        Value: string;
    }
    interface PowerBIErrorDetailValue {
        type: PowerBIErrorResourceType;
        value: string;
    }
    enum PowerBIErrorResourceType {
        ResourceCodeReference = 0,
        EmbeddedString = 1,
    }
    enum ServiceErrorStatusCode {
        GeneralError = 0,
        CsdlFetching = 1,
        CsdlConvertXmlToConceptualSchema = 2,
        CsdlCreateClientSchema = 3,
        ExecuteSemanticQueryError = 4,
        ExecuteSemanticQueryInvalidStreamFormat = 5,
        ExecuteSemanticQueryTransformError = 6,
    }
    class ServiceErrorToClientError implements IClientError {
        private m_serviceError;
        private httpRequestId;
        private static codeName;
        code: string;
        ignorable: boolean;
        requestId: string;
        constructor(serviceError: ServiceError);
        getDetails(resourceProvider: IStringResourceProvider): ErrorDetails;
    }
    class PowerBIErrorDetailHelper {
        private static serverErrorPrefix;
        static addAdditionalInfo(errorDetails: ErrorDetails, pbiErrorDetails: PowerBIErrorDetail[], localize: IStringResourceProvider): ErrorDetails;
        static addMessageAndStackTrace(errorDetails: ErrorDetails, message: string, stackTrace: string, localize: IStringResourceProvider): ErrorDetails;
        static GetDetailsFromTransformError(localize: IStringResourceProvider, serviceError: ServiceError): ErrorDetails;
        static GetDetailsFromServerErrorStatusCode(localize: IStringResourceProvider, statusCode: number): ErrorDetails;
    }
}
declare module powerbi {
    let build: any;
}
declare module powerbi {
    const CategoryTypes: {
        Address: string;
        City: string;
        Continent: string;
        CountryRegion: string;
        County: string;
        Longitude: string;
        Latitude: string;
        Place: string;
        PostalCode: string;
        StateOrProvince: string;
    };
    interface IGeoTaggingAnalyzerService {
        isLongitudeOrLatitude(fieldRefName: string): boolean;
        isGeographic(fieldRefName: string): boolean;
        isGeocodable(fieldRefName: string): boolean;
        getFieldType(fieldName: string): string;
        isGeoshapable(fieldRefName: string): boolean;
    }
    function createGeoTaggingAnalyzerService(getLocalized: (str: string) => string): IGeoTaggingAnalyzerService;
    class GeoTaggingAnalyzerService implements IGeoTaggingAnalyzerService {
        private GeotaggingString_Continent;
        private GeotaggingString_Continents;
        private GeotaggingString_Country;
        private GeotaggingString_Countries;
        private GeotaggingString_State;
        private GeotaggingString_States;
        private GeotaggingString_City;
        private GeotaggingString_Cities;
        private GeotaggingString_Town;
        private GeotaggingString_Towns;
        private GeotaggingString_Province;
        private GeotaggingString_Provinces;
        private GeotaggingString_County;
        private GeotaggingString_Counties;
        private GeotaggingString_Village;
        private GeotaggingString_Villages;
        private GeotaggingString_Post;
        private GeotaggingString_Zip;
        private GeotaggingString_Code;
        private GeotaggingString_Place;
        private GeotaggingString_Places;
        private GeotaggingString_Address;
        private GeotaggingString_Addresses;
        private GeotaggingString_Street;
        private GeotaggingString_Streets;
        private GeotaggingString_Longitude;
        private GeotaggingString_Longitude_Short;
        private GeotaggingString_Latitude;
        private GeotaggingString_Latitude_Short;
        private GeotaggingString_PostalCode;
        private GeotaggingString_PostalCodes;
        private GeotaggingString_ZipCode;
        private GeotaggingString_ZipCodes;
        private GeotaggingString_Territory;
        private GeotaggingString_Territories;
        private GeotaggingString_VRMBackCompat_CountryRegion;
        private GeotaggingString_VRMBackCompat_StateOrProvince;
        constructor(getLocalized: (str: string) => string);
        isLongitudeOrLatitude(fieldRefName: string): boolean;
        isGeographic(fieldRefName: string): boolean;
        isGeocodable(fieldRefName: string): boolean;
        isGeoshapable(fieldRefName: string): boolean;
        private isAddress(fieldRefName);
        private isPlace(fieldRefName);
        private isCity(fieldRefName);
        private isStateOrProvince(fieldRefName);
        private isCountry(fieldRefName);
        private isCounty(fieldRefName);
        private isContinent(fieldRefName);
        private isPostalCode(fieldRefName);
        private isLongitude(fieldRefName);
        private isLatitude(fieldRefName);
        private isTerritory(fieldRefName);
        private static hasMatches(fieldName, possibleMatches, useStrict?);
        getFieldType(fieldName: string): string;
        private isEnglishAddress(fieldRefName);
        private isEnglishPlace(fieldRefName);
        private isEnglishCity(fieldRefName);
        private isEnglishStateOrProvince(fieldRefName);
        private isEnglishCountry(fieldRefName);
        private isEnglishCounty(fieldRefName);
        private isEnglishContinent(fieldRefName);
        private isEnglishPostalCode(fieldRefName);
        private isEnglishLongitude(fieldRefName);
        private isEnglishLatitude(fieldRefName);
        protected isEnglishTerritory(fieldRefName: string): boolean;
        private getEnglishFieldType(fieldName);
    }
}
declare var DEBUG: boolean;
declare module powerbi {
    import IStringResourceProvider = jsCommon.IStringResourceProvider;
    interface ILocalizableError {
        getDetails(resourceProvider: IStringResourceProvider): ErrorDetails;
    }
    interface IClientError extends ILocalizableError {
        code: string;
        debugInfo?: string;
        ignorable?: boolean;
        requestId?: string;
    }
    interface IClientWarning extends ILocalizableError {
        columnNameFromIndex: (index: number) => string;
    }
    class UnknownClientError implements IClientError {
        code: string;
        ignorable: boolean;
        getDetails(resourceProvider: IStringResourceProvider): ErrorDetails;
    }
    class HttpClientError implements IClientError {
        private httpRequestId;
        private httpStatusCode;
        constructor(httpStatusCode: number, requestId: string);
        code: string;
        ignorable: boolean;
        requestId: string;
        getDetails(resourceProvider: IStringResourceProvider): ErrorDetails;
    }
    class IgnorableClientError implements IClientError {
        code: string;
        ignorable: boolean;
        getDetails(resourceProvider: IStringResourceProvider): ErrorDetails;
    }
}
declare module InJs {
    module DomFactory {
        function div(): JQuery;
        function span(): JQuery;
        function checkbox(): JQuery;
        function ul(): JQuery;
        function li(): JQuery;
        function button(): JQuery;
        function select(): JQuery;
        function textBox(): JQuery;
        function img(): JQuery;
        function iframe(): JQuery;
    }
}
declare module powerbi {
    /**
     * Module Double contains a set of constants and precision based utility methods
     * for dealing with doubles and their decimal garbage in the javascript.
     */
    module Double {
        const MIN_VALUE: number;
        const MAX_VALUE: number;
        const MIN_EXP: number;
        const MAX_EXP: number;
        const EPSILON: number;
        const DEFAULT_PRECISION: number;
        const DEFAULT_PRECISION_IN_DECIMAL_DIGITS: number;
        const LOG_E_10: number;
        const POSITIVE_POWERS: number[];
        const NEGATIVE_POWERS: number[];
        /**
         * Returns powers of 10.
         * Unlike the Math.pow this function produces no decimal garbage.
         * @param exp Exponent.
         */
        function pow10(exp: number): number;
        /**
         * Returns the 10 base logarithm of the number.
         * Unlike Math.log function this produces integer results with no decimal garbage.
         * @param val Positive value or zero.
         */
        function log10(val: number): number;
        /**
         * Returns a power of 10 representing precision of the number based on the number of meaningfull decimal digits.
         * For example the precision of 56,263.3767 with the 6 meaningfull decimal digit is 0.1.
         * @param x Value.
         * @param decimalDigits How many decimal digits are meaningfull.
         */
        function getPrecision(x: number, decimalDigits?: number): number;
        /**
         * Checks if a delta between 2 numbers is less than provided precision.
         * @param x One value.
         * @param y Another value.
         * @param precision Precision value.
         */
        function equalWithPrecision(x: number, y: number, precision?: number): boolean;
        /**
         * Checks if a first value is less than another taking
         * into account the loose precision based equality.
         * @param x One value.
         * @param y Another value.
         * @param precision Precision value.
         */
        function lessWithPrecision(x: number, y: number, precision?: number): boolean;
        /**
         * Checks if a first value is less or equal than another taking
         * into account the loose precision based equality.
         * @param x One value.
         * @param y Another value.
         * @param precision Precision value.
         */
        function lessOrEqualWithPrecision(x: number, y: number, precision?: number): boolean;
        /**
         * Checks if a first value is greater than another taking
         * into account the loose precision based equality.
         * @param x One value.
         * @param y Another value.
         * @param precision Precision value.
         */
        function greaterWithPrecision(x: number, y: number, precision?: number): boolean;
        /**
         * Checks if a first value is greater or equal to another taking
         * into account the loose precision based equality.
         * @param x One value.
         * @param y Another value.
         * @param precision Precision value.
         */
        function greaterOrEqualWithPrecision(x: number, y: number, precision?: number): boolean;
        /**
         * Floors the number unless it's withing the precision distance from the higher int.
         * @param x One value.
         * @param precision Precision value.
         */
        function floorWithPrecision(x: number, precision?: number): number;
        /**
         * Ceils the number unless it's withing the precision distance from the lower int.
         * @param x One value.
         * @param precision Precision value.
         */
        function ceilWithPrecision(x: number, precision?: number): number;
        /**
         * Floors the number to the provided precision.
         * For example 234,578 floored to 1,000 precision is 234,000.
         * @param x One value.
         * @param precision Precision value.
         */
        function floorToPrecision(x: number, precision?: number): number;
        /**
         * Ceils the number to the provided precision.
         * For example 234,578 floored to 1,000 precision is 235,000.
         * @param x One value.
         * @param precision Precision value.
         */
        function ceilToPrecision(x: number, precision?: number): number;
        /**
         * Rounds the number to the provided precision.
         * For example 234,578 floored to 1,000 precision is 235,000.
         * @param x One value.
         * @param precision Precision value.
         */
        function roundToPrecision(x: number, precision?: number): number;
        /**
         * Returns the value making sure that it's restricted to the provided range.
         * @param x One value.
         * @param min Range min boundary.
         * @param max Range max boundary.
         */
        function ensureInRange(x: number, min: number, max: number): number;
        /**
         * Rounds the value - this method is actually faster than Math.round - used in the graphics utils.
         * @param x Value to round.
         */
        function round(x: number): number;
        /**
         * Projects the value from the source range into the target range.
         * @param value Value to project.
         * @param fromMin Minimum of the source range.
         * @param toMin Minimum of the target range.
         * @param toMax Maximum of the target range.
         */
        function project(value: number, fromMin: number, fromSize: number, toMin: number, toSize: number): number;
        /**
         * Removes decimal noise.
         * @param value Value to be processed.
         */
        function removeDecimalNoise(value: number): number;
        /**
         * Checks whether the number is integer.
         * @param value Value to be checked.
         */
        function isInteger(value: number): boolean;
        /**
         * Dividing by increment will give us count of increments
         * Round out the rough edges into even integer
         * Multiply back by increment to get rounded value
         * e.g. Rounder.toIncrement(0.647291, 0.05) => 0.65
         * @param value - value to round to nearest increment
         * @param increment - smallest increment to round toward
         */
        function toIncrement(value: number, increment: number): number;
    }
}
declare module jsCommon {
    module Color {
        function rotate(rgbString: string, rotateFactor: number): string;
        function normalizeToHexString(color: string): string;
        function parseColorString(color: string): RgbColor;
        function darken(color: RgbColor, diff: number): RgbColor;
        function rgbString(color: RgbColor): string;
        function hexString(color: RgbColor): string;
        interface RgbColor {
            R: number;
            G: number;
            B: number;
            A?: number;
        }
    }
}
declare module jsCommon {
    /**
     * CSS constants.
     */
    module CssConstants {
        interface ClassAndSelector {
            class: string;
            selector: string;
        }
        function createClassAndSelector(className: string): ClassAndSelector;
        const styleAttribute: string;
        const pixelUnits: string;
        const heightProperty: string;
        const widthProperty: string;
        const topProperty: string;
        const bottomProperty: string;
        const leftProperty: string;
        const rightProperty: string;
        const marginTopProperty: string;
        const marginLeftProperty: string;
        const displayProperty: string;
        const backgroundProperty: string;
        const backgroundColorProperty: string;
        const backgroundRepeatProperty: string;
        const backgroundSizeProperty: string;
        const backgroundImageProperty: string;
        const textShadowProperty: string;
        const borderTopWidthProperty: string;
        const borderBottomWidthProperty: string;
        const borderLeftWidthProperty: string;
        const borderRightWidthProperty: string;
        const fontWeightProperty: string;
        const colorProperty: string;
        const opacityProperty: string;
        const paddingLeftProperty: string;
        const paddingRightProperty: string;
        const positionProperty: string;
        const maxWidthProperty: string;
        const minWidthProperty: string;
        const overflowProperty: string;
        const overflowXProperty: string;
        const overflowYProperty: string;
        const transformProperty: string;
        const webkitTransformProperty: string;
        const cursorProperty: string;
        const visibilityProperty: string;
        const absoluteValue: string;
        const zeroPixelValue: string;
        const autoValue: string;
        const hiddenValue: string;
        const noneValue: string;
        const blockValue: string;
        const inlineBlockValue: string;
        const transparentValue: string;
        const boldValue: string;
        const visibleValue: string;
        const tableRowValue: string;
        const coverValue: string;
        const pointerValue: string;
    }
    interface ExtendedCSSProperties extends CSSStyleDeclaration {
        scrollbarShadowColor: string;
        scrollbarHighlightColor: string;
        layoutGridChar: string;
        layoutGridType: string;
        textAutospace: string;
        textKashidaSpace: string;
        writingMode: string;
        scrollbarFaceColor: string;
        backgroundPositionY: string;
        lineBreak: string;
        imeMode: string;
        msBlockProgression: string;
        layoutGridLine: string;
        scrollbarBaseColor: string;
        layoutGrid: string;
        layoutFlow: string;
        textKashida: string;
        filter: string;
        zoom: string;
        scrollbarArrowColor: string;
        behavior: string;
        backgroundPositionX: string;
        accelerator: string;
        layoutGridMode: string;
        textJustifyTrim: string;
        scrollbar3dLightColor: string;
        msInterpolationMode: string;
        scrollbarTrackColor: string;
        scrollbarDarkShadowColor: string;
        styleFloat: string;
        getAttribute(attributeName: string, flags?: number): any;
        setAttribute(attributeName: string, AttributeValue: any, flags?: number): void;
        removeAttribute(attributeName: string, flags?: number): boolean;
        pixelWidth: number;
        posHeight: number;
        posLeft: number;
        pixelTop: number;
        pixelBottom: number;
        textDecorationNone: boolean;
        pixelLeft: number;
        posTop: number;
        posBottom: number;
        textDecorationOverline: boolean;
        posWidth: number;
        textDecorationLineThrough: boolean;
        pixelHeight: number;
        textDecorationBlink: boolean;
        posRight: number;
        pixelRight: number;
        textDecorationUnderline: boolean;
        webkitTransform: string;
    }
}
/**
 * Defines a Debug object. Calls to any functions in this object removed by the minifier.
 * The functions within this class are not minified away, so we use the preprocessor-style
 * comments to have the minifier remove those as well.
 */
declare module debug {
    let assertFailFunction: {
        (message: string): void;
    };
    /**
     * Asserts that the condition is true, fails otherwise.
     */
    function assert(condition: boolean, message: string): void;
    /**
     * Asserts that the value is neither null nor undefined, fails otherwise.
     */
    function assertValue<T>(value: T, message: string): void;
    /**
     * Asserts that the value is neither null nor undefined, and has a length property that returns greater than zero, fails otherwise.
     */
    function assertNonEmpty<T>(value: T[], message: string): void;
    /**
     * Makes no assertion on the given value.
     * This is documentation/placeholder that a value is possibly null or undefined (unlike assertValue).
     */
    function assertAnyValue<T>(value: T, message: string): void;
    function assertFail(message: string): void;
}
declare module powerbi {
    interface DragPayload {
    }
}
declare module jsCommon {
    interface IError extends Error {
        stack?: string;
        argument?: string;
    }
    module Errors {
        function infoNavAppAlreadyPresent(): IError;
        function invalidOperation(message: string): IError;
        function argument(argumentName: string, message: string): IError;
        function argumentNull(argumentName: string): IError;
        function argumentUndefined(argumentName: string): IError;
        function argumentOutOfRange(argumentName: string): IError;
        function pureVirtualMethodException(className: string, methodName: string): IError;
        function notImplementedException(message: string): IError;
    }
    /**
     * Captures the stack trace, if available.
     * It optionally takes the number of frames to remove from the stack trace.
     * By default, it removes the last frame to consider the calling type's
     * constructor and the temporary error used to capture the stack trace (below).
     * More levels can be requested as needed e..g. when an error is created
     * from a helper method. <Min requirement: IE10, Chrome, Firefox, Opera>.
     */
    function getStackTrace(leadingFramesToRemove?: number): string;
}
declare module jsCommon {
    interface IStringResourceProvider {
        get(id: string): string;
    }
}
declare module jsCommon {
    /**
     * Represents a promise that may be rejected by its consumer.
     */
    interface IRejectablePromise extends JQueryPromise<void> {
        reject(...args: any[]): void;
    }
    module JQueryConstants {
        const VisibleSelector: string;
    }
}
declare module jsCommon {
    /**
     * Represents a lazily instantiated value.
     */
    class Lazy<T> {
        private value;
        private factoryMethod;
        constructor(factoryMethod: () => T);
        getValue(): T;
    }
}
declare module powerbi {
    /**
     * An interface to promise/deferred,
     * which abstracts away the underlying mechanism (e.g., Angular, jQuery, etc.).
     */
    interface IPromiseFactory {
        /**
         * Creates a Deferred object which represents a task which will finish in the future.
         */
        defer<T>(): IDeferred<T>;
        /**
         * Creates a Deferred object which represents a task which will finish in the future.
         */
        defer<TSuccess, TError>(): IDeferred2<TSuccess, TError>;
        /**
         * Creates a promise that is resolved as rejected with the specified reason.
         * This api should be used to forward rejection in a chain of promises.
         * If you are dealing with the last promise in a promise chain, you don't need to worry about it.
         * When comparing deferreds/promises to the familiar behavior of try/catch/throw,
         * think of reject as the throw keyword in JavaScript.
         * This also means that if you "catch" an error via a promise error callback and you want
         * to forward the error to the promise derived from the current promise,
         * you have to "rethrow" the error by returning a rejection constructed via reject.
         *
         * @param reason Constant, message, exception or an object representing the rejection reason.
         */
        reject<TError>(reason?: TError): IPromise2<any, TError>;
        /**
         * Creates a promise that is resolved with the specified value.
         * This api should be used to forward rejection in a chain of promises.
         * If you are dealing with the last promise in a promise chain, you don't need to worry about it.
         *
         * @param value Object representing the promise result.
         */
        resolve<TSuccess>(value?: TSuccess): IPromise2<TSuccess, any>;
        /**
         * Combines multiple promises into a single promise that is resolved when all of the input promises are resolved.
         */
        all(promises: IPromise2<any, any>[]): IPromise<any[]>;
        /**
         * Wraps an object that might be a value or a then-able promise into a promise.
         * This is useful when you are dealing with an object that might or might not be a promise
         */
        when<T>(value: T | IPromise<T>): IPromise<T>;
    }
    /**
     * Represents an operation, to be completed (resolve/rejected) in the future.
     */
    interface IPromise<T> extends IPromise2<T, T> {
    }
    /**
     * Represents an operation, to be completed (resolve/rejected) in the future.
     * Success and failure types can be set independently.
     */
    interface IPromise2<TSuccess, TError> {
        /**
         * Regardless of when the promise was or will be resolved or rejected,
         * then calls one of the success or error callbacks asynchronously as soon as the result is available.
         * The callbacks are called with a single argument: the result or rejection reason.
         * Additionally, the notify callback may be called zero or more times to provide a progress indication,
         * before the promise is resolved or rejected.
         * This method returns a new promise which is resolved or rejected via
         * the return value of the successCallback, errorCallback.
         */
        then<TSuccessResult, TErrorResult>(successCallback: (promiseValue: TSuccess) => IPromise2<TSuccessResult, TErrorResult>, errorCallback?: (reason: TError) => TErrorResult): IPromise2<TSuccessResult, TErrorResult>;
        /**
         * Regardless of when the promise was or will be resolved or rejected,
         * then calls one of the success or error callbacks asynchronously as soon as the result is available.
         * The callbacks are called with a single argument: the result or rejection reason.
         * Additionally, the notify callback may be called zero or more times to provide a progress indication,
         * before the promise is resolved or rejected.
         * This method returns a new promise which is resolved or rejected via
         * the return value of the successCallback, errorCallback.
         */
        then<TSuccessResult, TErrorResult>(successCallback: (promiseValue: TSuccess) => TSuccessResult, errorCallback?: (reason: TError) => TErrorResult): IPromise2<TSuccessResult, TErrorResult>;
        /**
         * Shorthand for promise.then(null, errorCallback).
         */
        catch<TErrorResult>(onRejected: (reason: any) => IPromise2<TSuccess, TErrorResult>): IPromise2<TSuccess, TErrorResult>;
        /**
         * Shorthand for promise.then(null, errorCallback).
         */
        catch<TErrorResult>(onRejected: (reason: any) => TErrorResult): IPromise2<TSuccess, TErrorResult>;
        /**
         * Allows you to observe either the fulfillment or rejection of a promise,
         * but to do so without modifying the final value.
         * This is useful to release resources or do some clean-up that needs to be done
         * whether the promise was rejected or resolved.
         * See the full specification for more information.
         * Because finally is a reserved word in JavaScript and reserved keywords
         * are not supported as property names by ES3, you'll need to invoke
         * the method like promise['finally'](callback) to make your code IE8 and Android 2.x compatible.
         */
        finally<T, U>(finallyCallback: () => any): IPromise2<T, U>;
    }
    interface IDeferred<T> extends IDeferred2<T, T> {
    }
    interface IDeferred2<TSuccess, TError> {
        resolve(value: TSuccess): void;
        reject(reason?: TError): void;
        promise: IPromise2<TSuccess, TError>;
    }
    interface RejectablePromise2<T, E> extends IPromise2<T, E> {
        reject(reason?: E): void;
        resolved(): boolean;
        rejected(): boolean;
        pending(): boolean;
    }
    interface RejectablePromise<T> extends RejectablePromise2<T, T> {
    }
    interface IResultCallback<T> {
        (result: T, done: boolean): void;
    }
}
declare module powerbi {
    module Prototype {
        /**
         * Returns a new object with the provided obj as its prototype.
         */
        function inherit<T>(obj: T, extension?: (inherited: T) => void): T;
        /**
         * Returns a new object with the provided obj as its prototype
         * if, and only if, the prototype has not been previously set
         */
        function inheritSingle<T>(obj: T): T;
        /**
         * Uses the provided callback function to selectively replace contents in the provided array.
         * @return A new array with those values overriden
         * or undefined if no overrides are necessary.
         */
        function overrideArray<T, TArray>(prototype: TArray, override: (t: T) => T): TArray;
    }
}
interface ScriptErrorInfo {
    message: string;
    sourceUrl: string;
    lineNumber: number;
    columnNumber: number;
    stack: string;
}
interface ErrorInfoKeyValuePair {
    errorInfoKey: string;
    errorInfoValue: string;
}
interface ErrorDetails {
    message: string;
    additionalErrorInfo: ErrorInfoKeyValuePair[];
    helpLink?: string;
}
declare module jsCommon {
    module Formatting {
        /**
         * Translate .NET format into something supported by jQuery.Globalize.
         */
        function findDateFormat(value: Date, format: string, cultureName: string): {
            value: Date;
            format: string;
        };
        /**
         * Translates unsupported .NET custom format expressions to the custom expressions supported by JQuery.Globalize.
         */
        function fixDateTimeFormat(format: string): string;
    }
}
declare module jsCommon {
    /**
     * Public API.
     */
    interface IJavaScriptDependency {
        javascriptFile: string;
        onLoadCallback?: () => JQueryPromise<void>;
    }
    interface IDependency {
        javaScriptFiles?: string[];
        cssFiles?: string[];
        javaScriptFilesWithCallback?: IJavaScriptDependency[];
    }
    function requires(dependency: IDependency, to?: () => void): void;
}
declare module powerbi {
    function createJQueryPromiseFactory(): IPromiseFactory;
}
declare module powerbi {
    interface IStorageService {
        getData(key: string): any;
        setData(key: string, data: any): void;
    }
    class EphemeralStorageService implements IStorageService {
        private cache;
        private clearCacheTimerId;
        private clearCacheInterval;
        static defaultClearCacheInterval: number;
        constructor(clearCacheInterval?: number);
        getData(key: string): any;
        setData(key: string, data: any): void;
        private clearCache();
    }
    var localStorageService: IStorageService;
    const ephemeralStorageService: IStorageService;
}
declare module powerbi {
    interface ITextMeasurer {
        (textElement: SVGTextElement): number;
    }
    interface ITextAsSVGMeasurer {
        (textProperties: TextProperties): number;
    }
    interface ITextTruncator {
        (properties: TextProperties, maxWidth: number): string;
    }
    interface TextProperties {
        text?: string;
        fontFamily: string;
        fontSize: string;
        fontWeight?: string;
        fontStyle?: string;
        whiteSpace?: string;
    }
    module TextMeasurementService {
        /**
         * Removes spanElement from DOM.
         */
        function removeSpanElement(): void;
        /**
         * This method measures the width of the text with the given SVG text properties.
         * @param textProperties The text properties to use for text measurement.
         */
        function measureSvgTextWidth(textProperties: TextProperties): number;
        /**
         * This method measures the height of the text with the given SVG text properties.
         * @param textProperties The text properties to use for text measurement.
         */
        function measureSvgTextHeight(textProperties: TextProperties): number;
        /**
         * This method estimates the height of the text with the given SVG text properties.
         * @param {TextProperties} textProperties - The text properties to use for text measurement
         */
        function estimateSvgTextHeight(textProperties: TextProperties, tightFightForNumeric?: boolean): number;
        /**
         * This method measures the width of the svgElement.
         * @param svgElement The SVGTextElement to be measured.
         */
        function measureSvgTextElementWidth(svgElement: SVGTextElement): number;
        /**
         * This method fetches the text measurement properties of the given DOM element.
         * @param element The selector for the DOM Element.
         */
        function getMeasurementProperties(element: JQuery): TextProperties;
        /**
         * This method fetches the text measurement properties of the given SVG text element.
         * @param svgElement The SVGTextElement to be measured.
         */
        function getSvgMeasurementProperties(svgElement: SVGTextElement): TextProperties;
        /**
         * This method returns the width of a div element.
         * @param element The div element.
         */
        function getDivElementWidth(element: JQuery): string;
        /**
         * Compares labels text size to the available size and renders ellipses when the available size is smaller.
         * @param textProperties The text properties (including text content) to use for text measurement.
         * @param maxWidth The maximum width available for rendering the text.
        */
        function getTailoredTextOrDefault(properties: TextProperties, maxWidth: number): string;
        /**
         * Compares labels text size to the available size and renders ellipses when the available size is smaller.
         * @param textElement The SVGTextElement containing the text to render.
         * @param maxWidth The maximum width available for rendering the text.
        */
        function svgEllipsis(textElement: SVGTextElement, maxWidth: number): void;
        /**
         * Word break textContent of <text> SVG element into <tspan>s
         * Each tspan will be the height of a single line of text
         * @param textElement - the SVGTextElement containing the text to wrap
         * @param maxWidth - the maximum width available
         * @param maxHeight - the maximum height available (defaults to single line)
         * @param linePadding - (optional) padding to add to line height
        */
        function wordBreak(textElement: SVGTextElement, maxWidth: number, maxHeight: number, linePadding?: number): void;
        /**
       * Word break textContent of span element into <span>s
       * Each span will be the height of a single line of text
       * @param textElement - the element containing the text to wrap
       * @param maxWidth - the maximum width available
       * @param maxHeight - the maximum height available (defaults to single line)
       * @param linePadding - (optional) padding to add to line height
      */
        function wordBreakOverflowingText(textElement: any, maxWidth: number, maxHeight: number, linePadding?: number): void;
    }
}
declare module jsCommon {
    /**
     * Responsible for throttling input function.
     */
    class ThrottleUtility {
        private fn;
        private timerFactory;
        private delay;
        constructor(delay?: number);
        run(fn: () => void): void;
        /**
         * Note: Public for testing purpose.
         */
        timerComplete(fn: () => void): void;
    }
}
declare module jsCommon {
    interface ITimerPromiseFactory {
        /**
         * Creates a promise that will be resolved after the specified delayInMs.
         * @return Promise.
         */
        create(delayInMs: number): IRejectablePromise;
    }
    /**
     * Responsible for creating timer promises.
     */
    class TimerPromiseFactory implements ITimerPromiseFactory {
        static instance: TimerPromiseFactory;
        /**
         * {@inheritDoc}
         */
        create(delayInMs: number): IRejectablePromise;
    }
}
/**
 * Defined in host.
 */
declare var clusterUri: string;
declare module jsCommon {
    /**
     * Http Status code we are interested.
     */
    enum HttpStatusCode {
        OK = 200,
        BadRequest = 400,
        Unauthorized = 401,
        Forbidden = 403,
        RequestEntityTooLarge = 413,
    }
    /**
     * Other HTTP Constants.
     */
    module HttpConstants {
        const ApplicationOctetStream: string;
        const MultiPartFormData: string;
    }
    /**
     * Extensions to String class.
     */
    module StringExtensions {
        function format(...args: string[]): string;
        /**
         * Compares two strings for equality, ignoring case.
         */
        function equalIgnoreCase(a: string, b: string): boolean;
        function startsWithIgnoreCase(a: string, b: string): boolean;
        function startsWith(a: string, b: string): boolean;
        /** Determines whether a string contains a specified substring (while ignoring case). */
        function containsIgnoreCase(source: string, substring: string): boolean;
        /**
         * Normalizes case for a string.
         * Used by equalIgnoreCase method.
         */
        function normalizeCase(value: string): string;
        /**
         * Is string null or empty or undefined?
         * @return True if the value is null or undefined or empty string,
         * otherwise false.
         */
        function isNullOrEmpty(value: string): boolean;
        /**
         * Returns true if the string is null, undefined, empty, or only includes white spaces.
         * @return True if the str is null, undefined, empty, or only includes white spaces,
         * otherwise false.
         */
        function isNullOrUndefinedOrWhiteSpaceString(str: string): boolean;
        /**
         * Returns a value indicating whether the str contains any whitespace.
         */
        function containsWhitespace(str: string): boolean;
        /**
         * Returns a value indicating whether the str is a whitespace string.
         */
        function isWhitespace(str: string): boolean;
        /**
         * Returns the string with any trailing whitespace from str removed.
         */
        function trimTrailingWhitespace(str: string): string;
        /**
         * Returns the string with any leading and trailing whitespace from str removed.
         */
        function trimWhitespace(str: string): string;
        /**
         * Returns length difference between the two provided strings.
         */
        function getLengthDifference(left: string, right: string): number;
        /**
         * Repeat char or string several times.
         * @param char The string to repeat.
         * @param count How many times to repeat the string.
         */
        function repeat(char: string, count: number): string;
        /**
         * Replace all the occurrences of the textToFind in the text with the textToReplace.
         * @param text The original string.
         * @param textToFind Text to find in the original string.
         * @param textToReplace New text replacing the textToFind.
         */
        function replaceAll(text: string, textToFind: string, textToReplace: string): string;
        function ensureUniqueNames(names: string[]): string[];
        /**
         * Returns a name that is not specified in the values.
         */
        function findUniqueName(usedNames: {
            [name: string]: boolean;
        }, baseName: string): string;
        function constructCommaSeparatedList(list: string[], resourceProvider: IStringResourceProvider, maxValue?: number): string;
        function escapeStringForRegex(s: string): string;
    }
    /**
     * Interface used for interacting with WCF typed objects.
     */
    interface TypedObject {
        __type: string;
    }
    /**
     * The general utility class.
     */
    class Utility {
        private static TypeNamespace;
        static JsonContentType: string;
        static JpegContentType: string;
        static XJavascriptContentType: string;
        static JsonDataType: string;
        static BlobDataType: string;
        static HttpGetMethod: string;
        static HttpPostMethod: string;
        static HttpPutMethod: string;
        static HttpDeleteMethod: string;
        static HttpContentTypeHeader: string;
        static HttpAcceptHeader: string;
        static Undefined: string;
        private static staticContentLocation;
        /**
         * Ensures the specified value is not null or undefined. Throws a relevent exception if it is.
         * @param value The value to check.
         * @param context The context from which the check originated.
         * @param methodName The name of the method that initiated the check.
         * @param parameterName The parameter name of the value to check.
         */
        static throwIfNullOrUndefined(value: any, context: any, methodName: any, parameterName: any): void;
        /**
         * Ensures the specified value is not null, undefined or empty. Throws a relevent exception if it is.
         * @param value The value to check.
         * @param context The context from which the check originated.
         * @param methodName The name of the method that initiated the check.
         * @param parameterName The parameter name of the value to check.
         */
        static throwIfNullOrEmpty(value: any, context: any, methodName: string, parameterName: string): void;
        /**
         * Ensures the specified string is not null, undefined or empty. Throws a relevent exception if it is.
         * @param value The value to check.
         * @param context The context from which the check originated.
         * @param methodName The name of the method that initiated the check.
         * @param parameterName The parameter name of the value to check.
         */
        static throwIfNullOrEmptyString(value: string, context: any, methodName: string, parameterName: string): void;
        /**
         * Ensures the specified value is not null, undefined, whitespace or empty. Throws a relevent exception if it is.
         * @param value The value to check.
         * @param context The context from which the check originated.
         * @param methodName The name of the method that initiated the check.
         * @param parameterName The parameter name of the value to check.
         */
        static throwIfNullEmptyOrWhitespaceString(value: string, context: any, methodName: string, parameterName: string): void;
        /**
         * Ensures the specified condition is true. Throws relevant exception if it isn't.
         * @param condition The condition to check.
         * @param context The context from which the check originated.
         * @param methodName The name of the method that initiated the check.
         * @param parameterName The parameter name against which the condition is checked.
         */
        static throwIfNotTrue(condition: boolean, context: any, methodName: string, parameterName: string): void;
        /**
         * Checks whether the provided value is a 'string'.
         * @param value The value to test.
         */
        static isString(value: any): boolean;
        /**
         * Checks whether the provided value is a 'boolean'.
         * @param value The value to test.
         */
        static isBoolean(value: any): boolean;
        /**
         * Checks whether the provided value is a 'number'.
         * @param value The value to test.
         */
        static isNumber(value: any): boolean;
        /**
         * Checks whether the provided value is a Date instance.
         * @param value The value to test.
         */
        static isDate(value: any): boolean;
        /**
         * Checks whether the provided value is an 'object'.
         * @param value The value to test.
         */
        static isObject(value: any): boolean;
        /**
         * Checks whether the provided value is null or undefined.
         * @param value The value to test.
         */
        static isNullOrUndefined(value: any): boolean;
        /**
         * Combine a base url and a path.
         * @param baseUrl The base url.
         * @param path The path to add on to the base url.
         * @returns The combined url.
         */
        static urlCombine(baseUrl: string, path: string): string;
        static getAbsoluteUri(path: string): string;
        static getStaticResourceUri(path: string): string;
        static getComponentName(context: any): string;
        static throwException(e: any): void;
        static createClassSelector(className: string): string;
        static createIdSelector(id: string): string;
        /**
         * Creates a client-side Guid string.
         * @returns A string representation of a Guid.
         */
        static generateGuid(): string;
        /**
         * Try extract a cookie from {@link document.cookie} identified by key.
         */
        static getCookieValue(key: string): string;
        /**
         * Extracts the protocol://hostname section of a url.
         * @param url The URL from which to extract the section.
         * @returns The protocol://hostname portion of the given URL.
         */
        static getDomainForUrl(url: string): string;
        /**
         * Extracts the hostname and absolute path sections of a url.
         * @param url The URL from which to extract the section.
         * @returns The hostname and absolute path portion of the given URL.
         */
        static getHostNameForUrl(url: string): string;
        /**
         * Return the original url with query string stripped.
         * @param url The URL from which to extract the section.
         * @returns the original url with query string stripped.
         */
        static getUrlWithoutQueryString(url: string): string;
        /**
         * Extracts the protocol section of a url.
         * @param url The URL from which to extract the section.
         * @returns The protocol for the current URL.
         */
        static getProtocolFromUrl(url: string): string;
        /**
         * Returns a formatted href object from a URL.
         * @param url The URL used to generate the object.
         * @returns A jQuery object with the url.
         */
        static getHrefObjectFromUrl(url: string): JQuery;
        /**
         * Converts a WCF representation of a dictionary to a JavaScript dictionary.
         * @param wcfDictionary The WCF dictionary to convert.
         * @returns The native JavaScript representation of this dictionary.
         */
        static convertWcfToJsDictionary(wcfDictionary: any[]): {
            [index: string]: any;
        };
        static getDateFromWcfJsonString(jsonDate: string, fromUtcMilliseconds: boolean): Date;
        /**
         * Get the outer html of the given jquery object.
         * @param content The jquery object.
         * @returns The entire html representation of the object.
         */
        static getOuterHtml(content: JQuery): string;
        /**
         * Comparison Method: Compares two integer numbers.
         * @param a An integer value.
         * @param b An integer value.
         * @returns The comparison result.
         */
        static compareInt(a: number, b: number): number;
        /**
         * Return the index of the smallest value in a numerical array.
         * @param a A numeric array.
         * @returns The index of the smallest value in the array.
         */
        static getIndexOfMinValue(a: number[]): number;
        /**
         * Tests whether a URL is valid.
         * @param url The url to be tested.
         * @returns Whether the provided url is valid.
         */
        static isValidUrl(url: string): boolean;
        /**
         * Extracts a url from a background image attribute in the format of: url('www.foobar.com/image.png').
         * @param input The value of the background-image attribute.
         * @returns The extracted url.
         */
        static extractUrlFromCssBackgroundImage(input: string): string;
        /**
         * Verifies image data url of images.
         */
        static isValidImageDataUrl(url: string): boolean;
        /**
         * Downloads a content string as a file.
         * @param content Content stream.
         * @param fileName File name to use.
         */
        static saveAsFile(content: any, fileName: string): void;
        /**
         * Helper method to get the simple type name from a typed object.
         * @param obj The typed object.
         * @returns The simple type name for the object.
         */
        static getType(obj: TypedObject): string;
        /**
         * Check if an element supports a specific event type.
         * @param eventName The name of the event.
         * @param element The element to test for event support.
         * @returns Whether the even is supported on the provided element.
         */
        static isEventSupported(eventName: string, element: Element): boolean;
        static toPixel(pixelAmount: number): string;
        static getPropertyCount(object: any): number;
        /**
         * Check if an element supports a specific event type.
         * @param filePath File path.
         * @returns File extension.
         */
        static getFileExtension(filePath: string): string;
        /**
         * Extract the filename out of a full path delimited by '\' or '/'.
         * @param filePath File path.
         * @returns filename File name.
         */
        static extractFileNameFromPath(filePath: string): string;
        /**
         * This method indicates whether window.clipboardData is supported.
         * For example, clipboard support for Windows Store apps is currently disabled
         * since window.clipboardData is unsupported (it raises access denied error)
         * since clipboard in Windows Store is being
         * achieved through Windows.ApplicationModel.DataTransfer.Clipboard class.
         */
        static canUseClipboard(): boolean;
        static is64BitOperatingSystem(): boolean;
        static parseNumber(value: any, defaultValue?: number): number;
        static getURLParamValue(name: string): string | number;
        /**
         * Return local timezone.
         * This function uses summer and winter offset to determine local time zone.
         * The result localTimeZoneString must be a subset of the strings used by server,
         * as documented here: https://msdn.microsoft.com/en-us/library/gg154758.aspx (Dynamic Daylight Savings Time (Compact 2013)).
         * @return Local timezone string or UTC if timezone cannot be found.
         */
        static getLocalTimeZoneString(): string;
    }
    class VersionUtility {
        /**
         * Compares 2 version strings.
         * @param versionA The first version string.
         * @param versionB The second version string.
         * @returns A result for the comparison.
         */
        static compareVersions(versionA: string, versionB: string): number;
    }
    module PerformanceUtil {
        class PerfMarker {
            private _name;
            private _start;
            constructor(name: string);
            private static begin(name);
            end(): void;
        }
        function create(name: string): PerfMarker;
    }
    module DeferUtility {
        /**
         * Wraps a callback and returns a new function.
         * The function can be called many times but the callback
         * will only be executed once on the next frame.
         * Use this to throttle big UI updates and access to DOM.
         */
        function deferUntilNextFrame(callback: Function): Function;
    }
}
declare module jsCommon {
    class TraceItem {
        type: TraceType;
        sessionId: string;
        requestId: string;
        text: string;
        timeStamp: Date;
        /**
         * Note: DO NOT USE for backward compability only.
         */
        _activityId: string;
        private static traceTypeStrings;
        constructor(text: string, type: TraceType, sessionId: string, requestId?: string);
        toString(): string;
    }
}
declare module jsCommon {
    /**
     * Interface to help define objects indexed by number to a particular type.
     */
    interface INumberDictionary<T> {
        [key: number]: T;
    }
    /**
     * Interface to help define objects indexed by name to a particular type.
     */
    interface IStringDictionary<T> {
        [key: string]: T;
    }
    /**
     * Extensions for Enumerations.
     */
    module EnumExtensions {
        /**
         * Gets a value indicating whether the value has the bit flags set.
         */
        function hasFlag(value: number, flag: number): boolean;
        /**
         * Sets a value of a flag without modifying any other flags.
         */
        function setFlag(value: number, flag: number): number;
        /**
         * Resets a value of a flag without modifying any other flags.
         */
        function resetFlag(value: number, flag: number): number;
        /**
         * According to the TypeScript Handbook, this is safe to do.
         */
        function toString(enumType: any, value: number): string;
    }
    /**
     * Extensions to String class.
     */
    module StringExtensions {
        /**
         * Checks if a string ends with a sub-string.
         */
        function endsWith(str: string, suffix: string): boolean;
    }
    module LogicExtensions {
        function XOR(a: boolean, b: boolean): boolean;
    }
    module JsonComparer {
        /**
         * Performs JSON-style comparison of two objects.
         */
        function equals<T>(x: T, y: T): boolean;
    }
    /**
     * Values are in terms of 'pt'
     * Convert to pixels using PixelConverter.fromPoint
     */
    module TextSizeDefaults {
        /**
         * Stored in terms of 'pt'
         * Convert to pixels using PixelConverter.fromPoint
         */
        const TextSizeMin: number;
        /**
         * Stored in terms of 'pt'
         * Convert to pixels using PixelConverter.fromPoint
         */
        const TextSizeMax: number;
        /**
         * Returns the percentage of this value relative to the TextSizeMax
         * @param textSize - should be given in terms of 'pt'
         */
        function getScale(textSize: number): number;
    }
    module PixelConverter {
        /**
         * Appends 'px' to the end of number value for use as pixel string in styles
         */
        function toString(px: number): string;
        /**
         * Converts point value (pt) to pixels
         * Returns a string for font-size property
         * e.g. fromPoint(8) => '24px'
         */
        function fromPoint(pt: number): string;
        /**
       * Converts point value (pt) to pixels
       * Returns a number for font-size property
       * e.g. fromPoint(8) => 24px
       */
        function fromPointToPixel(pt: number): number;
        /**
         * Converts pixel value (px) to pt
         * e.g. toPoint(24) => 8
         */
        function toPoint(px: number): number;
    }
}
declare module jsCommon {
    interface ITraceListener {
        logTrace(trace: TraceItem): void;
    }
    class ConsoleTracer implements ITraceListener {
        logTrace(trace: TraceItem): void;
    }
    module Trace {
        /**
         * Trace a warning. Please ensure that no PII is being logged.
         */
        function warning(text: string, requestId?: string): void;
        /**
         * Trace an error. Please ensure that no PII is being logged.
         */
        function error(text: string, includeStackTrace?: boolean, requestId?: string): void;
        /**
         * Trace an information. Please ensure that no PII is being logged.
         */
        function verbose(text: string, requestId?: string): void;
        function addListener(listener: ITraceListener): void;
        function removeListener(listener: ITraceListener): void;
        function resetListeners(): void;
        function reset(): void;
        function getTraces(): Array<TraceItem>;
        /**
         * Note: Used for unit-test only.
         */
        function disableDefaultListener(): void;
        function enableDefaultListener(): void;
    }
}
declare module jsCommon {
    /**
     * The types of possible traces within the system, this aligns to the traces available in Cloud Platform.
     */
    enum TraceType {
        Information = 0,
        Verbose = 1,
        Warning = 2,
        Error = 3,
        ExpectedError = 4,
        UnexpectedError = 5,
        Fatal = 6,
    }
}
declare module jsCommon {
    function ensurePowerView(action?: () => void): void;
    function ensureMap(action: () => void): void;
    function mapControlLoaded(): void;
    function waitForMapControlLoaded(): JQueryPromise<void>;
}
declare let globalMapControlLoaded: () => void;
declare module jsCommon {
    interface ArrayIdItems<T> extends Array<T> {
        withId(id: number): T;
    }
    interface ArrayNamedItems<T> extends Array<T> {
        withName(name: string): T;
    }
    module ArrayExtensions {
        /**
         * Returns items that exist in target and other.
         */
        function intersect<T>(target: T[], other: T[]): T[];
        /**
         * Return elements exists in target but not exists in other.
         */
        function diff<T>(target: T[], other: T[]): T[];
        /**
         * Return an array with only the distinct items in the source.
         */
        function distinct<T>(source: T[]): T[];
        /**
         * Pushes content of source onto target,
         * for parts of course that do not already exist in target.
         */
        function union<T>(target: T[], source: T[]): void;
        /**
         * Pushes value onto target, if value does not already exist in target.
         */
        function unionSingle<T>(target: T[], value: T): void;
        /**
         * Returns an array with a range of items from source,
         * including the startIndex & endIndex.
         */
        function range<T>(source: T[], startIndex: number, endIndex: number): T[];
        /**
         * Returns an array that includes items from source, up to the specified count.
         */
        function take<T>(source: T[], count: number): T[];
        function copy<T>(source: T[]): T[];
        /**
         * Returns a value indicating whether the arrays have the same values in the same sequence.
         */
        function sequenceEqual<T>(left: T[], right: T[], comparison: (x: T, y: T) => boolean): boolean;
        /**
         * Returns null if the specified array is empty.
         * Otherwise returns the specified array.
         */
        function emptyToNull<T>(array: T[]): T[];
        function indexOf<T>(array: T[], predicate: (t: T) => boolean): number;
        /**
         * Returns a copy of the array rotated by the specified offset.
         */
        function rotate<T>(array: T[], offset: number): T[];
        function createWithId<T>(): ArrayIdItems<T>;
        function extendWithId<T>(array: {
            id: number;
        }[]): ArrayIdItems<T>;
        /**
         * Finds and returns the first item with a matching ID.
         */
        function findWithId<T>(array: T[], id: number): T;
        function createWithName<T>(): ArrayNamedItems<T>;
        function extendWithName<T>(array: {
            name: string;
        }[]): ArrayNamedItems<T>;
        function findItemWithName<T>(array: T[], name: string): T;
        function indexWithName<T>(array: T[], name: string): number;
        /**
         * Deletes all items from the array.
         */
        function clear(array: any[]): void;
        function isUndefinedOrEmpty(array: any[]): boolean;
        function isArray(object: any): boolean;
        function swap<T>(array: T[], firstIndex: number, secondIndex: number): void;
    }
}
declare module InJs {
    /**
     * The types of possible traces within the system, this aligns to the traces available in Cloud Platform.
     */
    enum TraceType {
        information = 0,
        verbose = 1,
        warning = 2,
        error = 3,
        expectedError = 4,
        unexpectedError = 5,
        fatal = 6,
    }
}
declare module jsCommon {
    module WordBreaker {
        import TextProperties = powerbi.TextProperties;
        import ITextAsSVGMeasurer = powerbi.ITextAsSVGMeasurer;
        import ITextTruncator = powerbi.ITextTruncator;
        interface WordBreakerResult {
            start: number;
            end: number;
        }
        /**
         * Find the word nearest the cursor specified within content
         * @param index - point within content to search forward/backward from
         * @param content - string to search
        */
        function find(index: number, content: string): WordBreakerResult;
        /**
         * Test for presence of breakers within content
         * @param content - string to test
        */
        function hasBreakers(content: string): boolean;
        /**
         * Count the number of pieces when broken by BREAKERS_REGEX
         * ~2.7x faster than WordBreaker.split(content).length
         * @param content - string to break and count
        */
        function wordCount(content: string): number;
        function getMaxWordWidth(content: string, textWidthMeasurer: ITextAsSVGMeasurer, properties: TextProperties): number;
        /**
         * Split content by breakers (words) and greedy fit as many words
         * into each index in the result based on max width and number of lines
         * e.g. Each index in result corresponds to a line of content
         *      when used by AxisHelper.LabelLayoutStrategy.wordBreak
         * @param content - string to split
         * @param properties - text properties to be used by @param:textWidthMeasurer
         * @param textWidthMeasurer - function to calculate width of given text content
         * @param maxWidth - maximum allowed width of text content in each result
         * @param maxNumLines - maximum number of results we will allow, valid values must be greater than 0
         * @param truncator - (optional) if specified, used as a function to truncate content to a given width
        */
        function splitByWidth(content: string, properties: TextProperties, textWidthMeasurer: ITextAsSVGMeasurer, maxWidth: number, maxNumLines: number, truncator?: ITextTruncator): string[];
    }
}

declare module powerbi.data {
    /** Allows generic traversal and type discovery for a SQExpr tree. */
    interface ISQExprVisitorWithArg<T, TArg> {
        visitEntity(expr: SQEntityExpr, arg: TArg): T;
        visitColumnRef(expr: SQColumnRefExpr, arg: TArg): T;
        visitMeasureRef(expr: SQMeasureRefExpr, arg: TArg): T;
        visitAggr(expr: SQAggregationExpr, arg: TArg): T;
        visitHierarchy(expr: SQHierarchyExpr, arg: TArg): T;
        visitHierarchyLevel(expr: SQHierarchyLevelExpr, arg: TArg): T;
        visitPropertyVariationSource(expr: SQPropertyVariationSourceExpr, arg: TArg): T;
        visitAnd(expr: SQAndExpr, arg: TArg): T;
        visitBetween(expr: SQBetweenExpr, arg: TArg): T;
        visitIn(expr: SQInExpr, arg: TArg): T;
        visitOr(expr: SQOrExpr, arg: TArg): T;
        visitCompare(expr: SQCompareExpr, arg: TArg): T;
        visitContains(expr: SQContainsExpr, arg: TArg): T;
        visitExists(expr: SQExistsExpr, arg: TArg): T;
        visitNot(expr: SQNotExpr, arg: TArg): T;
        visitStartsWith(expr: SQStartsWithExpr, arg: TArg): T;
        visitConstant(expr: SQConstantExpr, arg: TArg): T;
        visitDateSpan(expr: SQDateSpanExpr, arg: TArg): T;
        visitDateAdd(expr: SQDateAddExpr, arg: TArg): T;
        visitNow(expr: SQNowExpr, arg: TArg): T;
        visitDefaultValue(expr: SQDefaultValueExpr, arg: TArg): T;
        visitAnyValue(expr: SQAnyValueExpr, arg: TArg): T;
    }
    interface ISQExprVisitor<T> extends ISQExprVisitorWithArg<T, void> {
    }
    /** Default IQueryExprVisitorWithArg implementation that others may derive from. */
    class DefaultSQExprVisitorWithArg<T, TArg> implements ISQExprVisitorWithArg<T, TArg> {
        visitEntity(expr: SQEntityExpr, arg: TArg): T;
        visitColumnRef(expr: SQColumnRefExpr, arg: TArg): T;
        visitMeasureRef(expr: SQMeasureRefExpr, arg: TArg): T;
        visitAggr(expr: SQAggregationExpr, arg: TArg): T;
        visitHierarchy(expr: SQHierarchyExpr, arg: TArg): T;
        visitHierarchyLevel(expr: SQHierarchyLevelExpr, arg: TArg): T;
        visitPropertyVariationSource(expr: SQPropertyVariationSourceExpr, arg: TArg): T;
        visitBetween(expr: SQBetweenExpr, arg: TArg): T;
        visitIn(expr: SQInExpr, arg: TArg): T;
        visitAnd(expr: SQAndExpr, arg: TArg): T;
        visitOr(expr: SQOrExpr, arg: TArg): T;
        visitCompare(expr: SQCompareExpr, arg: TArg): T;
        visitContains(expr: SQContainsExpr, arg: TArg): T;
        visitExists(expr: SQExistsExpr, arg: TArg): T;
        visitNot(expr: SQNotExpr, arg: TArg): T;
        visitStartsWith(expr: SQStartsWithExpr, arg: TArg): T;
        visitConstant(expr: SQConstantExpr, arg: TArg): T;
        visitDateSpan(expr: SQDateSpanExpr, arg: TArg): T;
        visitDateAdd(expr: SQDateAddExpr, arg: TArg): T;
        visitNow(expr: SQNowExpr, arg: TArg): T;
        visitDefaultValue(expr: SQDefaultValueExpr, arg: TArg): T;
        visitAnyValue(expr: SQAnyValueExpr, arg: TArg): T;
        visitDefault(expr: SQExpr, arg: TArg): T;
    }
    /** Default ISQExprVisitor implementation that others may derive from. */
    class DefaultSQExprVisitor<T> extends DefaultSQExprVisitorWithArg<T, void> implements ISQExprVisitor<T> {
    }
    /** Default ISQExprVisitor implementation that implements default traversal and that others may derive from. */
    class DefaultSQExprVisitorWithTraversal implements ISQExprVisitor<void> {
        visitEntity(expr: SQEntityExpr): void;
        visitColumnRef(expr: SQColumnRefExpr): void;
        visitMeasureRef(expr: SQMeasureRefExpr): void;
        visitAggr(expr: SQAggregationExpr): void;
        visitHierarchy(expr: SQHierarchyExpr): void;
        visitHierarchyLevel(expr: SQHierarchyLevelExpr): void;
        visitPropertyVariationSource(expr: SQPropertyVariationSourceExpr): void;
        visitBetween(expr: SQBetweenExpr): void;
        visitIn(expr: SQInExpr): void;
        visitAnd(expr: SQAndExpr): void;
        visitOr(expr: SQOrExpr): void;
        visitCompare(expr: SQCompareExpr): void;
        visitContains(expr: SQContainsExpr): void;
        visitExists(expr: SQExistsExpr): void;
        visitNot(expr: SQNotExpr): void;
        visitStartsWith(expr: SQStartsWithExpr): void;
        visitConstant(expr: SQConstantExpr): void;
        visitDateSpan(expr: SQDateSpanExpr): void;
        visitDateAdd(expr: SQDateAddExpr): void;
        visitNow(expr: SQNowExpr): void;
        visitDefaultValue(expr: SQDefaultValueExpr): void;
        visitAnyValue(expr: SQAnyValueExpr): void;
        visitDefault(expr: SQExpr): void;
    }
}
declare module powerbi {
    interface DefaultValueDefinition {
        value: data.SQConstantExpr;
        identityFieldsValues?: data.SQConstantExpr[];
    }
    interface DefaultValueTypeDescriptor {
        defaultValue: boolean;
    }
}
declare module powerbi {
    import DisplayNameGetter = powerbi.data.DisplayNameGetter;
    type EnumMemberValue = string | number;
    interface IEnumMember {
        value: EnumMemberValue;
        displayName: DisplayNameGetter;
    }
    /** Defines a custom enumeration data type, and its values. */
    interface IEnumType {
        /** Gets the members of the enumeration, limited to the validMembers, if appropriate. */
        members(validMembers?: EnumMemberValue[]): IEnumMember[];
    }
    function createEnumType(members: IEnumMember[]): IEnumType;
}
declare module powerbi {
    import SQExpr = powerbi.data.SQExpr;
    interface FillTypeDescriptor {
        solid?: {
            color?: FillSolidColorTypeDescriptor;
        };
        gradient?: {
            startColor?: boolean;
            endColor?: boolean;
        };
        pattern?: {
            patternKind?: boolean;
            color?: boolean;
        };
    }
    type FillSolidColorTypeDescriptor = boolean | FillSolidColorAdvancedTypeDescriptor;
    interface FillSolidColorAdvancedTypeDescriptor {
        /** Indicates whether the color value may be nullable, and a 'no fill' option is appropriate. */
        nullable: boolean;
    }
    interface FillDefinition {
        solid?: {
            color?: SQExpr;
        };
        gradient?: {
            startColor?: SQExpr;
            endColor?: SQExpr;
        };
        pattern?: {
            patternKind?: SQExpr;
            color?: SQExpr;
        };
    }
    interface Fill {
        solid?: {
            color?: string;
        };
        gradient?: {
            startColor?: string;
            endColor?: string;
        };
        pattern?: {
            patternKind?: string;
            color?: string;
        };
    }
    module FillSolidColorTypeDescriptor {
        /** Gets a value indicating whether the descriptor is nullable or not. */
        function nullable(descriptor: FillSolidColorTypeDescriptor): boolean;
    }
}
declare module powerbi {
    import SQExpr = powerbi.data.SQExpr;
    interface FillRuleTypeDescriptor {
    }
    interface FillRuleDefinition extends FillRuleGeneric<SQExpr, SQExpr> {
    }
    interface FillRule extends FillRuleGeneric<string, number> {
    }
    interface FillRuleGeneric<TColor, TValue> {
        linearGradient2?: LinearGradient2Generic<TColor, TValue>;
        linearGradient3?: LinearGradient3Generic<TColor, TValue>;
    }
    type LinearGradient2 = LinearGradient2Generic<string, number>;
    type LinearGradient3 = LinearGradient3Generic<string, number>;
    interface LinearGradient2Generic<TColor, TValue> {
        max: RuleColorStopGeneric<TColor, TValue>;
        min: RuleColorStopGeneric<TColor, TValue>;
    }
    interface LinearGradient3Generic<TColor, TValue> {
        max: RuleColorStopGeneric<TColor, TValue>;
        mid: RuleColorStopGeneric<TColor, TValue>;
        min: RuleColorStopGeneric<TColor, TValue>;
    }
    type RuleColorStopDefinition = RuleColorStopGeneric<SQExpr, SQExpr>;
    type RuleColorStop = RuleColorStopGeneric<string, number>;
    interface RuleColorStopGeneric<TColor, TValue> {
        color: TColor;
        value?: TValue;
    }
}
declare module powerbi {
    interface FilterTypeDescriptor {
    }
}
declare module powerbi {
    import SQExpr = powerbi.data.SQExpr;
    interface ParagraphsTypeDescriptor {
    }
    type ParagraphsDefinition = ParagraphDefinition[];
    type ParagraphDefinition = ParagraphDefinitionGeneric<SQExpr>;
    type TextRunDefinition = TextRunDefinitionGeneric<SQExpr>;
    interface ParagraphDefinitionGeneric<TExpr> {
        horizontalTextAlignment?: string;
        textRuns: TextRunDefinitionGeneric<TExpr>[];
    }
    interface TextRunDefinitionGeneric<TExpr> {
        textStyle?: TextRunStyle;
        url?: string;
        value: string | TExpr;
    }
    type Paragraphs = Paragraph[];
    interface Paragraph {
        horizontalTextAlignment?: string;
        textRuns: TextRun[];
    }
    interface TextRunStyle {
        fontFamily?: string;
        fontSize?: string;
        fontStyle?: string;
        fontWeight?: string;
        textDecoration?: string;
    }
    interface TextRun {
        textStyle?: TextRunStyle;
        url?: string;
        value: string;
    }
}
declare module powerbi {
    import SemanticFilter = powerbi.data.SemanticFilter;
    /** Describes a structural type in the client type system. Leaf properties should use ValueType. */
    interface StructuralTypeDescriptor {
        fill?: FillTypeDescriptor;
        fillRule?: FillRuleTypeDescriptor;
        filter?: FilterTypeDescriptor;
        expression?: DefaultValueTypeDescriptor;
        paragraphs?: ParagraphsTypeDescriptor;
    }
    type StructuralObjectDefinition = FillDefinition | FillRuleDefinition | SemanticFilter | DefaultValueDefinition | ParagraphsDefinition;
    /** Defines instances of structural types. */
    type StructuralObjectValue = Fill | FillRule | SemanticFilter | DefaultValueDefinition | Paragraphs;
    module StructuralTypeDescriptor {
        function isValid(type: StructuralTypeDescriptor): boolean;
    }
}
declare module powerbi {
    /** Describes instances of value type objects. */
    type PrimitiveValue = string | number | boolean | Date;
    /** Describes a data value type in the client type system. Can be used to get a concrete ValueType instance. */
    interface ValueTypeDescriptor {
        text?: boolean;
        numeric?: boolean;
        integer?: boolean;
        bool?: boolean;
        dateTime?: boolean;
        duration?: boolean;
        binary?: boolean;
        none?: boolean;
        temporal?: TemporalTypeDescriptor;
        geography?: GeographyTypeDescriptor;
        misc?: MiscellaneousTypeDescriptor;
        formatting?: FormattingTypeDescriptor;
        extendedType?: ExtendedType;
        enumeration?: IEnumType;
        scripting?: ScriptTypeDescriptor;
    }
    interface ScriptTypeDescriptor {
        source?: boolean;
    }
    interface TemporalTypeDescriptor {
        year?: boolean;
        month?: boolean;
    }
    interface GeographyTypeDescriptor {
        address?: boolean;
        city?: boolean;
        continent?: boolean;
        country?: boolean;
        county?: boolean;
        region?: boolean;
        postalCode?: boolean;
        stateOrProvince?: boolean;
        place?: boolean;
        latitude?: boolean;
        longitude?: boolean;
    }
    interface MiscellaneousTypeDescriptor {
        image?: boolean;
        imageUrl?: boolean;
        webUrl?: boolean;
    }
    interface FormattingTypeDescriptor {
        color?: boolean;
        formatString?: boolean;
        alignment?: boolean;
        labelDisplayUnits?: boolean;
        fontSize?: boolean;
        labelDensity?: boolean;
    }
    /** Describes a data value type, including a primitive type and extended type if any (derived from data category). */
    class ValueType implements ValueTypeDescriptor {
        private static typeCache;
        private underlyingType;
        private category;
        private temporalType;
        private geographyType;
        private miscType;
        private formattingType;
        private enumType;
        private scriptingType;
        /** Do not call the ValueType constructor directly. Use the ValueType.fromXXX methods. */
        constructor(type: ExtendedType, category?: string, enumType?: IEnumType);
        /** Creates or retrieves a ValueType object based on the specified ValueTypeDescriptor. */
        static fromDescriptor(descriptor: ValueTypeDescriptor): ValueType;
        /** Advanced: Generally use fromDescriptor instead. Creates or retrieves a ValueType object for the specified ExtendedType. */
        static fromExtendedType(extendedType: ExtendedType): ValueType;
        /** Creates or retrieves a ValueType object for the specified PrimitiveType and data category. */
        static fromPrimitiveTypeAndCategory(primitiveType: PrimitiveType, category?: string): ValueType;
        /** Creates a ValueType to describe the given IEnumType. */
        static fromEnum(enumType: IEnumType): ValueType;
        /** Determines if the instance ValueType is convertable from the 'other' ValueType. */
        isCompatibleFrom(other: ValueType): boolean;
        /** Gets the exact primitive type of this ValueType. */
        primitiveType: PrimitiveType;
        /** Gets the exact extended type of this ValueType. */
        extendedType: ExtendedType;
        /** Gets the data category string (if any) for this ValueType. */
        categoryString: string;
        /** Indicates whether the type represents text values. */
        text: boolean;
        /** Indicates whether the type represents any numeric value. */
        numeric: boolean;
        /** Indicates whether the type represents integer numeric values. */
        integer: boolean;
        /** Indicates whether the type represents Boolean values. */
        bool: boolean;
        /** Indicates whether the type represents any date/time values. */
        dateTime: boolean;
        /** Indicates whether the type represents duration values. */
        duration: boolean;
        /** Indicates whether the type represents binary values. */
        binary: boolean;
        /** Indicates whether the type represents none values. */
        none: boolean;
        /** Returns an object describing temporal values represented by the type, if it represents a temporal type. */
        temporal: TemporalType;
        /** Returns an object describing geographic values represented by the type, if it represents a geographic type. */
        geography: GeographyType;
        /** Returns an object describing the specific values represented by the type, if it represents a miscellaneous extended type. */
        misc: MiscellaneousType;
        /** Returns an object describing the formatting values represented by the type, if it represents a formatting type. */
        formatting: FormattingType;
        /** Returns an object describing the enum values represented by the type, if it represents an enumeration type. */
        enum: IEnumType;
        scripting: ScriptType;
    }
    class ScriptType implements ScriptTypeDescriptor {
        private underlyingType;
        constructor(type: ExtendedType);
        source: boolean;
    }
    class TemporalType implements TemporalTypeDescriptor {
        private underlyingType;
        constructor(type: ExtendedType);
        year: boolean;
        month: boolean;
    }
    class GeographyType implements GeographyTypeDescriptor {
        private underlyingType;
        constructor(type: ExtendedType);
        address: boolean;
        city: boolean;
        continent: boolean;
        country: boolean;
        county: boolean;
        region: boolean;
        postalCode: boolean;
        stateOrProvince: boolean;
        place: boolean;
        latitude: boolean;
        longitude: boolean;
    }
    class MiscellaneousType implements MiscellaneousTypeDescriptor {
        private underlyingType;
        constructor(type: ExtendedType);
        image: boolean;
        imageUrl: boolean;
        webUrl: boolean;
    }
    class FormattingType implements FormattingTypeDescriptor {
        private underlyingType;
        constructor(type: ExtendedType);
        color: boolean;
        formatString: boolean;
        alignment: boolean;
        labelDisplayUnits: boolean;
        fontSize: boolean;
        labelDensity: boolean;
    }
    /** Defines primitive value types. Must be consistent with types defined by server conceptual schema. */
    enum PrimitiveType {
        Null = 0,
        Text = 1,
        Decimal = 2,
        Double = 3,
        Integer = 4,
        Boolean = 5,
        Date = 6,
        DateTime = 7,
        DateTimeZone = 8,
        Time = 9,
        Duration = 10,
        Binary = 11,
        None = 12,
    }
    /** Defines extended value types, which include primitive types and known data categories constrained to expected primitive types. */
    enum ExtendedType {
        Numeric = 256,
        Temporal = 512,
        Geography = 1024,
        Miscellaneous = 2048,
        Formatting = 4096,
        Scripting = 8192,
        Null = 0,
        Text = 1,
        Decimal = 258,
        Double = 259,
        Integer = 260,
        Boolean = 5,
        Date = 518,
        DateTime = 519,
        DateTimeZone = 520,
        Time = 521,
        Duration = 10,
        Binary = 11,
        None = 12,
        Year = 66048,
        Year_Text = 66049,
        Year_Integer = 66308,
        Year_Date = 66054,
        Year_DateTime = 66055,
        Month = 131584,
        Month_Text = 131585,
        Month_Integer = 131844,
        Month_Date = 131590,
        Month_DateTime = 131591,
        Address = 6554625,
        City = 6620161,
        Continent = 6685697,
        Country = 6751233,
        County = 6816769,
        Region = 6882305,
        PostalCode = 6947840,
        PostalCode_Text = 6947841,
        PostalCode_Integer = 6948100,
        StateOrProvince = 7013377,
        Place = 7078913,
        Latitude = 7144448,
        Latitude_Decimal = 7144706,
        Latitude_Double = 7144707,
        Longitude = 7209984,
        Longitude_Decimal = 7210242,
        Longitude_Double = 7210243,
        Image = 13109259,
        ImageUrl = 13174785,
        WebUrl = 13240321,
        Color = 19664897,
        FormatString = 19730433,
        Alignment = 20058113,
        LabelDisplayUnits = 20123649,
        FontSize = 20189443,
        LabelDensity = 20254979,
        Enumeration = 26214401,
        ScriptSource = 32776193,
    }
}
declare module powerbi.data {
    class ConceptualSchema {
        entities: jsCommon.ArrayNamedItems<ConceptualEntity>;
        capabilities: ConceptualCapabilities;
        /** Indicates whether the user can edit this ConceptualSchema.  This is used to enable/disable model authoring UX. */
        canEdit: boolean;
        findProperty(entityName: string, propertyName: string): ConceptualProperty;
        findHierarchy(entityName: string, name: string): ConceptualHierarchy;
        findHierarchyByVariation(variationEntityName: string, variationColumnName: string, variationName: string, hierarchyName: string): ConceptualHierarchy;
        /**
        * Returns the first property of the entity whose kpi is tied to kpiProperty
        */
        findPropertyWithKpi(entityName: string, kpiProperty: ConceptualProperty): ConceptualProperty;
    }
    interface ConceptualCapabilities {
        discourageQueryAggregateUsage: boolean;
        normalizedFiveStateKpiRange: boolean;
        supportsMedian: boolean;
        supportsPercentile: boolean;
    }
    interface ConceptualEntity {
        name: string;
        displayName: string;
        visibility?: ConceptualVisibility;
        calculated?: boolean;
        queryable?: ConceptualQueryableState;
        properties: jsCommon.ArrayNamedItems<ConceptualProperty>;
        hierarchies: jsCommon.ArrayNamedItems<ConceptualHierarchy>;
        navigationProperties: jsCommon.ArrayNamedItems<ConceptualNavigationProperty>;
    }
    interface ConceptualProperty {
        name: string;
        displayName: string;
        type: ValueType;
        kind: ConceptualPropertyKind;
        hidden?: boolean;
        format?: string;
        column?: ConceptualColumn;
        queryable?: ConceptualQueryableState;
        measure?: ConceptualMeasure;
        kpi?: ConceptualProperty;
    }
    interface ConceptualHierarchy {
        name: string;
        displayName: string;
        levels: jsCommon.ArrayNamedItems<ConceptualHierarchyLevel>;
        hidden?: boolean;
    }
    interface ConceptualHierarchyLevel {
        name: string;
        displayName: string;
        column: ConceptualProperty;
        hidden?: boolean;
    }
    interface ConceptualNavigationProperty {
        name: string;
        isActive: boolean;
        sourceColumn?: ConceptualColumn;
        targetEntity: ConceptualEntity;
        sourceMultiplicity: ConceptualMultiplicity;
        targetMultiplicity: ConceptualMultiplicity;
    }
    interface ConceptualVariationSource {
        name: string;
        isDefault: boolean;
        navigationProperty?: ConceptualNavigationProperty;
        defaultHierarchy?: ConceptualHierarchy;
        defaultProperty?: ConceptualProperty;
    }
    interface ConceptualColumn {
        defaultAggregate?: ConceptualDefaultAggregate;
        keys?: jsCommon.ArrayNamedItems<ConceptualProperty>;
        idOnEntityKey?: boolean;
        calculated?: boolean;
        defaultValue?: SQConstantExpr;
        variations?: jsCommon.ArrayNamedItems<ConceptualVariationSource>;
    }
    interface ConceptualMeasure {
        kpi?: ConceptualPropertyKpi;
    }
    interface ConceptualPropertyKpi {
        statusMetadata: DataViewKpiColumnMetadata;
        status?: ConceptualProperty;
        goal?: ConceptualProperty;
    }
    const enum ConceptualVisibility {
        Visible = 0,
        Hidden = 1,
        ShowAsVariationsOnly = 2,
        IsPrivate = 4,
    }
    const enum ConceptualQueryableState {
        Queryable = 0,
        Error = 1,
    }
    const enum ConceptualMultiplicity {
        ZeroOrOne = 0,
        One = 1,
        Many = 2,
    }
    const enum ConceptualPropertyKind {
        Column = 0,
        Measure = 1,
        Kpi = 2,
    }
    const enum ConceptualDefaultAggregate {
        Default = 0,
        None = 1,
        Sum = 2,
        Count = 3,
        Min = 4,
        Max = 5,
        Average = 6,
        DistinctCount = 7,
    }
    enum ConceptualDataCategory {
        None = 0,
        Address = 1,
        City = 2,
        Company = 3,
        Continent = 4,
        Country = 5,
        County = 6,
        Date = 7,
        Image = 8,
        ImageUrl = 9,
        Latitude = 10,
        Longitude = 11,
        Organization = 12,
        Place = 13,
        PostalCode = 14,
        Product = 15,
        StateOrProvince = 16,
        WebUrl = 17,
    }
}
declare module powerbi.data {
    /**
     * Represents the versions of the data shape binding structure.
     * NOTE Keep this file in sync with the Sql\InfoNav\src\Data\Contracts\DsqGeneration\DataShapeBindingVersions.cs
     * file in the TFS Dev branch.
     */
    const enum DataShapeBindingVersions {
        /** The initial version of data shape binding */
        Version0 = 0,
        /** Explicit subtotal support for axis groupings. */
        Version1 = 1,
    }
    interface DataShapeBindingLimitTarget {
        Primary?: number;
    }
    enum DataShapeBindingLimitType {
        Top = 0,
        First = 1,
        Last = 2,
        Sample = 3,
        Bottom = 4,
    }
    interface DataShapeBindingLimit {
        Count?: number;
        Target: DataShapeBindingLimitTarget;
        Type: DataShapeBindingLimitType;
    }
    interface DataShapeBinding {
        Version?: number;
        Primary: DataShapeBindingAxis;
        Secondary?: DataShapeBindingAxis;
        Limits?: DataShapeBindingLimit[];
        Highlights?: FilterDefinition[];
        DataReduction?: DataShapeBindingDataReduction;
        IncludeEmptyGroups?: boolean;
    }
    interface DataShapeBindingDataReduction {
        Primary?: DataShapeBindingDataReductionAlgorithm;
        Secondary?: DataShapeBindingDataReductionAlgorithm;
        DataVolume?: number;
    }
    interface DataShapeBindingDataReductionAlgorithm {
        Top?: DataShapeBindingDataReductionTopLimit;
        Sample?: DataShapeBindingDataReductionSampleLimit;
        Bottom?: DataShapeBindingDataReductionBottomLimit;
        Window?: DataShapeBindingDataReductionDataWindow;
    }
    interface DataShapeBindingDataReductionTopLimit {
        Count?: number;
    }
    interface DataShapeBindingDataReductionSampleLimit {
        Count?: number;
    }
    interface DataShapeBindingDataReductionBottomLimit {
        Count?: number;
    }
    interface DataShapeBindingDataReductionDataWindow {
        Count?: number;
        RestartTokens?: RestartToken;
    }
    interface DataShapeBindingAxis {
        Groupings: DataShapeBindingAxisGrouping[];
    }
    enum SubtotalType {
        None = 0,
        Before = 1,
        After = 2,
    }
    interface DataShapeBindingAxisGrouping {
        Projections: number[];
        SuppressedProjections?: number[];
        Subtotal?: SubtotalType;
        ShowItemsWithNoData?: number[];
    }
}
declare module powerbi.data {
    interface FederatedConceptualSchemaInitOptions {
        schemas: {
            [name: string]: ConceptualSchema;
        };
        links?: ConceptualSchemaLink[];
    }
    /** Represents a federated conceptual schema. */
    class FederatedConceptualSchema {
        private schemas;
        private links;
        constructor(options: FederatedConceptualSchemaInitOptions);
        schema(name: string): ConceptualSchema;
    }
    /** Describes a semantic relationship between ConceptualSchemas. */
    interface ConceptualSchemaLink {
    }
}
declare module powerbi.data {
    /** Defines a selector for content, including data-, metadata, and user-defined repetition. */
    interface Selector {
        /** Data-bound repetition selection. */
        data?: DataRepetitionSelector[];
        /** Metadata-bound repetition selection.  Refers to a DataViewMetadataColumn queryName. */
        metadata?: string;
        /** User-defined repetition selection. */
        id?: string;
    }
    type DataRepetitionSelector = DataViewScopeIdentity | DataViewScopeWildcard;
    module Selector {
        function filterFromSelector(selectors: Selector[], isNot?: boolean): SemanticFilter;
        function matchesData(selector: Selector, identities: DataViewScopeIdentity[]): boolean;
        function matchesKeys(selector: Selector, keysList: SQExpr[][]): boolean;
        /** Determines whether two selectors are equal. */
        function equals(x: Selector, y: Selector): boolean;
        function getKey(selector: Selector): string;
        function containsWildcard(selector: Selector): boolean;
    }
}
declare module powerbi.data {
    interface QueryDefinition {
        Version?: number;
        From: EntitySource[];
        Where?: QueryFilter[];
        OrderBy?: QuerySortClause[];
        Select: QueryExpressionContainer[];
    }
    interface FilterDefinition {
        Version?: number;
        From: EntitySource[];
        Where: QueryFilter[];
    }
    enum EntitySourceType {
        Table = 0,
        Pod = 1,
    }
    interface EntitySource {
        Name: string;
        EntitySet?: string;
        Entity?: string;
        Schema?: string;
        Type?: EntitySourceType;
    }
    interface QueryFilter {
        Target?: QueryExpressionContainer[];
        Condition: QueryExpressionContainer;
    }
    interface QuerySortClause {
        Expression: QueryExpressionContainer;
        Direction: SortDirection;
    }
    interface QueryExpressionContainer {
        Name?: string;
        SourceRef?: QuerySourceRefExpression;
        Column?: QueryColumnExpression;
        Measure?: QueryMeasureExpression;
        Aggregation?: QueryAggregationExpression;
        Hierarchy?: QueryHierarchyExpression;
        HierarchyLevel?: QueryHierarchyLevelExpression;
        PropertyVariationSource?: QueryPropertyVariationSourceExpression;
        And?: QueryBinaryExpression;
        Between?: QueryBetweenExpression;
        In?: QueryInExpression;
        Or?: QueryBinaryExpression;
        Comparison?: QueryComparisonExpression;
        Not?: QueryNotExpression;
        Contains?: QueryContainsExpression;
        StartsWith?: QueryStartsWithExpression;
        Exists?: QueryExistsExpression;
        Boolean?: QueryBooleanExpression;
        DateTime?: QueryDateTimeExpression;
        DateTimeSecond?: QueryDateTimeSecondExpression;
        Date?: QueryDateTimeExpression;
        Decimal?: QueryDecimalExpression;
        Integer?: QueryIntegerExpression;
        Null?: QueryNullExpression;
        Number?: QueryNumberExpression;
        String?: QueryStringExpression;
        Literal?: QueryLiteralExpression;
        DateSpan?: QueryDateSpanExpression;
        DateAdd?: QueryDateAddExpression;
        Now?: QueryNowExpression;
        DefaultValue?: QueryDefaultValueExpression;
        AnyValue?: QueryAnyValueExpression;
    }
    interface QueryPropertyExpression {
        Expression: QueryExpressionContainer;
        Property: string;
    }
    interface QueryColumnExpression extends QueryPropertyExpression {
    }
    interface QueryMeasureExpression extends QueryPropertyExpression {
    }
    interface QuerySourceRefExpression {
        Source: string;
    }
    interface QueryAggregationExpression {
        Function: QueryAggregateFunction;
        Expression: QueryExpressionContainer;
    }
    interface QueryHierarchyExpression {
        Expression: QueryExpressionContainer;
        Hierarchy: string;
    }
    interface QueryHierarchyLevelExpression {
        Expression: QueryExpressionContainer;
        Level: string;
    }
    interface QueryPropertyVariationSourceExpression {
        Expression: QueryExpressionContainer;
        Name: string;
        Property: string;
    }
    interface QueryBinaryExpression {
        Left: QueryExpressionContainer;
        Right: QueryExpressionContainer;
    }
    interface QueryBetweenExpression {
        Expression: QueryExpressionContainer;
        LowerBound: QueryExpressionContainer;
        UpperBound: QueryExpressionContainer;
    }
    interface QueryInExpression {
        Expressions: QueryExpressionContainer[];
        Values: QueryExpressionContainer[][];
    }
    interface QueryComparisonExpression extends QueryBinaryExpression {
        ComparisonKind: QueryComparisonKind;
    }
    interface QueryContainsExpression extends QueryBinaryExpression {
    }
    interface QueryNotExpression {
        Expression: QueryExpressionContainer;
    }
    interface QueryStartsWithExpression extends QueryBinaryExpression {
    }
    interface QueryExistsExpression {
        Expression: QueryExpressionContainer;
    }
    interface QueryConstantExpression<T> {
        Value: T;
    }
    interface QueryLiteralExpression {
        Value: string;
    }
    interface QueryBooleanExpression extends QueryConstantExpression<boolean> {
    }
    interface QueryDateTimeExpression extends QueryConstantExpression<string> {
    }
    interface QueryDateTimeSecondExpression extends QueryConstantExpression<string> {
    }
    interface QueryDecimalExpression extends QueryConstantExpression<number> {
    }
    interface QueryIntegerExpression extends QueryConstantExpression<number> {
    }
    interface QueryNumberExpression extends QueryConstantExpression<string> {
    }
    interface QueryNullExpression {
    }
    interface QueryStringExpression extends QueryConstantExpression<string> {
    }
    interface QueryDateSpanExpression {
        TimeUnit: TimeUnit;
        Expression: QueryExpressionContainer;
    }
    interface QueryDateAddExpression {
        Amount: number;
        TimeUnit: TimeUnit;
        Expression: QueryExpressionContainer;
    }
    interface QueryNowExpression {
    }
    interface QueryDefaultValueExpression {
    }
    interface QueryAnyValueExpression {
    }
    enum TimeUnit {
        Day = 0,
        Week = 1,
        Month = 2,
        Year = 3,
        Decade = 4,
        Second = 5,
        Minute = 6,
        Hour = 7,
    }
    enum QueryAggregateFunction {
        Sum = 0,
        Avg = 1,
        Count = 2,
        Min = 3,
        Max = 4,
        CountNonNull = 5,
        Median = 6,
        StandardDeviation = 7,
        Variance = 8,
    }
    enum QueryComparisonKind {
        Equal = 0,
        GreaterThan = 1,
        GreaterThanOrEqual = 2,
        LessThan = 3,
        LessThanOrEqual = 4,
    }
    interface DataQuery {
        Commands: QueryCommand[];
    }
    interface SemanticQueryDataShapeCommand {
        Query: QueryDefinition;
        Binding: DataShapeBinding;
    }
    interface QueryCommand {
        SemanticQueryDataShapeCommand?: SemanticQueryDataShapeCommand;
        ScriptVisualCommand?: ScriptVisualCommand;
    }
    interface ScriptInputColumn {
        /** The queryName of the corresponding Select from the associated SemanticQuery providing the data for this column. */
        QueryName: string;
        /** The name of this column expected by the script. */
        Name: string;
    }
    interface ScriptInput {
        VariableName?: string;
        Columns?: ScriptInputColumn[];
    }
    interface ScriptVisualCommand {
        Script?: string;
        RenderingEngine?: string;
        ViewportWidthPx?: number;
        ViewportHeightPx?: number;
        Version?: number;
        ScriptInput?: ScriptInput;
    }
    /** Defines semantic data types. */
    enum SemanticType {
        None = 0,
        Number = 1,
        Integer = 3,
        DateTime = 4,
        Time = 8,
        Date = 20,
        Month = 35,
        Year = 67,
        YearAndMonth = 128,
        MonthAndDay = 256,
        Decade = 515,
        YearAndWeek = 1024,
        String = 2048,
        Boolean = 4096,
        Table = 8192,
        Range = 16384,
    }
    enum SelectKind {
        None = 0,
        Group = 1,
        Measure = 2,
    }
    interface AuxiliarySelectBinding {
        Value?: string;
    }
    interface QueryMetadata {
        Select?: SelectMetadata[];
        Filters?: FilterMetadata[];
    }
    interface SelectMetadata {
        Restatement: string;
        Type?: number;
        Format?: string;
        DataCategory?: ConceptualDataCategory;
        /** The select projection name. */
        Name?: string;
        kpiStatusGraphic?: string;
        kpi?: DataViewKpiColumnMetadata;
    }
    interface FilterMetadata {
        Restatement: string;
        Kind?: FilterKind;
    }
    enum FilterKind {
        Default = 0,
        Period = 1,
    }
}
declare module powerbi.data {
    /** Represents a projection from a query result. */
    interface QueryProjection {
        /** Name of item in the semantic query Select clause. */
        queryRef: string;
        /** Optional format string. */
        format?: string;
    }
    /** A set of QueryProjections, grouped by visualization property, and ordered within that property. */
    interface QueryProjectionsByRole {
        [roleName: string]: QueryProjectionCollection;
    }
    class QueryProjectionCollection {
        private items;
        private _activeProjectionRef;
        private _showAll;
        constructor(items: QueryProjection[], activeProjectionRef?: string, showAll?: boolean);
        /** Returns all projections in a mutable array. */
        all(): QueryProjection[];
        activeProjectionQueryRef: string;
        showAll: boolean;
        clone(): QueryProjectionCollection;
    }
    module QueryProjectionsByRole {
        /** Clones the QueryProjectionsByRole. */
        function clone(roles: QueryProjectionsByRole): QueryProjectionsByRole;
        /** Returns the QueryProjectionCollection for that role.  Even returns empty collections so that 'drillable' and 'activeProjection' fields are preserved. */
        function getRole(roles: QueryProjectionsByRole, name: string): QueryProjectionCollection;
    }
}
declare module powerbi {
    interface IViewport {
        height: number;
        width: number;
    }
    interface VisualElement {
        DataRoles?: DataRole[];
        Settings?: VisualElementSettings;
    }
    /** Defines common settings for a visual element. */
    interface VisualElementSettings {
        DisplayUnitSystemType?: DisplayUnitSystemType;
    }
    interface DataRole {
        Name: string;
        Projection: number;
        isActive?: boolean;
    }
    /** The system used to determine display units used during formatting */
    enum DisplayUnitSystemType {
        /** Default display unit system, which saves space by using units such as K, M, bn with PowerView rules for when to pick a unit. Suitable for chart axes. */
        Default = 0,
        /** A verbose display unit system that will only respect the formatting defined in the model. Suitable for explore mode single-value cards. */
        Verbose = 1,
        /**
         * A display unit system that uses units such as K, M, bn if we have at least one of those units (e.g. 0.9M is not valid as it's less than 1 million).
         * Suitable for dashboard tile cards
         */
        WholeUnits = 2,
        /**A display unit system that also contains Auto and None units for data labels*/
        DataLabels = 3,
    }
}
declare module powerbi.data.contracts {
    interface DataViewSource {
        data: any;
        type?: string;
    }
}
declare module powerbi {
    interface IColorAllocator {
        /** Computes the color corresponding to the provided value. */
        color(value: number): string;
    }
    interface IColorAllocatorFactory {
        /** Creates a gradient that that transitions between two colors. */
        linearGradient2(options: LinearGradient2): IColorAllocator;
        /** Creates a gradient that that transitions between three colors. */
        linearGradient3(options: LinearGradient3, splitScales: boolean): IColorAllocator;
    }
}
declare module powerbi.data {
    interface CompiledDataViewMapping {
        metadata: CompiledDataViewMappingMetadata;
        categorical?: CompiledDataViewCategoricalMapping;
        table?: CompiledDataViewTableMapping;
        single?: CompiledDataViewSingleMapping;
        tree?: CompiledDataViewTreeMapping;
        matrix?: CompiledDataViewMatrixMapping;
        scriptResult?: CompiledDataViewScriptResultMapping;
    }
    interface CompiledDataViewMappingScriptDefinition {
        source: DataViewObjectPropertyIdentifier;
        provider: DataViewObjectPropertyIdentifier;
        imageFormat: string;
        scriptInput?: ScriptInput;
    }
    interface CompiledDataViewScriptResultMapping {
        dataInput: CompiledDataViewMapping;
        script: CompiledDataViewMappingScriptDefinition;
    }
    interface CompiledDataViewMappingMetadata {
        /** The metadata repetition objects. */
        objects?: DataViewObjects;
    }
    interface CompiledDataViewCategoricalMapping extends HasDataVolume, HasReductionAlgorithm {
        categories?: CompiledDataViewRoleMappingWithReduction | CompiledDataViewListRoleMappingWithReduction;
        values?: CompiledDataViewRoleMapping | CompiledDataViewGroupedRoleMapping | CompiledDataViewListRoleMapping;
        includeEmptyGroups?: boolean;
    }
    interface CompiledDataViewGroupingRoleMapping {
        role: CompiledDataViewRole;
    }
    interface CompiledDataViewSingleMapping {
        role: CompiledDataViewRole;
    }
    interface CompiledDataViewTableMapping extends HasDataVolume {
        rows: CompiledDataViewRoleMappingWithReduction | CompiledDataViewListRoleMappingWithReduction;
    }
    interface CompiledDataViewTreeMapping extends HasDataVolume {
        nodes?: CompiledDataViewRoleForMappingWithReduction;
        values?: CompiledDataViewRoleForMapping;
    }
    interface CompiledDataViewMatrixMapping extends HasDataVolume {
        rows?: CompiledDataViewRoleForMappingWithReduction | CompiledDataViewListRoleMappingWithReduction;
        columns?: CompiledDataViewRoleForMappingWithReduction;
        values?: CompiledDataViewRoleForMapping | CompiledDataViewListRoleMapping;
    }
    type CompiledDataViewRoleMapping = CompiledDataViewRoleBindMapping | CompiledDataViewRoleForMapping;
    interface CompiledDataViewRoleBindMapping {
        bind: {
            to: CompiledDataViewRole;
        };
    }
    interface CompiledDataViewRoleForMapping {
        for: {
            in: CompiledDataViewRole;
        };
    }
    type CompiledDataViewRoleMappingWithReduction = CompiledDataViewRoleBindMappingWithReduction | CompiledDataViewRoleForMappingWithReduction;
    interface CompiledDataViewRoleBindMappingWithReduction extends CompiledDataViewRoleBindMapping, HasReductionAlgorithm {
    }
    interface CompiledDataViewRoleForMappingWithReduction extends CompiledDataViewRoleForMapping, HasReductionAlgorithm {
    }
    interface CompiledDataViewGroupedRoleMapping {
        group: CompiledDataViewGroupedRoleGroupItemMapping;
    }
    interface CompiledDataViewGroupedRoleGroupItemMapping extends HasReductionAlgorithm {
        by: CompiledDataViewRole;
        select: CompiledDataViewRoleMapping[];
    }
    interface CompiledDataViewListRoleMapping {
        select: CompiledDataViewRoleMapping[];
    }
    interface CompiledDataViewListRoleMappingWithReduction extends CompiledDataViewListRoleMapping, HasReductionAlgorithm {
    }
    const enum CompiledSubtotalType {
        None = 0,
        Before = 1,
        After = 2,
    }
    interface CompiledDataViewRole {
        role: string;
        items: CompiledDataViewRoleItem[];
        subtotalType?: CompiledSubtotalType;
        showAll?: boolean;
        activeItem?: string;
    }
    interface CompiledDataViewRoleItem {
        queryName: string;
        type?: ValueType;
    }
}
declare module powerbi.data {
    /** Defines the values for particular objects. */
    interface DataViewObjectDefinitions {
        [objectName: string]: DataViewObjectDefinition[];
    }
    interface DataViewObjectDefinition {
        selector?: Selector;
        properties: DataViewObjectPropertyDefinitions;
    }
    interface DataViewObjectPropertyDefinitions {
        [name: string]: DataViewObjectPropertyDefinition;
    }
    type DataViewObjectPropertyDefinition = SQExpr | StructuralObjectDefinition;
    module DataViewObjectDefinitions {
        /** Creates or reuses a DataViewObjectDefinition for matching the given objectName and selector within the defns. */
        function ensure(defns: DataViewObjectDefinitions, objectName: string, selector: Selector): DataViewObjectDefinition;
        function deleteProperty(defns: DataViewObjectDefinitions, objectName: string, selector: Selector, propertyName: string): void;
        function getValue(defns: DataViewObjectDefinitions, propertyId: DataViewObjectPropertyIdentifier, selector: Selector): DataViewObjectPropertyDefinition;
        function getPropertyContainer(defns: DataViewObjectDefinitions, propertyId: DataViewObjectPropertyIdentifier, selector: Selector): DataViewObjectPropertyDefinitions;
        function getObjectDefinition(defns: DataViewObjectDefinitions, objectName: string, selector: Selector): DataViewObjectDefinition;
        function propertiesAreEqual(a: DataViewObjectPropertyDefinition, b: DataViewObjectPropertyDefinition): boolean;
        function allPropertiesAreEqual(a: DataViewObjectPropertyDefinitions, b: DataViewObjectPropertyDefinitions): boolean;
        function encodePropertyValue(value: DataViewPropertyValue, valueTypeDescriptor: ValueTypeDescriptor): DataViewObjectPropertyDefinition;
    }
    module DataViewObjectDefinition {
        function deleteSingleProperty(defn: DataViewObjectDefinition, propertyName: string): void;
    }
}
declare module powerbi.data {
    interface DataViewObjectDescriptors {
        /** Defines general properties for a visualization. */
        general?: DataViewObjectDescriptor;
        [objectName: string]: DataViewObjectDescriptor;
    }
    /** Defines a logical object in a visualization. */
    interface DataViewObjectDescriptor {
        displayName?: DisplayNameGetter;
        description?: DisplayNameGetter;
        properties: DataViewObjectPropertyDescriptors;
    }
    interface DataViewObjectPropertyDescriptors {
        [propertyName: string]: DataViewObjectPropertyDescriptor;
    }
    /** Defines a property of a DataViewObjectDefinition. */
    interface DataViewObjectPropertyDescriptor {
        displayName?: DisplayNameGetter;
        description?: DisplayNameGetter;
        placeHolderText?: DisplayNameGetter;
        type: DataViewObjectPropertyTypeDescriptor;
        rule?: DataViewObjectPropertyRuleDescriptor;
        /** Indicates whether the Format Painter should ignore this property. */
        suppressFormatPainterCopy?: boolean;
    }
    type DataViewObjectPropertyTypeDescriptor = ValueTypeDescriptor | StructuralTypeDescriptor;
    interface DataViewObjectPropertyRuleDescriptor {
        /** For rule typed properties, defines the input visual role name. */
        inputRole?: string;
        /** Defines the output for rule-typed properties. */
        output?: DataViewObjectPropertyRuleOutputDescriptor;
    }
    interface DataViewObjectPropertyRuleOutputDescriptor {
        /** Name of the target property for rule output. */
        property: string;
        /** Names roles that define the selector for the output properties. */
        selector: string[];
    }
    module DataViewObjectDescriptors {
        /** Attempts to find the format string property.  This can be useful for upgrade and conversion. */
        function findFormatString(descriptors: DataViewObjectDescriptors): DataViewObjectPropertyIdentifier;
        /** Attempts to find the filter property.  This can be useful for propagating filters from one visual to others. */
        function findFilterOutput(descriptors: DataViewObjectDescriptors): DataViewObjectPropertyIdentifier;
        /** Attempts to find the default value property.  This can be useful for propagating schema default value. */
        function findDefaultValue(descriptors: DataViewObjectDescriptors): DataViewObjectPropertyIdentifier;
    }
}
declare module powerbi.data {
    interface DataViewObjectDefinitionsByRepetition {
        metadataOnce?: DataViewObjectDefinitionsForSelector;
        userDefined?: DataViewObjectDefinitionsForSelector[];
        metadata?: DataViewObjectDefinitionsForSelector[];
        data: DataViewObjectDefinitionsForSelectorWithRule[];
    }
    interface DataViewObjectDefinitionsForSelector {
        selector?: Selector;
        objects: DataViewNamedObjectDefinition[];
    }
    interface DataViewObjectDefinitionsForSelectorWithRule extends DataViewObjectDefinitionsForSelector {
        rules?: RuleEvaluation[];
    }
    interface DataViewNamedObjectDefinition {
        name: string;
        properties: DataViewObjectPropertyDefinitions;
    }
    module DataViewObjectEvaluationUtils {
        function evaluateDataViewObjects(evalContext: IEvalContext, objectDescriptors: DataViewObjectDescriptors, objectDefns: DataViewNamedObjectDefinition[]): DataViewObjects;
        function groupObjectsBySelector(objectDefinitions: DataViewObjectDefinitions): DataViewObjectDefinitionsByRepetition;
        function addImplicitObjects(objectsForAllSelectors: DataViewObjectDefinitionsByRepetition, objectDescriptors: DataViewObjectDescriptors, columns: DataViewMetadataColumn[], selectTransforms: DataViewSelectTransform[]): void;
    }
}
declare module powerbi.data {
    /** Responsible for evaluating object property expressions to be applied at various scopes in a DataView. */
    module DataViewObjectEvaluator {
        function run(evalContext: IEvalContext, objectDescriptor: DataViewObjectDescriptor, propertyDefinitions: DataViewObjectPropertyDefinitions): DataViewObject;
        /** Note: Exported for testability */
        function evaluateProperty(evalContext: IEvalContext, propertyDescriptor: DataViewObjectPropertyDescriptor, propertyDefinition: DataViewObjectPropertyDefinition): any;
    }
}
declare module powerbi {
    /** Represents evaluated, named, custom objects in a DataView. */
    interface DataViewObjects {
        [name: string]: DataViewObject | DataViewObjectMap;
    }
    /** Represents an object (name-value pairs) in a DataView. */
    interface DataViewObject {
        [propertyName: string]: DataViewPropertyValue;
    }
    type DataViewPropertyValue = PrimitiveValue | StructuralObjectValue;
    type DataViewObjectMap = DataViewObjectWithId[];
    interface DataViewObjectWithId {
        id: string;
        object: DataViewObject;
    }
    interface DataViewObjectPropertyIdentifier {
        objectName: string;
        propertyName: string;
    }
    module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T;
        /** Gets an object from objects. */
        function getObject(objects: DataViewObjects, objectName: string, defaultValue?: DataViewObject): DataViewObject;
        /** Gets a map of user-defined objects. */
        function getUserDefinedObjects(objects: DataViewObjects, objectName: string): DataViewObjectMap;
        /** Gets the solid color from a fill property. */
        function getFillColor(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultColor?: string): string;
        /** Returns true if the given object represents a collection of user-defined objects */
        function isUserDefined(objectOrMap: DataViewObject | DataViewObjectMap): boolean;
    }
    module DataViewObject {
        function getValue<T>(object: DataViewObject, propertyName: string, defaultValue?: T): T;
        /** Gets the solid color from a fill property using only a propertyName */
        function getFillColorByPropertyName(objects: DataViewObjects, propertyName: string, defaultColor?: string): string;
    }
}
declare module powerbi.data {
    module DataViewPivotCategorical {
        /**
         * Pivots categories in a categorical DataView into valueGroupings.
         * This is akin to a mathematical matrix transpose.
         */
        function apply(dataView: DataView): DataView;
    }
}
declare module powerbi.data {
    module DataViewPivotMatrix {
        /** Pivots row hierarchy members in a matrix DataView into column hierarchy. */
        function apply(dataViewMatrix: DataViewMatrix, context: MatrixTransformationContext): void;
        function cloneTree(node: DataViewMatrixNode): DataViewMatrixNode;
        function cloneTreeExecuteOnLeaf(node: DataViewMatrixNode, callback?: (node: DataViewMatrixNode) => void): DataViewMatrixNode;
    }
}
declare module powerbi.data {
    module DataViewSelfCrossJoin {
        /**
         * Returns a new DataView based on the original, with a single DataViewCategorical category that is "cross joined"
         * to itself as a value grouping.
         * This is the mathematical equivalent of taking an array and turning it into an identity matrix.
         */
        function apply(dataView: DataView): DataView;
    }
}
declare module powerbi.data {
    /** Represents a data reader. */
    interface IDataReader {
        /** Executes a query, with a promise of completion.  The response object should be compatible with the transform implementation. */
        execute?(options: DataReaderExecutionOptions): RejectablePromise2<DataReaderData, IClientError>;
        /** Transforms the given data into a DataView.  When this function is not specified, the data is put on a property on the DataView. */
        transform?(obj: DataReaderData): DataReaderTransformResult;
        /** Stops all future communication and reject and pending communication  */
        stopCommunication?(): void;
        /** Resumes communication which enables future requests */
        resumeCommunication?(): void;
        /** Clear cache */
        clearCache?(dataSource: DataReaderDataSource): void;
        /** rewriteCacheEntries */
        rewriteCacheEntries?(dataSource: DataReaderDataSource, rewriter: DataReaderCacheRewriter): void;
    }
    /** Represents a query generator. */
    interface IQueryGenerator {
        /** Query generation function to convert a (prototype) SemanticQuery to a runnable query command. */
        execute(options: QueryGeneratorOptions): QueryGeneratorResult;
    }
    /** Represents a custom data reader plugin, to be registered in the powerbi.data.plugins object. */
    interface IDataReaderPlugin {
        /** The name of this plugin. */
        name: string;
        /** Factory method for the IDataReader. */
        reader(hostServices: IDataReaderHostServices): IDataReader;
        /** Factory method for the IQueryGenerator. */
        queryGenerator?(): IQueryGenerator;
    }
    interface QueryGeneratorOptions {
        query: SemanticQuery;
        mappings: CompiledDataViewMapping[];
        additionalProjections?: AdditionalQueryProjection[];
        highlightFilter?: SemanticFilter;
        restartToken?: RestartToken;
    }
    interface AdditionalQueryProjection {
        queryName: string;
        selector: Selector;
    }
    interface QueryGeneratorResult {
        command: DataReaderQueryCommand;
        splits?: DataViewSplitTransform[];
    }
    interface DataReaderTransformResult {
        dataView?: DataView;
        restartToken?: RestartToken;
        error?: IClientError;
        warning?: IClientWarning;
    }
    interface RestartToken {
    }
    interface DataReaderQueryCommand {
    }
    /** Represents a query command defined by an IDataReader. */
    interface DataReaderCommand {
    }
    /** Represents a data source defined by an IDataReader. */
    interface DataReaderDataSource {
    }
    /** Represents arbitrary data defined by an IDataReader. */
    interface DataReaderData {
    }
    /** Represents cacheRewriter that will rewrite the cache of reader as defined by an IDataReader. */
    interface DataReaderCacheRewriter {
    }
    interface DataReaderExecutionOptions {
        dataSource?: DataReaderDataSource;
        command: DataReaderCommand;
        allowCache?: boolean;
        cacheResponseOnServer?: boolean;
    }
    interface IDataReaderHostServices {
        promiseFactory(): IPromiseFactory;
    }
}
declare module powerbi {
    /** Enumeration of DateTimeUnits */
    enum DateTimeUnit {
        Year = 0,
        Month = 1,
        Week = 2,
        Day = 3,
        Hour = 4,
        Minute = 5,
        Second = 6,
        Millisecond = 7,
    }
    interface IFormattingService {
        /**
         * Formats the value using provided format expression and culture
         * @param value - value to be formatted and converted to string.
         * @param format - format to be applied. If undefined or empty then generic format is used.
         */
        formatValue(value: any, format?: string): string;
        /**
         * Replaces the indexed format tokens (for example {0:c2}) in the format string with the localized formatted arguments.
         * @param formatWithIndexedTokens - format string with a set of indexed format tokens.
         * @param args - array of values which should replace the tokens in the format string.
         * @param culture - localization culture. If undefined then the current culture is used.
         */
        format(formatWithIndexedTokens: string, args: any[], culture?: string): string;
        /** Gets a value indicating whether the specified format a standard numeric format specifier. */
        isStandardNumberFormat(format: string): boolean;
        /** Performs a custom format with a value override.  Typically used for custom formats showing scaled values. */
        formatNumberWithCustomOverride(value: number, format: string, nonScientificOverrideFormat: string): string;
        /** Gets the format string to use for dates in particular units. */
        dateFormatString(unit: DateTimeUnit): string;
    }
}
declare module powerbi {
    /** Represents views of a data set. */
    interface DataView {
        metadata: DataViewMetadata;
        categorical?: DataViewCategorical;
        single?: DataViewSingle;
        tree?: DataViewTree;
        table?: DataViewTable;
        matrix?: DataViewMatrix;
        scriptResult?: DataViewScriptResultData;
    }
    interface DataViewMetadata {
        columns: DataViewMetadataColumn[];
        /** The metadata repetition objects. */
        objects?: DataViewObjects;
        /** When defined, describes whether the DataView contains just a segment of the complete data set. */
        segment?: DataViewSegmentMetadata;
    }
    interface DataViewMetadataColumn {
        /** The user-facing display name of the column. */
        displayName: string;
        /** The query name the source column in the query. */
        queryName?: string;
        /** The format string of the column. */
        format?: string;
        /** Data type information for the column. */
        type?: ValueType;
        /** Indicates that this column is a measure (aggregate) value. */
        isMeasure?: boolean;
        /** The position of the column in the select statement. */
        index?: number;
        /** The properties that this column provides to the visualization. */
        roles?: {
            [name: string]: boolean;
        };
        /** The metadata repetition objects. */
        objects?: DataViewObjects;
        /** The name of the containing group. */
        groupName?: string;
        /** The sort direction of this column. */
        sort?: SortDirection;
        /** The KPI metadata to use to convert a numeric status value into its visual representation. */
        kpi?: DataViewKpiColumnMetadata;
    }
    const enum SortDirection {
        Ascending = 1,
        Descending = 2,
    }
    interface DataViewSegmentMetadata {
    }
    interface DataViewCategorical {
        categories?: DataViewCategoryColumn[];
        values?: DataViewValueColumns;
    }
    interface DataViewCategoricalColumn {
        source: DataViewMetadataColumn;
        values: any[];
        /** The data repetition objects. */
        objects?: DataViewObjects[];
    }
    interface DataViewValueColumns extends Array<DataViewValueColumn> {
        /** Returns an array that groups the columns in this group together. */
        grouped(): DataViewValueColumnGroup[];
        /** The set of expressions that define the identity for instances of the value group.  This must match items in the DataViewScopeIdentity in the grouped items result. */
        identityFields?: data.SQExpr[];
        source?: DataViewMetadataColumn;
    }
    interface DataViewValueColumnGroup {
        values: DataViewValueColumn[];
        identity?: DataViewScopeIdentity;
        /** The data repetition objects. */
        objects?: DataViewObjects;
        name?: string;
    }
    interface DataViewValueColumn extends DataViewCategoricalColumn {
        subtotal?: any;
        max?: any;
        min?: any;
        highlights?: any[];
        identity?: DataViewScopeIdentity;
        /** Client-computed maximum value for a column. */
        maxLocal?: any;
        /** Client-computed maximum value for a column. */
        minLocal?: any;
    }
    interface DataViewCategoryColumn extends DataViewCategoricalColumn {
        identity?: DataViewScopeIdentity[];
        /** The set of expressions that define the identity for instances of the category.  This must match items in the DataViewScopeIdentity in the identity. */
        identityFields?: data.SQExpr[];
    }
    interface DataViewSingle {
        value: any;
    }
    interface DataViewTree {
        root: DataViewTreeNode;
    }
    interface DataViewTreeNode {
        name?: string;
        value?: any;
        values?: {
            [id: number]: DataViewTreeNodeValue;
        };
        children?: DataViewTreeNode[];
        identity?: DataViewScopeIdentity;
        /** The data repetition objects. */
        objects?: DataViewObjects;
        /** The set of expressions that define the identity for the child nodes.  This must match items in the DataViewScopeIdentity of those nodes. */
        childIdentityFields?: data.SQExpr[];
    }
    interface DataViewTreeNodeValue {
        value?: any;
    }
    interface DataViewTreeNodeMeasureValue extends DataViewTreeNodeValue {
        subtotal?: any;
        max?: any;
        min?: any;
        highlight?: any;
        /** Client-computed maximum value for a column. */
        maxLocal?: any;
        /** Client-computed maximum value for a column. */
        minLocal?: any;
    }
    interface DataViewTreeNodeGroupValue extends DataViewTreeNodeValue {
        count?: any;
    }
    interface DataViewTable {
        columns: DataViewMetadataColumn[];
        identity?: DataViewScopeIdentity[];
        rows?: any[][];
        totals?: any[];
    }
    interface DataViewTableRow {
        values: any[];
        /** The metadata repetition objects. */
        objects?: DataViewObjects[];
    }
    interface DataViewMatrix {
        rows: DataViewHierarchy;
        columns: DataViewHierarchy;
        valueSources: DataViewMetadataColumn[];
    }
    interface DataViewMatrixNode extends DataViewTreeNode {
        /** Indicates the level this node is on. Zero indicates the outermost children (root node level is undefined). */
        level?: number;
        /** Indicates the source metadata index on the node's level. Its value is 0 if omitted. */
        levelSourceIndex?: number;
        /** Indicates whether or not the node is a subtotal node. Its value is false if omitted. */
        isSubtotal?: boolean;
    }
    interface DataViewMatrixNodeValue extends DataViewTreeNodeValue {
        /** Indicates the index of the corresponding measure (held by DataViewMatrix.valueSources). Its value is 0 if omitted. */
        valueSourceIndex?: number;
    }
    interface DataViewHierarchy {
        root: DataViewMatrixNode;
        levels: DataViewHierarchyLevel[];
    }
    interface DataViewHierarchyLevel {
        sources: DataViewMetadataColumn[];
    }
    interface DataViewKpiColumnMetadata {
        graphic: string;
        normalizedFiveStateKpiRange?: boolean;
    }
    interface DataViewScriptResultData {
        imageBase64: string;
    }
}
declare module powerbi {
    module DataViewAnalysis {
        import QueryProjectionsByRole = powerbi.data.QueryProjectionsByRole;
        interface ValidateAndReshapeResult {
            dataView?: DataView;
            isValid: boolean;
        }
        interface RoleKindByQueryRef {
            [queryRef: string]: VisualDataRoleKind;
        }
        /** Reshapes the data view to match the provided schema if possible. If not, returns null */
        function validateAndReshape(dataView: DataView, dataViewMappings: DataViewMapping[]): ValidateAndReshapeResult;
        function countGroups(columns: DataViewMetadataColumn[]): number;
        function countMeasures(columns: DataViewMetadataColumn[]): number;
        /** Indicates whether the dataView conforms to the specified schema. */
        function supports(dataView: DataView, roleMapping: DataViewMapping, usePreferredDataViewSchema?: boolean): boolean;
        /** Determines whether the value conforms to the range in the role condition */
        function conformsToRange(value: number, roleCondition: RoleCondition, ignoreMin?: boolean): boolean;
        /** Determines the appropriate DataViewMappings for the projections. */
        function chooseDataViewMappings(projections: QueryProjectionsByRole, mappings: DataViewMapping[], roleKindByQueryRef: RoleKindByQueryRef): DataViewMapping[];
        function getPropertyCount(roleName: string, projections: QueryProjectionsByRole, useActiveIfAvailable?: boolean): number;
        function hasSameCategoryIdentity(dataView1: DataView, dataView2: DataView): boolean;
        function areMetadataColumnsEquivalent(column1: DataViewMetadataColumn, column2: DataViewMetadataColumn): boolean;
        function isMetadataEquivalent(metadata1: DataViewMetadata, metadata2: DataViewMetadata): boolean;
    }
}
declare module powerbi {
    interface DataViewMapping {
        /**
         * Defines set of conditions, at least one of which must be satisfied for this mapping to be used.
         * Any roles not specified in the condition accept any number of items.
         */
        conditions?: DataViewMappingCondition[];
        categorical?: DataViewCategoricalMapping;
        table?: DataViewTableMapping;
        single?: DataViewSingleMapping;
        tree?: DataViewTreeMapping;
        matrix?: DataViewMatrixMapping;
        scriptResult?: DataViewScriptResultMapping;
    }
    /** Describes whether a particular mapping is fits the set of projections. */
    interface DataViewMappingCondition {
        [dataRole: string]: RoleCondition;
    }
    /** Describes a mapping which supports a data volume level. */
    interface HasDataVolume {
        dataVolume?: number;
    }
    interface DataViewCategoricalMapping extends HasDataVolume, HasReductionAlgorithm {
        categories?: DataViewRoleMappingWithReduction | DataViewListRoleMappingWithReduction;
        values?: DataViewRoleMapping | DataViewGroupedRoleMapping | DataViewListRoleMapping;
        /** Specifies a constraint on the number of data rows supported by the visual. */
        rowCount?: AcceptabilityNumberRange;
        /** Indicates whether the data rows include empty groups  */
        includeEmptyGroups?: boolean;
    }
    interface DataViewSingleMapping {
        /** Indicates the role which is bound to this structure. */
        role: string;
    }
    interface DataViewTableMapping extends HasDataVolume {
        rows: DataViewRoleMappingWithReduction | DataViewListRoleMappingWithReduction;
        /** Specifies a constraint on the number of data rows supported by the visual. */
        rowCount?: AcceptabilityNumberRange;
    }
    interface DataViewTreeMapping extends HasDataVolume {
        nodes?: DataViewRoleForMappingWithReduction;
        values?: DataViewRoleForMapping;
        /** Specifies a constraint on the depth of the tree supported by the visual. */
        depth?: AcceptabilityNumberRange;
    }
    interface DataViewMatrixMapping extends HasDataVolume {
        rows?: DataViewRoleForMappingWithReduction | DataViewListRoleMappingWithReduction;
        columns?: DataViewRoleForMappingWithReduction;
        values?: DataViewRoleForMapping | DataViewListRoleMapping;
    }
    type DataViewRoleMapping = DataViewRoleBindMapping | DataViewRoleForMapping;
    interface DataViewRoleBindMapping {
        /**
         * Indicates evaluation of a single-valued data role.
         * Equivalent to for, without support for multiple items.
         */
        bind: {
            to: string;
        };
    }
    interface DataViewRoleForMapping {
        /** Indicates iteration of the in data role, as an array. */
        for: {
            in: string;
        };
    }
    type DataViewRoleMappingWithReduction = DataViewRoleBindMappingWithReduction | DataViewRoleForMappingWithReduction;
    interface DataViewRoleBindMappingWithReduction extends DataViewRoleBindMapping, HasReductionAlgorithm {
    }
    interface DataViewRoleForMappingWithReduction extends DataViewRoleForMapping, HasReductionAlgorithm {
    }
    interface DataViewGroupedRoleMapping {
        group: {
            by: string;
            select: DataViewRoleMapping[];
            dataReductionAlgorithm?: ReductionAlgorithm;
        };
    }
    interface DataViewListRoleMapping {
        select: DataViewRoleMapping[];
    }
    interface DataViewListRoleMappingWithReduction extends DataViewListRoleMapping, HasReductionAlgorithm {
    }
    interface HasReductionAlgorithm {
        dataReductionAlgorithm?: ReductionAlgorithm;
    }
    /** Describes how to reduce the amount of data exposed to the visual. */
    interface ReductionAlgorithm {
        top?: DataReductionTop;
        bottom?: DataReductionBottom;
        sample?: DataReductionSample;
        window?: DataReductionWindow;
    }
    /** Reduce the data to the Top(count) items. */
    interface DataReductionTop {
        count?: number;
    }
    /** Reduce the data to the Bottom count items. */
    interface DataReductionBottom {
        count?: number;
    }
    /** Reduce the data using a simple Sample of count items. */
    interface DataReductionSample {
        count?: number;
    }
    /** Allow the data to be loaded one window, containing count items, at a time. */
    interface DataReductionWindow {
        count?: number;
    }
    interface AcceptabilityNumberRange {
        /** Specifies a preferred range of values for the constraint. */
        preferred?: NumberRange;
        /** Specifies a supported range of values for the constraint. Defaults to preferred if not specified. */
        supported?: NumberRange;
    }
    /** Defines the acceptable values of a number. */
    interface NumberRange {
        min?: number;
        max?: number;
    }
    interface DataViewMappingScriptDefinition {
        source: DataViewObjectPropertyIdentifier;
        provider: DataViewObjectPropertyIdentifier;
        imageFormat: string;
    }
    interface DataViewScriptResultMapping {
        dataInput: DataViewMapping;
        script: DataViewMappingScriptDefinition;
    }
}
declare module powerbi {
    /** Encapsulates the identity of a data scope in a DataView. */
    interface DataViewScopeIdentity {
        /** Predicate expression that identifies the scope. */
        expr: data.SQExpr;
        /** Key string that identifies the DataViewScopeIdentity to a string, which can be used for equality comparison. */
        key: string;
    }
    module DataViewScopeIdentity {
        /** Compares the two DataViewScopeIdentity values for equality. */
        function equals(x: DataViewScopeIdentity, y: DataViewScopeIdentity, ignoreCase?: boolean): boolean;
        function filterFromIdentity(identities: DataViewScopeIdentity[], isNot?: boolean): data.SemanticFilter;
        function filterFromExprs(orExprs: data.SQExpr[], isNot?: boolean): data.SemanticFilter;
    }
    module data {
        function createDataViewScopeIdentity(expr: SQExpr): DataViewScopeIdentity;
    }
}
declare module powerbi.data {
    /** Defines a match against all instances of a given DataView scope. */
    interface DataViewScopeWildcard {
        exprs: SQExpr[];
        key: string;
    }
    module DataViewScopeWildcard {
        function matches(wildcard: DataViewScopeWildcard, instance: DataViewScopeIdentity): boolean;
        function fromExprs(exprs: SQExpr[]): DataViewScopeWildcard;
    }
}
declare module powerbi.data {
    import INumberDictionary = jsCommon.INumberDictionary;
    interface DataViewTransformApplyOptions {
        prototype: DataView;
        objectDescriptors: DataViewObjectDescriptors;
        dataViewMappings?: DataViewMapping[];
        transforms: DataViewTransformActions;
        colorAllocatorFactory: IColorAllocatorFactory;
        dataRoles: VisualDataRole[];
    }
    /** Describes the Transform actions to be done to a prototype DataView. */
    interface DataViewTransformActions {
        /** Describes transform metadata for each semantic query select item, as the arrays align, by index. */
        selects?: DataViewSelectTransform[];
        /** Describes the DataViewObject definitions. */
        objects?: DataViewObjectDefinitions;
        /** Describes the splitting of a single input DataView into multiple DataViews. */
        splits?: DataViewSplitTransform[];
        /** Describes the order of selects (referenced by query index) in each role. */
        projectionOrdering?: DataViewProjectionOrdering;
    }
    interface DataViewSelectTransform {
        displayName?: string;
        queryName?: string;
        format?: string;
        type?: ValueType;
        roles?: {
            [roleName: string]: boolean;
        };
        kpi?: DataViewKpiColumnMetadata;
        sort?: SortDirection;
        /** Describes the default value applied to a column, if any. */
        defaultValue?: DefaultValueDefinition;
    }
    interface DataViewSplitTransform {
        selects: INumberDictionary<boolean>;
    }
    interface DataViewProjectionOrdering {
        [roleName: string]: number[];
    }
    interface MatrixTransformationContext {
        rowHierarchyRewritten: boolean;
        columnHierarchyRewritten: boolean;
        hierarchyTreesRewritten: boolean;
    }
    module DataViewTransform {
        function apply(options: DataViewTransformApplyOptions): DataView[];
        /**
         *
         *
         * Note: Exported for testability
         */
        function upgradeSettingsToObjects(settings: VisualElementSettings, objectDefns?: DataViewObjectDefinitions): DataViewObjectDefinitions;
        function createTransformActions(queryMetadata: QueryMetadata, visualElements: VisualElement[], objectDescs: DataViewObjectDescriptors, objectDefns: DataViewObjectDefinitions): DataViewTransformActions;
        function createValueColumns(values?: DataViewValueColumn[], valueIdentityFields?: SQExpr[], source?: DataViewMetadataColumn): DataViewValueColumns;
    }
}
declare module powerbi.data {
    /** Responsible for providing specific values to be used by expression and rule evaluation. */
    interface IEvalContext {
        getRoleValue(roleName: string): PrimitiveValue;
        getCurrentIdentity(): DataViewScopeIdentity;
    }
}
declare module powerbi.data {
    interface ICategoricalEvalContext extends IEvalContext {
        setCurrentRowIndex(index: number): void;
    }
    function createCategoricalEvalContext(dataViewCategorical: DataViewCategorical, identities?: DataViewScopeIdentity[]): ICategoricalEvalContext;
}
declare module powerbi.data {
    class RuleEvaluation {
        evaluate(evalContext: IEvalContext): any;
    }
}
declare module powerbi.data {
    class ColorRuleEvaluation extends RuleEvaluation {
        private inputRole;
        private allocator;
        constructor(inputRole: string, allocator: IColorAllocator);
        evaluate(evalContext: IEvalContext): any;
    }
}
declare module powerbi.data {
    class FilterRuleEvaluation extends RuleEvaluation {
        private selection;
        constructor(scopeIds: FilterValueScopeIdsContainer);
        evaluate(evalContext: IEvalContext): any;
    }
}
declare module powerbi.data.segmentation {
    interface DataViewTableSegment extends DataViewTable {
        /**
         * Index of the last item that had a merge flag in the underlying data.
         * We assume merge flags are not random but adjacent to each other.
         */
        lastMergeIndex?: number;
    }
    interface DataViewTreeSegmentNode extends DataViewTreeNode {
        /** Indicates whether the node is a duplicate of a node from a previous segment. */
        isMerge?: boolean;
    }
    interface DataViewCategoricalSegment extends DataViewCategorical {
        /**
         * Index of the last item that had a merge flag in the underlying data.
         * We assume merge flags are not random but adjacent to each other.
         */
        lastMergeIndex?: number;
    }
    interface DataViewMatrixSegmentNode extends DataViewMatrixNode {
        /**
         * Index of the last item that had a merge flag in the underlying data.
         * We assume merge flags are not random but adjacent to each other.
         */
        isMerge?: boolean;
    }
    module DataViewMerger {
        function mergeDataViews(source: DataView, segment: DataView): void;
        /** Note: Public for testability */
        function mergeTables(source: DataViewTable, segment: DataViewTableSegment): void;
        /**
         * Merge categories values and identities
         *
         * Note: Public for testability
         */
        function mergeCategorical(source: DataViewCategorical, segment: DataViewCategoricalSegment): void;
        /** Note: Public for testability */
        function mergeTreeNodes(sourceRoot: DataViewTreeNode, segmentRoot: DataViewTreeNode, allowDifferentStructure: boolean): void;
    }
}
declare module powerbi.data {
    /** Rewrites an expression tree, including all descendant nodes. */
    class SQExprRewriter implements ISQExprVisitor<SQExpr> {
        visitColumnRef(expr: SQColumnRefExpr): SQExpr;
        visitMeasureRef(expr: SQMeasureRefExpr): SQExpr;
        visitAggr(expr: SQAggregationExpr): SQExpr;
        visitHierarchy(expr: SQHierarchyExpr): SQExpr;
        visitHierarchyLevel(expr: SQHierarchyLevelExpr): SQExpr;
        visitPropertyVariationSource(expr: SQPropertyVariationSourceExpr): SQExpr;
        visitEntity(expr: SQEntityExpr): SQExpr;
        visitAnd(orig: SQAndExpr): SQExpr;
        visitBetween(orig: SQBetweenExpr): SQExpr;
        visitIn(orig: SQInExpr): SQExpr;
        private rewriteAll(origExprs);
        visitOr(orig: SQOrExpr): SQExpr;
        visitCompare(orig: SQCompareExpr): SQExpr;
        visitContains(orig: SQContainsExpr): SQExpr;
        visitExists(orig: SQExistsExpr): SQExpr;
        visitNot(orig: SQNotExpr): SQExpr;
        visitStartsWith(orig: SQStartsWithExpr): SQExpr;
        visitConstant(expr: SQConstantExpr): SQExpr;
        visitDateSpan(orig: SQDateSpanExpr): SQExpr;
        visitDateAdd(orig: SQDateAddExpr): SQExpr;
        visitNow(orig: SQNowExpr): SQExpr;
        visitDefaultValue(orig: SQDefaultValueExpr): SQExpr;
        visitAnyValue(orig: SQAnyValueExpr): SQExpr;
    }
}
declare module powerbi.data {
    /** Responsible for writing equality comparisons against a field to an SQInExpr. */
    module EqualsToInRewriter {
        function run(expr: SQExpr): SQExpr;
    }
}
declare module powerbi.data {
    interface FilterValueScopeIdsContainer {
        isNot: boolean;
        scopeIds: DataViewScopeIdentity[];
    }
    module SQExprConverter {
        function asScopeIdsContainer(filter: SemanticFilter, fieldSQExprs: SQExpr[]): FilterValueScopeIdsContainer;
        /** Gets a comparand value from the given DataViewScopeIdentity. */
        function getFirstComparandValue(identity: DataViewScopeIdentity): any;
    }
}
declare module powerbi.data {
    /** Recognizes DataViewScopeIdentity expression trees to extract comparison keys. */
    module ScopeIdentityExtractor {
        function getKeys(expr: SQExpr): SQExpr[];
        function getInExpr(expr: SQExpr): SQInExpr;
    }
}
declare module powerbi.data {
    module PrimitiveValueEncoding {
        function decimal(value: number): string;
        function double(value: number): string;
        function integer(value: number): string;
        function dateTime(value: Date): string;
        function text(value: string): string;
        function nullEncoding(): string;
        function boolean(value: boolean): string;
    }
}
declare module powerbi.data {
    interface SQExprGroup {
        expr: SQExpr;
        children: SQHierarchyLevelExpr[];
        /** Index of expression in the query. */
        selectQueryIndex: number;
    }
    module SQExprGroupUtils {
        /** Group all projections. Eacch group can consist of either a single property, or a collection of hierarchy items. */
        function groupExprs(exprs: SQExpr[], columnVariationEnabled: boolean): SQExprGroup[];
    }
}
declare module powerbi.data {
    /** Represents an immutable expression within a SemanticQuery. */
    class SQExpr {
        constructor();
        static equals(x: SQExpr, y: SQExpr, ignoreCase?: boolean): boolean;
        validate(schema: FederatedConceptualSchema, errors?: SQExprValidationError[]): SQExprValidationError[];
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
        getMetadata(federatedSchema: FederatedConceptualSchema): SQExprMetadata;
        getDefaultAggregate(federatedSchema: FederatedConceptualSchema, forceAggregation?: boolean): QueryAggregateFunction;
        /** Return the SQExpr[] of group on columns if it has group on keys otherwise return the SQExpr of the column.*/
        getKeyColumns(schema: FederatedConceptualSchema): SQExpr[];
        /** Returns a value indicating whether the expression would group on keys other than itself.*/
        hasGroupOnKeys(schema: FederatedConceptualSchema): boolean;
        private getPropertyKeys(schema);
        getConceptualProperty(federatedSchema: FederatedConceptualSchema): ConceptualProperty;
        getTargetEntityForVariation(federatedSchema: FederatedConceptualSchema, variationName: string): string;
        private getHierarchyLevelConceptualProperty(federatedSchema);
        private getMetadataForVariation(field, federatedSchema);
        private getMetadataForHierarchyLevel(field, federatedSchema);
        private getPropertyMetadata(field, property);
        private getMetadataForProperty(field, federatedSchema);
        private static getMetadataForEntity(field, federatedSchema);
    }
    interface SQExprMetadata {
        kind: FieldKind;
        type: ValueType;
        format?: string;
        idOnEntityKey?: boolean;
        aggregate?: QueryAggregateFunction;
        defaultAggregate?: ConceptualDefaultAggregate;
    }
    const enum FieldKind {
        /** Indicates the field references a column, which evaluates to a distinct set of values (e.g., Year, Name, SalesQuantity, etc.). */
        Column = 0,
        /** Indicates the field references a measure, which evaluates to a single value (e.g., SalesYTD, Sum(Sales), etc.). */
        Measure = 1,
    }
    /** Note: Exported for testability */
    function defaultAggregateForDataType(type: ValueType): QueryAggregateFunction;
    /** Note: Exported for testability */
    function defaultAggregateToQueryAggregateFunction(aggregate: ConceptualDefaultAggregate): QueryAggregateFunction;
    class SQEntityExpr extends SQExpr {
        schema: string;
        entity: string;
        variable: string;
        constructor(schema: string, entity: string, variable?: string);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQPropRefExpr extends SQExpr {
        ref: string;
        source: SQExpr;
        constructor(source: SQExpr, ref: string);
    }
    class SQColumnRefExpr extends SQPropRefExpr {
        constructor(source: SQExpr, ref: string);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQMeasureRefExpr extends SQPropRefExpr {
        constructor(source: SQExpr, ref: string);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQAggregationExpr extends SQExpr {
        arg: SQExpr;
        func: QueryAggregateFunction;
        constructor(arg: SQExpr, func: QueryAggregateFunction);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQPropertyVariationSourceExpr extends SQExpr {
        arg: SQExpr;
        name: string;
        property: string;
        constructor(arg: SQExpr, name: string, property: string);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQHierarchyExpr extends SQExpr {
        arg: SQExpr;
        hierarchy: string;
        constructor(arg: SQExpr, hierarchy: string);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQHierarchyLevelExpr extends SQExpr {
        arg: SQExpr;
        level: string;
        constructor(arg: SQExpr, level: string);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQAndExpr extends SQExpr {
        left: SQExpr;
        right: SQExpr;
        constructor(left: SQExpr, right: SQExpr);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQBetweenExpr extends SQExpr {
        arg: SQExpr;
        lower: SQExpr;
        upper: SQExpr;
        constructor(arg: SQExpr, lower: SQExpr, upper: SQExpr);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQInExpr extends SQExpr {
        args: SQExpr[];
        values: SQExpr[][];
        constructor(args: SQExpr[], values: SQExpr[][]);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQOrExpr extends SQExpr {
        left: SQExpr;
        right: SQExpr;
        constructor(left: SQExpr, right: SQExpr);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQCompareExpr extends SQExpr {
        kind: QueryComparisonKind;
        left: SQExpr;
        right: SQExpr;
        constructor(kind: QueryComparisonKind, left: SQExpr, right: SQExpr);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQContainsExpr extends SQExpr {
        left: SQExpr;
        right: SQExpr;
        constructor(left: SQExpr, right: SQExpr);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQStartsWithExpr extends SQExpr {
        left: SQExpr;
        right: SQExpr;
        constructor(left: SQExpr, right: SQExpr);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQExistsExpr extends SQExpr {
        arg: SQExpr;
        constructor(arg: SQExpr);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQNotExpr extends SQExpr {
        arg: SQExpr;
        constructor(arg: SQExpr);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQConstantExpr extends SQExpr {
        type: ValueType;
        /** The native JavaScript representation of the value. */
        value: any;
        /** The string encoded, lossless representation of the value. */
        valueEncoded: string;
        constructor(type: ValueType, value: any, valueEncoded: string);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
        getMetadata(federatedSchema: FederatedConceptualSchema): SQExprMetadata;
    }
    class SQDateSpanExpr extends SQExpr {
        unit: TimeUnit;
        arg: SQExpr;
        constructor(unit: TimeUnit, arg: SQExpr);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQDateAddExpr extends SQExpr {
        unit: TimeUnit;
        amount: number;
        arg: SQExpr;
        constructor(unit: TimeUnit, amount: number, arg: SQExpr);
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQNowExpr extends SQExpr {
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQDefaultValueExpr extends SQExpr {
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    class SQAnyValueExpr extends SQExpr {
        accept<T, TArg>(visitor: ISQExprVisitorWithArg<T, TArg>, arg?: TArg): T;
    }
    /** Provides utilities for creating & manipulating expressions. */
    module SQExprBuilder {
        function entity(schema: string, entity: string, variable?: string): SQEntityExpr;
        function columnRef(source: SQExpr, prop: string): SQColumnRefExpr;
        function measureRef(source: SQExpr, prop: string): SQMeasureRefExpr;
        function aggregate(source: SQExpr, aggregate: QueryAggregateFunction): SQAggregationExpr;
        function hierarchy(source: SQExpr, hierarchy: string): SQHierarchyExpr;
        function propertyVariationSource(source: SQExpr, name: string, property: string): SQPropertyVariationSourceExpr;
        function hierarchyLevel(source: SQExpr, level: string): SQHierarchyLevelExpr;
        function and(left: SQExpr, right: SQExpr): SQExpr;
        function between(arg: SQExpr, lower: SQExpr, upper: SQExpr): SQBetweenExpr;
        function inExpr(args: SQExpr[], values: SQExpr[][]): SQInExpr;
        function or(left: SQExpr, right: SQExpr): SQExpr;
        function compare(kind: QueryComparisonKind, left: SQExpr, right: SQExpr): SQCompareExpr;
        function contains(left: SQExpr, right: SQExpr): SQContainsExpr;
        function exists(arg: SQExpr): SQExistsExpr;
        function equal(left: SQExpr, right: SQExpr): SQCompareExpr;
        function not(arg: SQExpr): SQNotExpr;
        function startsWith(left: SQExpr, right: SQExpr): SQStartsWithExpr;
        function nullConstant(): SQConstantExpr;
        function now(): SQNowExpr;
        function defaultValue(): SQDefaultValueExpr;
        function anyValue(): SQAnyValueExpr;
        function boolean(value: boolean): SQConstantExpr;
        function dateAdd(unit: TimeUnit, amount: number, arg: SQExpr): SQDateAddExpr;
        function dateTime(value: Date, valueEncoded?: string): SQConstantExpr;
        function dateSpan(unit: TimeUnit, arg: SQExpr): SQDateSpanExpr;
        function decimal(value: number, valueEncoded?: string): SQConstantExpr;
        function double(value: number, valueEncoded?: string): SQConstantExpr;
        function integer(value: number, valueEncoded?: string): SQConstantExpr;
        function text(value: string, valueEncoded?: string): SQConstantExpr;
        function setAggregate(expr: SQExpr, aggregate: QueryAggregateFunction): SQExpr;
        function removeAggregate(expr: SQExpr): SQExpr;
        function removeEntityVariables(expr: SQExpr): SQExpr;
        function createExprWithAggregate(expr: SQExpr, schema: FederatedConceptualSchema, aggregateNonNumericFields: boolean, preferredAggregate?: QueryAggregateFunction): SQExpr;
    }
    /** Provides utilities for obtaining information about expressions. */
    module SQExprInfo {
        function getAggregate(expr: SQExpr): QueryAggregateFunction;
    }
    const enum SQExprValidationError {
        invalidAggregateFunction = 0,
        invalidSchemaReference = 1,
        invalidEntityReference = 2,
        invalidColumnReference = 3,
        invalidMeasureReference = 4,
        invalidLeftOperandType = 5,
        invalidRightOperandType = 6,
        invalidValueType = 7,
    }
    class SQExprValidationVisitor extends SQExprRewriter {
        errors: SQExprValidationError[];
        private schema;
        constructor(schema: FederatedConceptualSchema, errors?: SQExprValidationError[]);
        visitIn(expr: SQInExpr): SQExpr;
        visitCompare(expr: SQCompareExpr): SQExpr;
        visitColumnRef(expr: SQColumnRefExpr): SQExpr;
        visitMeasureRef(expr: SQMeasureRefExpr): SQExpr;
        visitAggr(expr: SQAggregationExpr): SQExpr;
        visitEntity(expr: SQEntityExpr): SQExpr;
        visitContains(expr: SQContainsExpr): SQExpr;
        visitStartsWith(expr: SQContainsExpr): SQExpr;
        private validateCompatibleType(left, right);
        private validateEntity(schemaName, entityName);
        private register(error);
        private isQueryable(fieldExpr);
    }
}
declare module powerbi.data {
    module SQExprUtils {
        /** Returns an array of supported aggregates for a given expr and role. */
        function getSupportedAggregates(expr: SQExpr, schema: FederatedConceptualSchema): QueryAggregateFunction[];
        function isSupportedAggregate(expr: SQExpr, schema: FederatedConceptualSchema, aggregate: QueryAggregateFunction): boolean;
        function indexOfExpr(items: SQExpr[], searchElement: SQExpr): number;
        function sequenceEqual(x: SQExpr[], y: SQExpr[]): boolean;
        function uniqueName(namedItems: NamedSQExpr[], expr: SQExpr): string;
        /** Generates a default expression name  */
        function defaultName(expr: SQExpr, fallback?: string): string;
        /** Gets a value indicating whether the expr is a model measure or an aggregate. */
        function isMeasure(expr: SQExpr): boolean;
        /** Gets a value indicating whether the expr is an AnyValue or equals comparison to AnyValue*/
        function isAnyValue(expr: SQExpr): boolean;
        /** Gets a value indicating whether the expr is a DefaultValue or equals comparison to DefaultValue*/
        function isDefaultValue(expr: SQExpr): boolean;
        function discourageAggregation(expr: SQExpr, schema: FederatedConceptualSchema): boolean;
        function getSchemaCapabilities(expr: SQExpr, schema: FederatedConceptualSchema): ConceptualCapabilities;
        function getKpiStatus(expr: SQExpr, schema: FederatedConceptualSchema): SQExpr;
        function getKpiMetadata(expr: SQExpr, schema: FederatedConceptualSchema): DataViewKpiColumnMetadata;
        function getConceptualHierarchy(sqExpr: SQExpr, federatedSchema: FederatedConceptualSchema): ConceptualHierarchy;
        function expandExpr(schema: FederatedConceptualSchema, expr: SQExpr): SQExpr | SQExpr[];
        function getSourceVariationExpr(hierarchyLevelExpr: data.SQHierarchyLevelExpr): SQColumnRefExpr;
        function getSourceHierarchy(hierarchyLevelExpr: data.SQHierarchyLevelExpr): SQHierarchyExpr;
        function getDefaultValue(fieldSQExpr: SQExpr, schema: FederatedConceptualSchema): SQConstantExpr;
        function getDefaultValues(fieldSQExprs: SQExpr[], schema: FederatedConceptualSchema): SQConstantExpr[];
        /** Return compare or and expression for key value pairs. */
        function getDataViewScopeIdentityComparisonExpr(fieldsExpr: SQExpr[], values: SQConstantExpr[]): SQExpr;
        function getHierarchySourceAsVariationSource(hierarchyLevelExpr: SQHierarchyLevelExpr): SQPropertyVariationSourceExpr;
        function getActiveTablesNames(queryDefn: data.SemanticQuery): string[];
    }
    module SQExprHierarchyToHierarchyLevelConverter {
        function convert(sqExpr: SQExpr, federatedSchema: FederatedConceptualSchema): SQExpr[];
    }
}
declare module powerbi.data {
    class SemanticQueryRewriter {
        private exprRewriter;
        constructor(exprRewriter: ISQExprVisitor<SQExpr>);
        rewriteFrom(fromValue: SQFrom): SQFrom;
        rewriteSelect(selectItems: NamedSQExpr[], from: SQFrom): NamedSQExpr[];
        rewriteOrderBy(orderByItems: SQSortDefinition[], from: SQFrom): SQSortDefinition[];
        rewriteWhere(whereItems: SQFilter[], from: SQFrom): SQFilter[];
    }
}
declare module powerbi.data {
    import ArrayNamedItems = jsCommon.ArrayNamedItems;
    interface NamedSQExpr {
        name: string;
        expr: SQExpr;
    }
    interface SQFilter {
        target?: SQExpr[];
        condition: SQExpr;
    }
    /** Represents an entity reference in SemanticQuery from. */
    interface SQFromEntitySource {
        entity: string;
        schema: string;
    }
    /** Represents a sort over an expression. */
    interface SQSortDefinition {
        expr: SQExpr;
        direction: SortDirection;
    }
    interface QueryFromEnsureEntityResult {
        name: string;
        new?: boolean;
    }
    interface SQSourceRenames {
        [from: string]: string;
    }
    /**
     * Represents a semantic query that is:
     * 1) Round-trippable with a JSON QueryDefinition.
     * 2) Immutable
     * 3) Long-lived and does not have strong references to a conceptual model (only names).
     */
    class SemanticQuery {
        private static empty;
        private fromValue;
        private whereItems;
        private orderByItems;
        private selectItems;
        constructor(from: any, where: any, orderBy: any, select: NamedSQExpr[]);
        static create(): SemanticQuery;
        private static createWithTrimmedFrom(from, where, orderBy, select);
        from(): SQFrom;
        /** Returns a query equivalent to this, with the specified selected items. */
        select(values: NamedSQExpr[]): SemanticQuery;
        /** Gets the items being selected in this query. */
        select(): ArrayNamedItems<NamedSQExpr>;
        private getSelect();
        private setSelect(values);
        /** Removes the given expression from the select. */
        removeSelect(expr: SQExpr): SemanticQuery;
        /** Removes the given expression from order by. */
        removeOrderBy(expr: SQExpr): SemanticQuery;
        selectNameOf(expr: SQExpr): string;
        setSelectAt(index: number, expr: SQExpr): SemanticQuery;
        /** Adds a the expression to the select clause. */
        addSelect(expr: SQExpr): SemanticQuery;
        /** Gets or sets the sorting for this query. */
        orderBy(values: SQSortDefinition[]): SemanticQuery;
        orderBy(): SQSortDefinition[];
        private getOrderBy();
        private setOrderBy(values);
        /** Gets or sets the filters for this query. */
        where(values: SQFilter[]): SemanticQuery;
        where(): SQFilter[];
        private getWhere();
        private setWhere(values);
        addWhere(filter: SemanticFilter): SemanticQuery;
        rewrite(exprRewriter: ISQExprVisitor<SQExpr>): SemanticQuery;
    }
    /** Represents a semantic filter condition.  Round-trippable with a JSON FilterDefinition.  Instances of this class are immutable. */
    class SemanticFilter {
        private fromValue;
        private whereItems;
        constructor(from: SQFrom, where: SQFilter[]);
        static fromSQExpr(contract: SQExpr): SemanticFilter;
        static getDefaultValueFilter(fieldSQExprs: SQExpr | SQExpr[]): SemanticFilter;
        static getAnyValueFilter(fieldSQExprs: SQExpr | SQExpr[]): SemanticFilter;
        private static getDataViewScopeIdentityComparisonFilters(fieldSQExprs, value);
        from(): SQFrom;
        conditions(): SQExpr[];
        where(): SQFilter[];
        rewrite(exprRewriter: ISQExprVisitor<SQExpr>): SemanticFilter;
        validate(schema: FederatedConceptualSchema, errors?: SQExprValidationError[]): SQExprValidationError[];
        /** Merges a list of SemanticFilters into one. */
        static merge(filters: SemanticFilter[]): SemanticFilter;
        static isDefaultFilter(filter: SemanticFilter): boolean;
        static isAnyFilter(filter: SemanticFilter): boolean;
        static isSameFilter(leftFilter: SemanticFilter, rightFilter: SemanticFilter): boolean;
        private static applyFilter(filter, from, where);
    }
    /** Represents a SemanticQuery/SemanticFilter from clause. */
    class SQFrom {
        private items;
        constructor(items?: {
            [name: string]: SQFromEntitySource;
        });
        keys(): string[];
        entity(key: string): SQFromEntitySource;
        ensureEntity(entity: SQFromEntitySource, desiredVariableName?: string): QueryFromEnsureEntityResult;
        remove(key: string): void;
        /** Converts the entity name into a short reference name.  Follows the Semantic Query convention of a short name. */
        private candidateName(ref);
        clone(): SQFrom;
    }
    class SQExprRewriterWithSourceRenames extends SQExprRewriter {
        private renames;
        constructor(renames: SQSourceRenames);
        visitEntity(expr: SQEntityExpr): SQExpr;
        rewriteFilter(filter: SQFilter): SQFilter;
        rewriteArray(exprs: SQExpr[]): SQExpr[];
        static rewrite(expr: SQExpr, from: SQFrom): SQExpr;
    }
}
declare module powerbi {
    /** Culture interfaces. These match the Globalize library interfaces intentionally. */
    interface Culture {
        name: string;
        calendar: Calendar;
        calendars: CalendarDictionary;
        numberFormat: NumberFormatInfo;
    }
    interface Calendar {
        patterns: any;
        firstDay: number;
    }
    interface CalendarDictionary {
        [key: string]: Calendar;
    }
    interface NumberFormatInfo {
        decimals: number;
        groupSizes: number[];
        negativeInfinity: string;
        positiveInfinity: string;
    }
    /**
     * NumberFormat module contains the static methods for formatting the numbers.
     * It extends the JQuery.Globalize functionality to support complete set of .NET
     * formatting expressions for numeric types including custom formats.
     */
    module NumberFormat {
        interface NumericFormatMetadata {
            format: string;
            hasEscapes: boolean;
            hasQuotes: boolean;
            hasE: boolean;
            hasCommas: boolean;
            hasDots: boolean;
            hasPercent: boolean;
            hasPermile: boolean;
            precision: number;
            scale: number;
        }
        interface NumberFormatComponents {
            hasNegative: boolean;
            positive: string;
            negative: string;
            zero: string;
        }
        function getComponents(format: string): NumberFormatComponents;
        /** Evaluates if the value can be formatted using the NumberFormat */
        function canFormat(value: any): boolean;
        function isStandardFormat(format: string): boolean;
        /** Formats the number using specified format expression and culture */
        function format(value: number, format: string, culture: Culture): string;
        /** Performs a custom format with a value override.  Typically used for custom formats showing scaled values. */
        function formatWithCustomOverride(value: number, format: string, nonScientificOverrideFormat: string, culture: Culture): string;
        /**
         * Returns the formatMetadata of the format
         * When calculating precision and scale, if format string of
         * positive[;negative;zero] => positive format will be used
         * @param (required) format - format string
         * @param (optional) calculatePrecision - calculate precision of positive format
         * @param (optional) calculateScale - calculate scale of positive format
         */
        function getCustomFormatMetadata(format: string, calculatePrecision?: boolean, calculateScale?: boolean): NumericFormatMetadata;
    }
    var formattingService: IFormattingService;
}
declare module powerbi.data {
    /** Serializes SQExpr in a form optimized in-memory comparison, but not intended for storage on disk. */
    module SQExprShortSerializer {
        function serialize(expr: SQExpr): string;
        function serializeArray(exprs: SQExpr[]): string;
    }
}
declare module powerbi.data {
    import IStringResourceProvider = jsCommon.IStringResourceProvider;
    type DisplayNameGetter = ((resourceProvider: IStringResourceProvider) => string) | string;
    function createDisplayNameGetter(displayNameKey: string): (provider: IStringResourceProvider) => string;
    function getDisplayName(displayNameGetter: data.DisplayNameGetter, resourceProvider: jsCommon.IStringResourceProvider): string;
}
declare module powerbi.data {
    module DataShapeBindingDataReduction {
        function createFrom(reduction: ReductionAlgorithm): DataShapeBindingDataReductionAlgorithm;
    }
}
declare module powerbi.data {
    interface DataViewNormalizeValuesApplyOptions {
        dataview: DataView;
        dataViewMappings: DataViewMapping[];
        dataRoles: VisualDataRole[];
    }
    interface IMetadataColumnFilter {
        (columnIndex: number): boolean;
    }
    interface IColumnValueFilter {
        (value: any): boolean;
    }
    interface IValueFilter {
        (columnIndex: number, value: any): boolean;
    }
    module DataViewNormalizeValues {
        function apply(options: DataViewNormalizeValuesApplyOptions): void;
        function filterVariantMeasures(dataview: DataView, dataViewMappings: DataViewMapping[], rolesToNormalize: VisualDataRole[]): void;
        function generateMetadataColumnFilter(columns: DataViewMetadataColumn[], rolesToNormalize: VisualDataRole[]): IMetadataColumnFilter;
        function generateValueFilter(columns: DataViewMetadataColumn[], rolesToNormalize: VisualDataRole[]): IValueFilter;
        function getColumnRequiredTypes(column: DataViewMetadataColumn, rolesToNormalize: VisualDataRole[]): ValueType[];
        function normalizeVariant<T>(object: T, key: string | number, columnIndex: number, valueFilter: IValueFilter): T;
    }
}
declare module powerbi.data {
    module DataViewPivotCategoricalToPrimaryGroups {
        /**
         * If mapping requests cross axis data reduction and the binding has secondary grouping, mutates the binding to
         * pivot the secondary before the primary.
         */
        function pivotBinding(binding: DataShapeBinding, allMappings: CompiledDataViewMapping[], finalMapping: CompiledDataViewMapping, defaultDataVolume: number): void;
        function unpivotResult(oldDataView: DataView, selects: DataViewSelectTransform[], dataViewMappings: DataViewMapping[]): DataView;
    }
}
declare module powerbi {
    import ArrayNamedItems = jsCommon.ArrayNamedItems;
    import FederatedConceptualSchema = powerbi.data.FederatedConceptualSchema;
    import QueryProjectionsByRole = data.QueryProjectionsByRole;
    interface ScriptResult {
        source: string;
        provider: string;
    }
    module ScriptResultUtil {
        function findScriptResult(dataViewMappings: DataViewMapping[] | data.CompiledDataViewMapping[]): DataViewScriptResultMapping | data.CompiledDataViewScriptResultMapping;
        function extractScriptResult(dataViewMappings: data.CompiledDataViewMapping[]): ScriptResult;
        function extractScriptResultFromVisualConfig(dataViewMappings: DataViewMapping[], objects: powerbi.data.DataViewObjectDefinitions): ScriptResult;
        function getScriptInput(projections: QueryProjectionsByRole, selects: ArrayNamedItems<data.NamedSQExpr>, schema: FederatedConceptualSchema): data.ScriptInput;
    }
}
declare module powerbi {
    import DisplayNameGetter = powerbi.data.DisplayNameGetter;
    /** Defines the data roles understood by the IVisual. */
    interface VisualDataRole {
        /** Unique name for the VisualDataRole. */
        name: string;
        /** Indicates the kind of role.  This value is used to build user interfaces, such as a field well. */
        kind: VisualDataRoleKind;
        displayName?: DisplayNameGetter;
        /** The tooltip text */
        description?: DisplayNameGetter;
        /** Indicates the preferred ValueTypes to be used in this data role.  This is used by authoring tools when adding fields into the visual. */
        preferredTypes?: ValueTypeDescriptor[];
        /** Indicates the required ValueTypes for this data role. Any values which do not match one of the ValueTypes specified will be null'd out */
        requiredTypes?: ValueTypeDescriptor[];
    }
    interface RoleCondition extends NumberRange {
        kind?: VisualDataRoleKind;
    }
    enum VisualDataRoleKind {
        /** Indicates that the role should be bound to something that evaluates to a grouping of values. */
        Grouping = 0,
        /** Indicates that the role should be bound to something that evaluates to a single value in a scope. */
        Measure = 1,
        /** Indicates that the role can be bound to either Grouping or Measure. */
        GroupingOrMeasure = 2,
    }
}
declare module powerbi.data {
    function createMatrixEvalContext(dataViewMatrix: DataViewMatrix): IEvalContext;
}
declare module powerbi.data {
    function createStaticEvalContext(dataView?: DataView): IEvalContext;
}
declare module powerbi.data {
    /** Represents common expression patterns for 'field' expressions such as columns, column aggregates, measures, etc. */
    interface FieldExprPattern {
        column?: FieldExprColumnPattern;
        columnAggr?: FieldExprColumnAggrPattern;
        columnHierarchyLevelVariation?: FieldExprColumnHierarchyLevelVariation;
        entityAggr?: FieldExprEntityAggrPattern;
        hierarchyLevel?: FieldExprHierarchyLevelPattern;
        hierarchy?: FieldExprHierarchyPattern;
        measure?: FieldExprMeasurePattern;
    }
    interface FieldExprEntityItemPattern {
        schema: string;
        entity: string;
        entityVar?: string;
    }
    interface FieldExprPropertyPattern extends FieldExprEntityItemPattern {
        name: string;
    }
    type FieldExprColumnPattern = FieldExprPropertyPattern;
    interface FieldExprColumnAggrPattern extends FieldExprColumnPattern {
        aggregate: QueryAggregateFunction;
    }
    module SQExprBuilder {
        function fieldExpr(fieldExpr: FieldExprPattern): SQExpr;
    }
    interface FieldExprColumnHierarchyLevelVariation {
        source: FieldExprColumnPattern;
        level: FieldExprHierarchyLevelPattern;
        variationName: string;
    }
    interface FieldExprEntityAggrPattern extends FieldExprEntityItemPattern {
        aggregate: QueryAggregateFunction;
    }
    interface FieldExprHierarchyLevelPattern extends FieldExprEntityItemPattern {
        level: string;
        name: string;
    }
    interface FieldExprHierarchyPattern extends FieldExprEntityItemPattern {
        name: string;
    }
    type FieldExprMeasurePattern = FieldExprPropertyPattern;
    module SQExprConverter {
        function asFieldPattern(sqExpr: SQExpr): FieldExprPattern;
    }
    module FieldExprPattern {
        function hasFieldExprName(fieldExpr: FieldExprPattern): boolean;
        function getPropertyName(fieldExpr: FieldExprPattern): string;
        function getColumnRef(fieldExpr: FieldExprPattern): FieldExprPropertyPattern;
        function getFieldExprName(fieldExpr: FieldExprPattern): string;
        function toFieldExprEntityItemPattern(fieldExpr: FieldExprPattern): FieldExprEntityItemPattern;
    }
}

declare module powerbi {
    import DataViewObjectDescriptors = powerbi.data.DataViewObjectDescriptors;
    import DataViewObjectDescriptor = powerbi.data.DataViewObjectDescriptor;
    import Selector = powerbi.data.Selector;
    import IStringResourceProvider = jsCommon.IStringResourceProvider;
    import IRect = powerbi.visuals.IRect;
    /**
     * Represents a visualization displayed within an application (PowerBI dashboards, ad-hoc reporting, etc.).
     * This interface does not make assumptions about the underlying JS/HTML constructs the visual uses to render itself.
     */
    interface IVisual {
        /**
         * Initializes an instance of the IVisual.
         *
         * @param options Initialization options for the visual.
         */
        init(options: VisualInitOptions): void;
        /** Notifies the visual that it is being destroyed, and to do any cleanup necessary (such as unsubscribing event handlers). */
        destroy?(): void;
        /**
         * Notifies the IVisual of an update (data, viewmode, size change).
         */
        update?(options: VisualUpdateOptions): void;
        /**
         * Notifies the IVisual to resize.
         *
         * @param finalViewport This is the viewport that the visual will eventually be resized to.
         */
        onResizing?(finalViewport: IViewport): void;
        /**
         * Notifies the IVisual of new data being provided.
         * This is an optional method that can be omitted if the visual is in charge of providing its own data.
         */
        onDataChanged?(options: VisualDataChangedOptions): void;
        /** Notifies the IVisual of changes to the color, font, theme, and style related values that the visual should use. */
        onStyleChanged?(newStyle: IVisualStyle): void;
        /** Notifies the IVisual to change view mode if applicable. */
        onViewModeChanged?(viewMode: ViewMode): void;
        /** Notifies the IVisual to clear any selection. */
        onClearSelection?(): void;
        /** Notifies the IVisual to select the specified object. */
        onSelectObject?(object: VisualObjectInstance): void;
        /** Gets a value indicating whether the IVisual can be resized to the given viewport. */
        canResizeTo?(viewport: IViewport): boolean;
        /** Gets the set of objects that the visual is currently displaying. */
        enumerateObjectInstances?(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration;
    }
    interface IVisualPlugin {
        /** The name of the plugin.  Must match the property name in powerbi.visuals. */
        name: string;
        /** The key for the watermark style of this visual. Must match the id name in ExploreUI/views/svg/visualsWatermarks.svg */
        watermarkKey?: string;
        /** Declares the capabilities for this IVisualPlugin type. */
        capabilities?: VisualCapabilities;
        /** Function to call to create the visual. */
        create: IVisualFactoryMethod;
        /**
          * Function to allow the visual to influence query generation. Called each time a query is generated
          * so the visual can translate its state into options understood by the query generator.
          */
        customizeQuery?: CustomizeQueryMethod;
        /** The class of the plugin.  At the moment it is only used to have a way to indicate the class name that a custom visual has. */
        class?: string;
        /** The url to the icon to display within the visualization pane. */
        iconUrl?: string;
        /** Check if a visual is custom */
        custom?: boolean;
        getSortableRoles?: (visualSortableOptions?: VisualSortableOptions) => string[];
    }
    /** Factory method for an IVisual.  This factory method should be registered on the powerbi.visuals object. */
    interface IVisualFactoryMethod {
        (): IVisual;
    }
    /** Parameters available to a CustomizeQueryMethod */
    interface CustomizeQueryOptions {
        /**
         * The data view mapping for this visual with some additional information. CustomizeQueryMethod implementations
         * are expected to edit this in-place.
         */
        dataViewMappings: data.CompiledDataViewMapping[];
        /**
         * Visual should prefer to request a higher volume of data.
         */
        preferHigherDataVolume?: boolean;
    }
    /** Parameters available to a sortable visual candidate */
    interface VisualSortableOptions {
        dataViewMappings: data.CompiledDataViewMapping[];
    }
    /** An imperative way for a visual to influence query generation beyond just its declared capabilities. */
    interface CustomizeQueryMethod {
        (options: CustomizeQueryOptions): void;
    }
    /** Defines the visual filtering capability for a particular filter kind. */
    interface VisualFilterMapping {
        /** Specifies what data roles are used to control the filter semantics for this filter kind. */
        targetRoles: string[];
    }
    /**
     * Defines the visual filtering capabilities for various filter kinds.
     * By default all visuals support attribute filters and measure filters in their innermost scope.
     */
    interface VisualFilterMappings {
        measureFilter?: VisualFilterMapping;
    }
    /** Defines the capabilities of an IVisual. */
    interface VisualCapabilities {
        /** Defines what roles the visual expects, and how those roles should be populated.  This is useful for visual generation/editing. */
        dataRoles?: VisualDataRole[];
        /** Defines the set of objects supported by this IVisual. */
        objects?: DataViewObjectDescriptors;
        /** Defines how roles that the visual understands map to the DataView.  This is useful for query generation. */
        dataViewMappings?: DataViewMapping[];
        /** Defines how filters are understood by the visual. This is used by query generation */
        filterMappings?: VisualFilterMappings;
        /** Indicates whether cross-highlight is supported by the visual. This is useful for query generation. */
        supportsHighlight?: boolean;
        /** Indicates whether the visual uses onSelected function for data selections.  Default is true. */
        supportsSelection?: boolean;
        /** Indicates whether sorting is supported by the visual. This is useful for query generation */
        sorting?: VisualSortingCapabilities;
        /** Indicates whether a default title should be displayed.  Visuals with self-describing layout can omit this. */
        suppressDefaultTitle?: boolean;
        /** Indicates whether drilling is supported by the visual. */
        drilldown?: VisualDrillCapabilities;
        /** Indicates whether rotating is supported by the visual. */
        canRotate?: boolean;
    }
    /** Defines the visual sorting capability. */
    interface VisualSortingCapabilities {
        /** When specified, indicates that the IVisual wants default sorting behavior. */
        default?: {};
        /** When specified, indicates that the IVisual wants to control sort interactivity. */
        custom?: {};
        /** When specified, indicates sorting that is inherently implied by the IVisual.  This is useful to automatically sort. */
        implicit?: VisualImplicitSorting;
    }
    /** Defines the visual's drill capability. */
    interface VisualDrillCapabilities {
        /** Returns the drillable role names for this visual **/
        roles?: string[];
    }
    /** Defines implied sorting behaviour for an IVisual. */
    interface VisualImplicitSorting {
        clauses: VisualImplicitSortingClause[];
    }
    interface VisualImplicitSortingClause {
        role: string;
        direction: SortDirection;
    }
    /** Defines the capabilities of an IVisual. */
    interface VisualInitOptions {
        /** The DOM element the visual owns. */
        element: JQuery;
        /** The set of services provided by the visual hosting layer. */
        host: IVisualHostServices;
        /** Style information. */
        style: IVisualStyle;
        /** The initial viewport size. */
        viewport: IViewport;
        /** Animation options. */
        animation?: AnimationOptions;
        /** Interactivity options. */
        interactivity?: InteractivityOptions;
    }
    interface VisualUpdateOptions {
        viewport: IViewport;
        dataViews: DataView[];
        suppressAnimations?: boolean;
        viewMode?: ViewMode;
    }
    interface VisualDataChangedOptions {
        dataViews: DataView[];
        /** Optionally prevent animation transitions */
        suppressAnimations?: boolean;
        /** Indicates what type of update has been performed on the data.
        The default operation kind is Create.*/
        operationKind?: VisualDataChangeOperationKind;
    }
    enum VisualDataChangeOperationKind {
        Create = 0,
        Append = 1,
    }
    interface EnumerateVisualObjectInstancesOptions {
        objectName: string;
    }
    interface CustomSortEventArgs {
        sortDescriptors: SortableFieldDescriptor[];
    }
    interface SortableFieldDescriptor {
        queryName: string;
        sortDirection?: SortDirection;
    }
    enum ViewMode {
        View = 0,
        Edit = 1,
    }
    interface IVisualErrorMessage {
        message: string;
        title: string;
        detail: string;
    }
    interface IVisualWarning {
        code: string;
        getMessages(resourceProvider: IStringResourceProvider): IVisualErrorMessage;
    }
    /** Defines behavior for IVisual interaction with the host environment. */
    interface IVisualHostServices {
        /** Returns the localized form of a string. */
        getLocalizedString(stringId: string): string;
        /** Notifies of a DragStart event. */
        onDragStart(args: DragEventArgs): void;
        /** Gets a value indicating whether the given selection is valid. */
        canSelect(args: SelectEventArgs): boolean;
        /** Notifies of a data point being selected. */
        onSelect(args: SelectEventArgs): void;
        /** Check if selection is sticky or otherwise. */
        shouldRetainSelection(): boolean;
        /** Notifies of a visual object being selected. */
        onSelectObject?(args: SelectObjectEventArgs): void;
        /** Notifies that properties of the IVisual have changed. */
        persistProperties(changes: VisualObjectInstance[]): void;
        persistProperties(changes: VisualObjectInstancesToPersist): void;
        /** Requests more data to be loaded. */
        loadMoreData(): void;
        /** Notification to sort on the specified column */
        onCustomSort(args: CustomSortEventArgs): void;
        /** Indicates which view mode the host is in. */
        getViewMode(): ViewMode;
        /** Notify any warning that happened during update of the visual. */
        setWarnings(clientWarnings: IVisualWarning[]): void;
        /** Sets a toolbar on the host. */
        setToolbar($selector: JQuery): void;
        /** Gets Geocoding Service. */
        geocoder(): IGeocoder;
    }
    /** Animation options for visuals. */
    interface AnimationOptions {
        /** Indicates whether all transition frames should be flushed immediately, effectively "disabling" any visual transitions. */
        transitionImmediate: boolean;
    }
    /** Interactivity options for visuals. */
    interface InteractivityOptions {
        /** Indicates that dragging of data points should be permitted. */
        dragDataPoint?: boolean;
        /** Indicates that data points should be selectable. */
        selection?: boolean;
        /** Indicates that the chart and the legend are interactive */
        isInteractiveLegend?: boolean;
        /** Indicates overflow behavior. Values are CSS oveflow strings */
        overflow?: string;
    }
    interface VisualDragPayload extends DragPayload {
        data?: Selector;
        field?: {};
    }
    interface DragEventArgs {
        event: DragEvent;
        data: VisualDragPayload;
    }
    /** Defines geocoding services. */
    interface IGeocoder {
        geocode(query: string, category?: string): IPromise<IGeocodeCoordinate>;
        geocodeBoundary(latitude: number, longitude: number, category: string, levelOfDetail?: number, maxGeoData?: number): IPromise<IGeocodeBoundaryCoordinate>;
    }
    interface IGeocodeCoordinate {
        latitude: number;
        longitude: number;
    }
    interface IGeocodeBoundaryCoordinate {
        latitude?: number;
        longitude?: number;
        locations?: IGeocodeBoundaryPolygon[];
    }
    interface IGeocodeBoundaryPolygon {
        nativeBing: string;
        /** array of lat/long pairs as [lat1, long1, lat2, long2,...] */
        geographic?: Float64Array;
        /** array of absolute pixel position pairs [x1,y1,x2,y2,...]. It can be used by the client for cache the data. */
        absolute?: Float64Array;
        absoluteBounds?: IRect;
        /** string of absolute pixel position pairs "x1 y1 x2 y2...". It can be used by the client for cache the data. */
        absoluteString?: string;
    }
    interface SelectorForColumn {
        [queryName: string]: data.DataRepetitionSelector;
    }
    interface SelectorsByColumn {
        /** Data-bound repetition selection. */
        dataMap?: SelectorForColumn;
        /** Metadata-bound repetition selection.  Refers to a DataViewMetadataColumn queryName. */
        metadata?: string;
        /** User-defined repetition selection. */
        id?: string;
    }
    interface SelectEventArgs {
        data: Selector[];
        data2?: SelectorsByColumn[];
    }
    interface SelectObjectEventArgs {
        object: DataViewObjectDescriptor;
    }
    interface VisualObjectInstance {
        /** The name of the object (as defined in VisualCapabilities). */
        objectName: string;
        /** A display name for the object instance. */
        displayName?: string;
        /** The set of property values for this object.  Some of these properties may be defaults provided by the IVisual. */
        properties: {
            [propertyName: string]: DataViewPropertyValue;
        };
        /** The selector that identifies this object. */
        selector: Selector;
        /** Defines the constrained set of valid values for a property. */
        validValues?: {
            [propertyName: string]: string[];
        };
        /** (Optional) VisualObjectInstanceEnumeration category index. */
        containerIdx?: number;
    }
    type VisualObjectInstanceEnumeration = VisualObjectInstance[] | VisualObjectInstanceEnumerationObject;
    interface VisualObjectInstanceEnumerationObject {
        /** The visual object instances. */
        instances: VisualObjectInstance[];
        /** Defines a set of containers for related object instances. */
        containers?: VisualObjectInstanceContainer[];
    }
    interface VisualObjectInstanceContainer {
        displayName: data.DisplayNameGetter;
    }
    interface VisualObjectInstancesToPersist {
        /** Instances which should be merged with existing instances. */
        merge?: VisualObjectInstance[];
        /** Instances which should replace existing instances. */
        replace?: VisualObjectInstance[];
        /** Instances which should be deleted from the existing instances. */
        remove?: VisualObjectInstance[];
    }
}
declare module powerbi.visuals {
    interface IPoint {
        x: number;
        y: number;
    }
    class Point implements IPoint {
        x: number;
        y: number;
        constructor(x?: number, y?: number);
    }
}
declare module powerbi.visuals {
    interface IRect {
        left: number;
        top: number;
        width: number;
        height: number;
    }
    class Rect implements IRect {
        left: number;
        top: number;
        width: number;
        height: number;
        constructor(left?: number, top?: number, width?: number, height?: number);
    }
}
declare module powerbi.visuals {
    module axisScale {
        const linear: string;
        const log: string;
        const type: IEnumType;
    }
}
declare module powerbi.visuals {
    module axisStyle {
        const showBoth: string;
        const showTitleOnly: string;
        const showUnitOnly: string;
        const type: IEnumType;
    }
}
declare module powerbi.visuals {
    module axisType {
        const scalar: string;
        const categorical: string;
        const both: string;
        const type: IEnumType;
    }
}
declare module powerbi.visuals {
    module basicShapeType {
        const rectangle: string;
        const oval: string;
        const line: string;
        const arrow: string;
        const triangle: string;
        const type: IEnumType;
    }
}
declare module powerbi.visuals {
    module imageScalingType {
        const normal: string;
        const fit: string;
        const fill: string;
        const type: IEnumType;
    }
}
declare module powerbi.visuals {
    module labelPosition {
        const insideEnd: string;
        const insideCenter: string;
        const outsideEnd: string;
        const insideBase: string;
        const type: IEnumType;
    }
}
declare module powerbi.visuals {
    module legendPosition {
        const top: string;
        const bottom: string;
        const left: string;
        const right: string;
        const topCenter: string;
        const bottomCenter: string;
        const leftCenter: string;
        const rightCenter: string;
        const type: IEnumType;
    }
}
declare module powerbi.visuals {
    module lineStyle {
        const dashed: string;
        const solid: string;
        const dotted: string;
        const type: IEnumType;
    }
}
declare module powerbi.visuals {
    module outline {
        const none: string;
        const bottomOnly: string;
        const topOnly: string;
        const topBottom: string;
        const leftRight: string;
        const frame: string;
        const type: IEnumType;
    }
}
declare module powerbi.visuals {
    module referenceLinePosition {
        const back: string;
        const front: string;
        const type: IEnumType;
    }
    module referenceLineDataLabelHorizontalPosition {
        const left: string;
        const right: string;
        const type: IEnumType;
    }
    module referenceLineDataLabelVerticalPosition {
        const above: string;
        const under: string;
        const type: IEnumType;
    }
}
declare module powerbi.visuals {
    module slicerOrientation {
        enum Orientation {
            Vertical = 0,
            Horizontal = 1,
        }
        const type: IEnumType;
    }
}
declare module powerbi.visuals {
    module yAxisPosition {
        const left: string;
        const right: string;
        const type: IEnumType;
    }
}

declare module powerbi.visuals {
    interface SelectableDataPoint {
        selected: boolean;
        identity: SelectionId;
    }
    /**
     * Factory method to create an IInteractivityService instance.
     */
    function createInteractivityService(hostServices: IVisualHostServices): IInteractivityService;
    /**
     * Creates a clear an svg rect to catch clear clicks.
     */
    function appendClearCatcher(selection: d3.Selection<any>): d3.Selection<any>;
    function isCategoryColumnSelected(propertyId: DataViewObjectPropertyIdentifier, categories: DataViewCategoricalColumn, idx: number): boolean;
    function dataHasSelection(data: SelectableDataPoint[]): boolean;
    interface IInteractiveBehavior {
        bindEvents(behaviorOptions: any, selectionHandler: ISelectionHandler): void;
        renderSelection(hasSelection: boolean): void;
    }
    /**
     * An optional options bag for binding to the interactivityService
     */
    interface InteractivityServiceOptions {
        isLegend?: boolean;
        isLabels?: boolean;
        overrideSelectionFromData?: boolean;
        hasSelectionOverride?: boolean;
        slicerDefaultValueHandler?: any;/*SlicerDefaultValueHandler;*/
    }
    /**
     * Responsible for managing interactivity between the hosting visual and its peers
     */
    interface IInteractivityService {
        /** Binds the visual to the interactivityService */
        bind(dataPoints: SelectableDataPoint[], behavior: IInteractiveBehavior, behaviorOptions: any, iteractivityServiceOptions?: InteractivityServiceOptions): any;
        /** Clears the selection */
        clearSelection(): void;
        /** Sets the selected state on the given data points. */
        applySelectionStateToData(dataPoints: SelectableDataPoint[]): boolean;
        /** Checks whether there is at least one item selected */
        hasSelection(): boolean;
        /** Checks whether there is at least one item selected within the legend */
        legendHasSelection(): boolean;
        /** Checks whether the selection mode is inverted or normal */
        isSelectionModeInverted(): boolean;
        /** Sets whether the selection mode is inverted or normal */
        setSelectionModeInverted(inverted: boolean): void;
        setDefaultValueMode(useDefaultValue: boolean): void;
        isDefaultValueEnabled(): boolean;
    }
    interface ISelectionHandler {
        /** Handles a selection event by selecting the given data point */
        handleSelection(dataPoint: SelectableDataPoint, multiSelect: boolean): void;
        /** Handles a selection clear, clearing all selection state */
        handleClearSelection(): void;
        /** Toggles the selection mode between normal and inverted; returns true if the new mode is inverted */
        toggleSelectionModeInversion(): boolean;
        /** Sends the selection state to the host */
        persistSelectionFilter(filterPropertyIdentifier: DataViewObjectPropertyIdentifier): void;
    }
    class InteractivityService implements IInteractivityService, ISelectionHandler {
        private hostService;
        private renderSelectionInVisual;
        private renderSelectionInLegend;
        private renderSelectionInLabels;
        private selectedIds;
        private isInvertedSelectionMode;
        private hasSelectionOverride;
        private behavior;
        private slicerDefaultValueHandler;
        private useDefaultValue;
        selectableDataPoints: SelectableDataPoint[];
        selectableLegendDataPoints: SelectableDataPoint[];
        selectableLabelsDataPoints: SelectableDataPoint[];
        constructor(hostServices: IVisualHostServices);
        /** Binds the vsiual to the interactivityService */
        bind(dataPoints: SelectableDataPoint[], behavior: IInteractiveBehavior, behaviorOptions: any, options?: InteractivityServiceOptions): void;
        /**
         * Sets the selected state of all selectable data points to false and invokes the behavior's select command.
         */
        clearSelection(): void;
        applySelectionStateToData(dataPoints: SelectableDataPoint[]): boolean;
        /**
         * Checks whether there is at least one item selected.
         */
        hasSelection(): boolean;
        legendHasSelection(): boolean;
        labelsHasSelection(): boolean;
        isSelectionModeInverted(): boolean;
        setSelectionModeInverted(inverted: boolean): void;
        handleSelection(dataPoint: SelectableDataPoint, multiSelect: boolean): void;
        handleClearSelection(): void;
        toggleSelectionModeInversion(): boolean;
        persistSelectionFilter(filterPropertyIdentifier: DataViewObjectPropertyIdentifier): void;
        setDefaultValueMode(useDefaultValue: boolean): void;
        isDefaultValueEnabled(): boolean;
        private renderAll();
        /** Marks a data point as selected and syncs selection with the host. */
        private select(d, multiSelect);
        private selectInverted(d, multiSelect);
        private removeId(toRemove);
        /** Note: Public for UnitTesting */
        createChangeForFilterProperty(filterPropertyIdentifier: DataViewObjectPropertyIdentifier): VisualObjectInstancesToPersist;
        private sendSelectionToHost();
        private takeSelectionStateFromDataPoints(dataPoints);
        /**
         * Syncs the selection state for all data points that have the same category. Returns
         * true if the selection state was out of sync and corrections were made; false if
         * the data is already in sync with the service.
         *
         * If the data is not compatible with the current service's current selection state,
         * the state is cleared and the cleared selection is sent to the host.
         *
         * Ignores series for now, since we don't support series selection at the moment.
         */
        private syncSelectionState();
        private syncSelectionStateInverted();
        private applyToAllSelectableDataPoints(action);
        private static updateSelectableDataPointsBySelectedIds(selectableDataPoints, selectedIds);
        private static checkDatapointAgainstSelectedIds(datapoint, selectedIds);
    }
}

declare module powerbi.visuals {
    import Selector = powerbi.data.Selector;
    import SelectorsByColumn = powerbi.SelectorsByColumn;
    import SelectorForColumn = powerbi.SelectorForColumn;
    /**
     * A combination of identifiers used to uniquely identify
     * data points and their bound geometry.
     */
    class SelectionId {
        private selector;
        private selectorsByColumn;
        private key;
        private keyWithoutHighlight;
        highlight: boolean;
        constructor(selector: Selector, highlight: boolean);
        equals(other: SelectionId): boolean;
        /**
         * Checks equality against other for all identifiers existing in this.
         */
        includes(other: SelectionId, ignoreHighlight?: boolean): boolean;
        getKey(): string;
        getKeyWithoutHighlight(): string;
        /**
         * Temporary workaround since a few things currently rely on this, but won't need to.
         */
        hasIdentity(): boolean;
        getSelector(): Selector;
        getSelectorsByColumn(): SelectorsByColumn;
        static createNull(highlight?: boolean): SelectionId;
        static createWithId(id: DataViewScopeIdentity, highlight?: boolean): SelectionId;
        static createWithMeasure(measureId: string, highlight?: boolean): SelectionId;
        static createWithIdAndMeasure(id: DataViewScopeIdentity, measureId: string, highlight?: boolean): SelectionId;
        static createWithIdAndMeasureAndCategory(id: DataViewScopeIdentity, measureId: string, queryName: string, highlight?: boolean): SelectionId;
        static createWithIds(id1: DataViewScopeIdentity, id2: DataViewScopeIdentity, highlight?: boolean): SelectionId;
        static createWithIdsAndMeasure(id1: DataViewScopeIdentity, id2: DataViewScopeIdentity, measureId: string, highlight?: boolean): SelectionId;
        static createWithSelectorForColumnAndMeasure(dataMap: SelectorForColumn, measureId: string, highlight?: boolean): SelectionId;
        static createWithHighlight(original: SelectionId): SelectionId;
        private static idArray(id1, id2);
    }
    /**
     * This class is designed to simplify the creation of SelectionId objects
     * It allows chaining to build up an object before calling 'create' to build a SelectionId
     */
    class SelectionIdBuilder {
        private dataMap;
        private measure;
        static builder(): SelectionIdBuilder;
        withCategory(categoryColumn: DataViewCategoryColumn, index: number): SelectionIdBuilder;
        withSeries(seriesColumn: DataViewValueColumns, valueColumn: DataViewValueColumn | DataViewValueColumnGroup): SelectionIdBuilder;
        withMeasure(measureId: string): SelectionIdBuilder;
        createSelectionId(): SelectionId;
        private ensureDataMap();
    }
}
declare module powerbi.visuals.utility {
    interface SelectionManagerOptions {
        hostServices: IVisualHostServices;
    }
    class SelectionManager {
        private selectedIds;
        private hostServices;
        constructor(options: SelectionManagerOptions);
        select(selectionId: SelectionId, multiSelect?: boolean): JQueryDeferred<SelectionId[]>;
        hasSelection(): boolean;
        clear(): JQueryDeferred<{}>;
        getSelectionIds(): SelectionId[];
        private sendSelectionToHost(ids);
        private selectInternal(selectionId, multiSelect);
        static containsSelection(list: SelectionId[], id: SelectionId): boolean;
    }
}


declare module powerbi {
    interface IVisualStyle {
        colorPalette: IColorPalette;
        isHighContrast: boolean;
        titleText: ITextStyle;
        subTitleText: ITextStyle;
        labelText: ITextStyle;
        maxMarginFactor?: number;
    }
    interface ITextStyle extends IStyleInfo {
        fontFace?: string;
        fontSize?: string;
        fontWeight?: string;
        color: IColorInfo;
    }
    interface IColorPalette {
        background?: IColorInfo;
        foreground?: IColorInfo;
        positive?: IColorInfo;
        negative?: IColorInfo;
        separator?: IColorInfo;
        selection?: IColorInfo;
        dataColors: IDataColorPalette;
    }
    interface IDataColorPalette {
        /** Gets the color scale associated with the given key. */
        getColorScaleByKey(scaleKey: string): IColorScale;
        /** Gets a fresh color scale with no colors allocated. */
        getNewColorScale(): IColorScale;
        /** Gets the nth color in the palette. */
        getColorByIndex(index: number): IColorInfo;
        /**
         * Gets the set of sentiment colors used for visuals such as KPIs
         * Note: This is only a temporary API so that we can have reasonable color schemes for KPIs
         * and gauges until the conditional formatting feature is implemented.
         */
        getSentimentColors(): IColorInfo[];
        getBasePickerColors(): IColorInfo[];
        /** Gets all the colors for the color palette **/
        getAllColors?(): IColorInfo[];
    }
    interface IColorScale {
        /** Gets the color associated with the given key. */
        getColor(key: any): IColorInfo;
        /**
         * Clears the current scale, but rotates the colors such that the first color allocated will
         * the be first color that would have been allocated before clearing the scale.
         */
        clearAndRotateScale(): void;
        /** Returns a copy of the current scale. */
        clone(): IColorScale;
        getDomain(): any[];
    }
    interface IColorInfo extends IStyleInfo {
        value: string;
    }
    interface IStyleInfo {
        className?: string;
    }
}