import { ElementRef, OnInit } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl } from '@angular/forms';
import { FormatterParserService } from './formatter-parser.service';
import { IFormatterParserConfig } from './struct/formatter-parser-config';
export declare class FormatterParserDirective implements ControlValueAccessor, OnInit {
    private _elementRef;
    private fps;
    private fcd;
    config: IFormatterParserConfig;
    formControlName: string;
    protected formControl: FormControl;
    protected inputElement: HTMLInputElement;
    private formatterParserView;
    private formatterParserModel;
    private onTouch;
    private onModelChange;
    constructor(_elementRef: ElementRef, fps: FormatterParserService, fcd: ControlContainer);
    registerOnTouched(fn: any): void;
    registerOnChange(fn: any): void;
    ngOnInit(): void;
    onControlInput($event: KeyboardEvent): void;
    writeValue(rawValue: any): void;
    updateFormatterAndParser(): void;
    private getInputElementRef();
}
