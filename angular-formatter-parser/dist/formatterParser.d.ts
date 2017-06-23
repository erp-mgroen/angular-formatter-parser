import { IFormatterParserFn } from './struct/formatter-parser-function';
export declare class FormatterParser {
    static toCapitalized: IFormatterParserFn;
    static toUpperCase: IFormatterParserFn;
    static toLowerCase: IFormatterParserFn;
    static replaceString(searchValue: RegExp, replaceValue: string): IFormatterParserFn;
}
