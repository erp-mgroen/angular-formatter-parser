import {inject, TestBed} from '@angular/core/testing'
import {FormatterParser} from './formatter-parser'
import {IFormatterParserResult} from './struct/formatter-parser-result'
import {IConformToMaskConfig} from './struct/transform-functions/conform-to-mask-config'

describe('FormatterParser', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be accessible', inject([], () => {
    expect(FormatterParser).toBeTruthy();
  }));

  it('toUpperCase should work', inject([], () => {
    const expectedResult: IFormatterParserResult = {
      name: 'toUpperCase',
      previous: 'abc',
      result: 'ABC'
    };
    expect(FormatterParser.toUpperCase('abc')).toEqual(expectedResult);
  }));

  it('toLowerCase should work', inject([], () => {
    const expectedResult: IFormatterParserResult = {
      name: 'toLowerCase',
      previous: 'ABC',
      result: 'abc'
    };
    expect(FormatterParser.toLowerCase('ABC')).toEqual(expectedResult);
  }));

  it('toCapitalized should work', inject([], () => {
    const expectedResult: IFormatterParserResult = {
      name: 'toCapitalized',
      previous: 'abc abc',
      result: 'Abc Abc'
    };
    expect(FormatterParser.toCapitalized('abc abc')).toEqual(expectedResult);
  }));

  it('replaceString should work', inject([], () => {
    const expectedResult: IFormatterParserResult = {
      name: 'replaceString',
      previous: 'abc',
      result: 'bbc'
    };
    const replaceString = FormatterParser.replaceString(/[a]/, 'b');
    expect(replaceString('abc')).toEqual(expectedResult);
  }));

  it('conformToMask should work', inject([], () => {
    const expectedResult: IFormatterParserResult = {
      name: 'conformToMask',
      previous: 'abc',
      result: 'a*b',
      meta: {
        someCharsRejected: false
      }
    };
    const conformToMask = FormatterParser.conformToMask([/[a]/, '*', /[b]/], {
      guide: true
    });
    expect(conformToMask('abc')).toEqual(expectedResult);
  }));


  describe('conformToMask', () => {

    it('Accepted character in mask', inject([], () => {
      const mask = [/[a]/, '*', /[b]/];
      const config = {
        guide: true,
      };
      const rawValue = 'abc';
      const expectedResult: IFormatterParserResult = {
        name: 'conformToMask',
        previous: rawValue,
        result: 'a*b',
        meta: {
          someCharsRejected: false
        }
      };

      const conformToMask = FormatterParser.conformToMask(mask, config);
      expect(conformToMask(rawValue)).toEqual(expectedResult);
    }));

    it('Dont asccept palceholder characters that exist in mask', inject([], () => {
      const mask = [/[a]/, '*', /[b]/];
      const config: IConformToMaskConfig = {
        guide: true,
        placeholderChar: '*'
      };
      const rawValue = 'abc';
      const expectedResult: IFormatterParserResult = {
        name: 'conformToMask',
        previous: rawValue,
        result: 'a*b',
        meta: {
          someCharsRejected: false
        }
      };

      const conformToMask = FormatterParser.conformToMask(mask, config);
      expect(() => {conformToMask(rawValue)})
        .toThrowError(
          'Placeholder character must not be used as part of the mask. Please specify a character ' +
          'that is not present in your mask as your placeholder character.\n\n' +
          `The placeholder character that was received is: ${JSON.stringify(config.placeholderChar)}\n\n` +
          `The mask that was received is: ${JSON.stringify(mask)}`
        );
    }));

    it('Fill placeholder chars', inject([], () => {
      const mask = [/[a]/, '*', /[b]/];
      const config = {
        guide: false,
        keepCharPositions: true
      };
      const rawValue = 'ab';
      const newRawValue = 'a*';
      const expectedResult: IFormatterParserResult = {
        name: 'conformToMask',
        previous: newRawValue,
        result: 'a',
        meta: {
          someCharsRejected: false
        }
      };

      const conformToMask = FormatterParser.conformToMask(mask, config);
      conformToMask(rawValue);
      expect(conformToMask(newRawValue)).toEqual(expectedResult);
    }));

    it('placeholderLoop should work', inject([], () => {
      const mask = [/[a]/, '*', /[b]/];
      const config = {
        guide: false,
        keepCharPositions: true
      };
      const rawValue = '_';
      const expectedResult: IFormatterParserResult = {
        name: 'conformToMask',
        previous: rawValue,
        result: '',
        meta: {
          someCharsRejected: true
        }
      };

      const conformToMask = FormatterParser.conformToMask(mask, config);
      conformToMask('a')
      expect(conformToMask(rawValue)).toEqual(expectedResult);
    }));


    it('Guide mode tests', inject([], () => {
      const mask = [/[a]/, '*', /[b]/];
      const config = {};
      const rawValue = 'abc';
      const expectedResult: IFormatterParserResult = {
        name: 'conformToMask',
        previous: rawValue,
        result: 'a*b',
        meta: {
          someCharsRejected: false
        }
      };

      const conformToMask = FormatterParser.conformToMask(mask, config);
      expect(conformToMask(rawValue)).toEqual(expectedResult);
    }));

    it('No guide mode', inject([], () => {
      const mask = [/[a]/, '*', /[b]/];
      const config = {
        guide: false,
        previousConformedValue: '',
        currentCaretPosition: 0
      };
      const rawValue = 'abc';
      const expectedResult: IFormatterParserResult = {
        name: 'conformToMask',
        previous: rawValue,
        result: 'a*b',
        meta: {
          someCharsRejected: false
        }
      };

      const conformToMask = FormatterParser.conformToMask(mask, config);
      expect(conformToMask(rawValue)).toEqual(expectedResult);
    }));

    it('Allow escaped masking character in mask', inject([], () => {
      const mask = [/[a]/, '*', /[b]/];
      const config = {
        guide: true,
        previousConformedValue: ''
      };
      const rawValue = 'abc';
      const expectedResult: IFormatterParserResult = {
        name: 'conformToMask',
        previous: rawValue,
        result: 'a*b',
        meta: {
          someCharsRejected: false
        }
      };

      const conformToMask = FormatterParser.conformToMask(mask, config);
      expect(conformToMask(rawValue)).toEqual(expectedResult);
    }));

    it('keepCharPositionsTests', inject([], () => {
      const mask = [/[a]/, '*', /[b]/];
      const config = {
        guide: true,
        previousConformedValue: '',
        currentCaretPosition: 0
      };
      const rawValue = 'abc';
      const expectedResult: IFormatterParserResult = {
        name: 'conformToMask',
        previous: rawValue,
        result: 'a*b',
        meta: {
          someCharsRejected: false
        }
      };

      const conformToMask = FormatterParser.conformToMask(mask, config);
      expect(conformToMask(rawValue)).toEqual(expectedResult);
    }));


    it('keepCharPositions tests', inject([], () => {
      const mask = [/[a]/, '*', /[b]/];
      const config = {
        guide: true,
        keepCharPositions: true
      };
      const rawValue = 'abc';
      const expectedResult: IFormatterParserResult = {
        name: 'conformToMask',
        previous: rawValue,
        result: 'a*b',
        meta: {
          someCharsRejected: false
        }
      };

      const conformToMask = FormatterParser.conformToMask(mask, config);
      expect(conformToMask(rawValue)).toEqual(expectedResult);
    }));

    it('Mask function', inject([], () => {
      const maskFunc = (value) => {
        if (value) {
          return [/[a]/, '*', /[b]/];
        }
        return [/[a]/, '#', /[b]/];
      };
      const config = {
        guide: true
      };
      const rawValue = 'abc';
      const expectedResult: IFormatterParserResult = {
        name: 'conformToMask',
        previous: rawValue,
        result: 'a*b',
        meta: {
          someCharsRejected: false
        }
      };

      const conformToMask = FormatterParser.conformToMask(maskFunc, config);
      expect(conformToMask(rawValue)).toEqual(expectedResult);
    }));

  });

});
