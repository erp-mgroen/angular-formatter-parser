import { Directive, ElementRef, Host, HostListener, Inject, Injectable, InjectionToken, Input, NgModule, Optional, SkipSelf, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

var FORMATTER_PARSER = new InjectionToken('formatterParser');

var FormatterParser = (function () {
    function FormatterParser() {
    }
    /**
     * @param {?} searchValue
     * @param {?} replaceValue
     * @return {?}
     */
    FormatterParser.replaceString = function (searchValue, replaceValue) {
        return function (value) {
            var /** @type {?} */ transformedValue = value;
            if (typeof transformedValue === 'string' || transformedValue instanceof String) {
                transformedValue = transformedValue.replace(searchValue, replaceValue);
            }
            var /** @type {?} */ result = {
                name: 'replaceString',
                result: transformedValue,
                previous: value
            };
            return result;
        };
    };
    return FormatterParser;
}());
FormatterParser.toCapitalized = function (value) {
    var /** @type {?} */ transformedValue = value;
    if (typeof value === 'string' || value instanceof String) {
        transformedValue = transformedValue
            .toLowerCase()
            .split(' ')
            .map(function (val) { return val.charAt(0).toUpperCase() + val.slice(1); })
            .join(' ');
    }
    return {
        name: 'toCapitalized',
        result: transformedValue,
        previous: value
    };
};
FormatterParser.toUpperCase = function (value) {
    var /** @type {?} */ transformedValue = value;
    if (typeof value === 'string' || value instanceof String) {
        transformedValue = value.toUpperCase();
    }
    return {
        name: 'toUpperCase',
        result: transformedValue,
        previous: value
    };
};
FormatterParser.toLowerCase = function (value) {
    var /** @type {?} */ transformedValue = value;
    if (typeof transformedValue === 'string' || transformedValue instanceof String) {
        transformedValue = transformedValue.toLowerCase();
    }
    return {
        name: 'toLowerCase',
        result: transformedValue,
        previous: value
    };
};

var FormatterParserService = (function () {
    /**
     * @param {?} FORMATTER_PARSER
     */
    function FormatterParserService(FORMATTER_PARSER$$1) {
        this.FORMATTER_PARSER = FORMATTER_PARSER$$1;
    }
    /**
     * @param {?} functionName
     * @param {?=} params
     * @return {?}
     */
    FormatterParserService.prototype.getFormatParseFunction = function (functionName, params) {
        var /** @type {?} */ formatParseFunction;
        if (functionName in FormatterParser) {
            formatParseFunction = FormatterParser[functionName];
        }
        else if (this.FORMATTER_PARSER) {
            formatParseFunction = this.FORMATTER_PARSER.find(function (formParsFunc) {
                return functionName === formParsFunc.name;
            });
        }
        else {
            throw new Error("No function provided via FORMATTER_PARSER. Did you forgot to provide them?");
        }
        if (!(typeof formatParseFunction === 'function')) {
            throw new Error("Formatter or Parser with name " + functionName + " \n                             is not provided as a function via FormatterParser \n                             service or FORMATTER_PARSER InjectionToken.");
        }
        return (params) ? formatParseFunction.apply(void 0, params) : formatParseFunction;
    };
    return FormatterParserService;
}());
FormatterParserService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
FormatterParserService.ctorParameters = function () { return [
    { type: Array, decorators: [{ type: Optional }, { type: Inject, args: [FORMATTER_PARSER,] },] },
]; };

var CONTROL_VALUE_ACCESSOR = {
    name: 'formatterParserValueAccessor',
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return FormatterParserDirective; }),
    multi: true
};
var FormatterParserDirective = (function () {
    /**
     * @param {?} _elementRef
     * @param {?} fps
     * @param {?} fcd
     */
    function FormatterParserDirective(_elementRef, fps, fcd) {
        this._elementRef = _elementRef;
        this.fps = fps;
        this.fcd = fcd;
        this.formatterParserView = [];
        this.formatterParserModel = [];
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    FormatterParserDirective.prototype.registerOnTouched = function (fn) {
        this.onTouch = fn;
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    FormatterParserDirective.prototype.registerOnChange = function (fn) {
        this.onModelChange = fn;
    };
    /**
     * @return {?}
     */
    FormatterParserDirective.prototype.ngOnInit = function () {
        this.formControl = ((this.fcd)).form.controls[this.formControlName];
        this.inputElement = this.getInputElementRef();
        this.updateFormatterAndParser();
    };
    /**
     * @param {?} $event
     * @return {?}
     */
    FormatterParserDirective.prototype.onControlInput = function ($event) {
        var /** @type {?} */ rawValue = this.inputElement.value;
        // If there is a reactive FormControl present trigger onTouch
        if (this.onTouch) {
            this.onTouch();
        }
        // write value to view (visible text of the form control)
        this.inputElement.value = this.formatterParserView
            .reduce(function (state, transform) { return transform(state).result; }, rawValue || null);
        // write value to model (value stored in FormControl)
        var /** @type {?} */ modelValue = this.formatterParserModel
            .reduce(function (state, transform) { return transform(state).result; }, rawValue || null);
        // If there is a reactive formControl present update its model
        if (this.onModelChange) {
            this.onModelChange(modelValue);
        }
    };
    /**
     * @param {?} rawValue
     * @return {?}
     */
    FormatterParserDirective.prototype.writeValue = function (rawValue) {
        // write value to view (visible text of the form control)
        this.inputElement.value = this.formatterParserView
            .reduce(function (state, transform) { return transform(state).result; }, rawValue);
        // write value to model (value stored in FormControl)
        var /** @type {?} */ modelValue = this.formatterParserModel
            .reduce(function (state, transform) { return transform(state).result; }, rawValue);
        // prevent cyclic function calls
        if (rawValue !== modelValue) {
            // If there is a reactive FormControl present update its model
            if (this.onModelChange) {
                // @TODO consider other way to call patchValue
                this.formControl.patchValue(modelValue);
            }
        }
    };
    /**
     * @return {?}
     */
    FormatterParserDirective.prototype.updateFormatterAndParser = function () {
        var _this = this;
        this.formatterParserView = [];
        this.formatterParserModel = [];
        if (!this.config) {
            return;
        }
        if ('formatterParser' in this.config) {
            // setup formatterParser functions for view and model values
            this.config.formatterParser
                .forEach(function (formatterConfig) {
                var /** @type {?} */ targetBoth = 2;
                var /** @type {?} */ fPF = _this.fps.getFormatParseFunction(formatterConfig.name, formatterConfig.params);
                var /** @type {?} */ t = (formatterConfig.target === undefined) ? targetBoth : formatterConfig.target;
                if (t === 1 || t === 2) {
                    _this.formatterParserModel.push(fPF);
                }
                if ((t === 0 || t === 2)) {
                    _this.formatterParserView.push(fPF);
                }
            });
        }
    };
    /**
     * @return {?}
     */
    FormatterParserDirective.prototype.getInputElementRef = function () {
        var /** @type {?} */ input;
        if (this._elementRef.nativeElement.tagName === 'INPUT') {
            // `textMask` directive is used directly on an input element
            input = this._elementRef.nativeElement;
        }
        else {
            // `textMask` directive is used on an abstracted input element, `ion-input`, `md-input`, etc
            input = this._elementRef.nativeElement.getElementsByTagName('INPUT')[0];
        }
        if (!input) {
            throw new Error('You can applied the "formatterParser" directive only on inputs or elements containing inputs');
        }
        return input;
    };
    return FormatterParserDirective;
}());
FormatterParserDirective.decorators = [
    { type: Directive, args: [{
                selector: '[formatterParser]',
                providers: [
                    CONTROL_VALUE_ACCESSOR
                ]
            },] },
];
/**
 * @nocollapse
 */
FormatterParserDirective.ctorParameters = function () { return [
    { type: ElementRef, },
    { type: FormatterParserService, },
    { type: ControlContainer, decorators: [{ type: Optional }, { type: Host }, { type: SkipSelf },] },
]; };
FormatterParserDirective.propDecorators = {
    'config': [{ type: Input, args: ['formatterParser',] },],
    'formControlName': [{ type: Input },],
    'onControlInput': [{ type: HostListener, args: ['input', ['$event'],] },],
};

var FormatterParserModule = (function () {
    function FormatterParserModule() {
    }
    /**
     * @return {?}
     */
    FormatterParserModule.forRoot = function () {
        return {
            ngModule: FormatterParserModule,
            providers: [
                FormatterParserService,
                { provide: FormatterParser, useClass: FormatterParser }
            ]
        };
    };
    return FormatterParserModule;
}());
FormatterParserModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    ReactiveFormsModule
                ],
                declarations: [FormatterParserDirective],
                exports: [FormatterParserDirective, ReactiveFormsModule]
            },] },
];
/**
 * @nocollapse
 */
FormatterParserModule.ctorParameters = function () { return []; };

export { FormatterParserModule, FormatterParserDirective, FormatterParserService, FormatterParser, FORMATTER_PARSER };
