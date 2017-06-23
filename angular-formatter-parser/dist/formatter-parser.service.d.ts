import { IFormatterParserFn } from './struct/formatter-parser-function';
export declare class FormatterParserService {
    private FORMATTER_PARSER;
    constructor(FORMATTER_PARSER: IFormatterParserFn[]);
    getFormatParseFunction(functionName: string, params?: any[]): IFormatterParserFn | undefined;
}
