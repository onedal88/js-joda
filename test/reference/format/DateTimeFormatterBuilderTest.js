/**
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import {expect} from 'chai';
import {assertEquals, dataProviderTest} from '../../testUtils';

import '../../_init';

import {ChronoField} from '../../../src/temporal/ChronoField';
import {DateTimeFormatterBuilder} from '../../../src/format/DateTimeFormatterBuilder';
import {IllegalArgumentException, IllegalStateException, NullPointerException} from '../../../src/errors';
import {ParsePosition} from '../../../src/format/ParsePosition';
import {SignStyle} from '../../../src/format/SignStyle';

const DAY_OF_MONTH = ChronoField.DAY_OF_MONTH;

describe('org.threeten.bp.format.TestDateTimeFormatterBuilder',() => {
    var builder = null;

    beforeEach(() => {
        builder = new DateTimeFormatterBuilder();
    });
    
    describe('toFormatter', () => {
        it('test_toFormatter_empty', () => {
            var f = builder.toFormatter();
            assertEquals(f.toString(), '');
        });
    });
    
    describe('parse', () => {
        it('test_parseCaseSensitive', () => {
            builder.parseCaseSensitive();
            var f = builder.toFormatter();
            assertEquals(f.toString(), 'ParseCaseSensitive(true)');
        });
        
        it('test_parseCaseInsensitive', () => {
            builder.parseCaseInsensitive();
            var f = builder.toFormatter();
            assertEquals(f.toString(), 'ParseCaseSensitive(false)');
        });
        
        it('test_parseStrict', () => {
            builder.parseStrict();
            var f = builder.toFormatter();
            assertEquals(f.toString(), 'ParseStrict(true)');
        });
        
        it('test_parseLenient', () => {
            builder.parseLenient();
            var f = builder.toFormatter();
            assertEquals(f.toString(), 'ParseStrict(false)');
        });
    });
    
    describe('appendValue', () => {
        it('test_appendValue_1arg', () => {
            builder.appendValue(DAY_OF_MONTH);
            var f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(DayOfMonth)');
        });
        
        it('test_appendValue_1arg_null', () => {
            expect(() => {
                builder.appendValue(null);
            }).to.throw(Error);
        });
        
        it('test_appendValue_2arg', () => {
            builder.appendValue(DAY_OF_MONTH, 3);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(DayOfMonth,3)');
        });
        
        it('test_appendValue_2arg_null', () => {
            expect(() => {
                builder.appendValue(null, 3);
            }).to.throw(NullPointerException);
        });
        
        it('test_appendValue_2arg_widthTooSmall', () => {
            expect(() => {
                builder.appendValue(DAY_OF_MONTH, 0);
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_appendValue_2arg_widthTooBig', () => {
            expect(() => {
                builder.appendValue(DAY_OF_MONTH, 20);
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_appendValue_3arg', () => {
            builder.appendValue(DAY_OF_MONTH, 2, 3, SignStyle.NORMAL);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(DayOfMonth,2,3,NORMAL)');
        });
        
        it('test_appendValue_3arg_nullField', () => {
            expect(() => {
                builder.appendValue(null, 2, 3, SignStyle.NORMAL);
            }).to.throw(NullPointerException);
        });
        
        it('test_appendValue_3arg_minWidthTooSmall', () => {
            expect(() => {
                builder.appendValue(DAY_OF_MONTH, 0, 2, SignStyle.NORMAL);
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_appendValue_3arg_minWidthTooBig', () => {
            expect(() => {
                builder.appendValue(DAY_OF_MONTH, 20, 2, SignStyle.NORMAL);
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_appendValue_3arg_maxWidthTooSmall', () => {
            expect(() => {
                builder.appendValue(DAY_OF_MONTH, 2, 0, SignStyle.NORMAL);
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_appendValue_3arg_maxWidthTooBig', () => {
            expect(() => {
                builder.appendValue(DAY_OF_MONTH, 2, 20, SignStyle.NORMAL);
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_appendValue_3arg_maxWidthMinWidth', () => {
            expect(() => {
                builder.appendValue(DAY_OF_MONTH, 4, 2, SignStyle.NORMAL);
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_appendValue_3arg_nullSignStyle', () => {
            expect(() => {
                builder.appendValue(DAY_OF_MONTH, 2, 3, null);
            }).to.throw(NullPointerException);
        });
    });
    
    describe('appendValue_subsequent_parse', () => {
        it('test_appendValue_subsequent2_parse3', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR, 1, 2, SignStyle.NORMAL).appendValue(DAY_OF_MONTH, 2);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear,1,2,NORMAL)Value(DayOfMonth,2)');
            let cal = f.parseUnresolved('123', new ParsePosition(0));
            assertEquals(cal.get(ChronoField.MONTH_OF_YEAR), 1);
            assertEquals(cal.get(ChronoField.DAY_OF_MONTH), 23);
        });
        
        it('test_appendValue_subsequent2_parse4', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR, 1, 2, SignStyle.NORMAL).appendValue(DAY_OF_MONTH, 2);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear,1,2,NORMAL)Value(DayOfMonth,2)');
            let cal = f.parseUnresolved('0123', new ParsePosition(0));
            assertEquals(cal.get(ChronoField.MONTH_OF_YEAR), 1);
            assertEquals(cal.get(ChronoField.DAY_OF_MONTH), 23);
        });
        
        it('test_appendValue_subsequent2_parse5', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR, 1, 2, SignStyle.NORMAL).appendValue(DAY_OF_MONTH, 2).appendLiteral('4');
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear,1,2,NORMAL)Value(DayOfMonth,2)\'4\'');
            let cal = f.parseUnresolved('01234', new ParsePosition(0));
            assertEquals(cal.get(ChronoField.MONTH_OF_YEAR), 1);
            assertEquals(cal.get(ChronoField.DAY_OF_MONTH), 23);
        });
        
        it('test_appendValue_subsequent3_parse6', () => {
            builder
                .appendValue(ChronoField.YEAR, 4, 10, SignStyle.EXCEEDS_PAD)
                .appendValue(ChronoField.MONTH_OF_YEAR, 2)
                .appendValue(ChronoField.DAY_OF_MONTH, 2);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(Year,4,10,EXCEEDS_PAD)Value(MonthOfYear,2)Value(DayOfMonth,2)');
            let cal = f.parseUnresolved('20090630', new ParsePosition(0));
            assertEquals(cal.get(ChronoField.YEAR), 2009);
            assertEquals(cal.get(ChronoField.MONTH_OF_YEAR), 6);
            assertEquals(cal.get(ChronoField.DAY_OF_MONTH), 30);
        });
        
        it('test_appendValue_subsequent2_parse3', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR, 1, 2, SignStyle.NORMAL).appendValue(ChronoField.DAY_OF_MONTH, 2);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear,1,2,NORMAL)Value(DayOfMonth,2)');
            let cal = f.parseUnresolved('123', new ParsePosition(0));
            assertEquals(cal.get(ChronoField.MONTH_OF_YEAR), 1);
            assertEquals(cal.get(ChronoField.DAY_OF_MONTH), 23);
        });
        
        it('test_appendValue_subsequent2_parse4', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR, 1, 2, SignStyle.NORMAL).appendValue(ChronoField.DAY_OF_MONTH, 2);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear,1,2,NORMAL)Value(DayOfMonth,2)');
            let cal = f.parseUnresolved('0123', new ParsePosition(0));
            assertEquals(cal.get(ChronoField.MONTH_OF_YEAR), 1);
            assertEquals(cal.get(ChronoField.DAY_OF_MONTH), 23);
        });
        
        it('test_appendValue_subsequent2_parse5', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR, 1, 2, SignStyle.NORMAL).appendValue(ChronoField.DAY_OF_MONTH, 2).appendLiteral('4');
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear,1,2,NORMAL)Value(DayOfMonth,2)\'4\'');
            let cal = f.parseUnresolved('01234', new ParsePosition(0));
            assertEquals(cal.get(ChronoField.MONTH_OF_YEAR), 1);
            assertEquals(cal.get(ChronoField.DAY_OF_MONTH), 23);
        });
        
        it('test_appendValue_subsequent3_parse6', () => {
            builder
                .appendValue(ChronoField.YEAR, 4, 10, SignStyle.EXCEEDS_PAD)
                .appendValue(ChronoField.MONTH_OF_YEAR, 2)
                .appendValue(ChronoField.DAY_OF_MONTH, 2);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(Year,4,10,EXCEEDS_PAD)Value(MonthOfYear,2)Value(DayOfMonth,2)');
            let cal = f.parseUnresolved('20090630', new ParsePosition(0));
            assertEquals(cal.get(ChronoField.YEAR), 2009);
            assertEquals(cal.get(ChronoField.MONTH_OF_YEAR), 6);
            assertEquals(cal.get(ChronoField.DAY_OF_MONTH), 30);
        });
    });
    
    describe('appendValueReduced', () => {
        it('test_appendValueReduced_null', () => {
            expect(() => {
                builder.appendValueReduced(null, 2, 2, 2000);
            }).to.throw(NullPointerException);
        });
        
        
        it('test_appendValueReduced', () => {
            builder.appendValueReduced(ChronoField.YEAR, 2, 2, 2000);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'ReducedValue(Year,2,2,2000)');
            let cal = f.parseUnresolved('12', new ParsePosition(0));
            assertEquals(cal.get(ChronoField.YEAR), 2012);
        });
        
        it('test_appendValueReduced_subsequent_parse', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR, 1, 2, SignStyle.NORMAL).appendValueReduced(ChronoField.YEAR, 2, 2, 2000);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear,1,2,NORMAL)ReducedValue(Year,2,2,2000)');
            let cal = f.parseUnresolved('123', new ParsePosition(0));
            assertEquals(cal.get(ChronoField.MONTH_OF_YEAR), 1);
            assertEquals(cal.get(ChronoField.YEAR), 2023);
        });
        
    });
    
    describe('appendPattern', () => {
        let dataValid = [
            ["'a'", "'a'"],
            ["''", "''"],
            ["'!'", "'!'"],
            ['!', "'!'"],

            ["'hello_people,][)('", "'hello_people,][)('"],
            ["'hi'", "'hi'"],
            ["'yyyy'", "'yyyy'"],
            ["''''", "''"],
            ["'o''clock'", "'o''clock'"],

            /* TODO: text patterns not implemented yet
            ['G', 'Text(Era,SHORT)'],
            ['GG', 'Text(Era,SHORT)'],
            ['GGG', 'Text(Era,SHORT)'],
            ['GGGG', 'Text(Era)'],
            ['GGGGG', 'Text(Era,NARROW)'],
            */
            
            ['u', 'Value(Year)'],
            ['uu', 'ReducedValue(Year,2,2,2000-01-01)'],
            ['uuu', 'Value(Year,3,15,NORMAL)'], // was ...,19,... in threeten, but we have lower MAX_WIDTH for number parsing
            ['uuuu', 'Value(Year,4,15,EXCEEDS_PAD)'], // was ...,19,... in threeten, but we have lower MAX_WIDTH for number parsing 
            ['uuuuu', 'Value(Year,5,15,EXCEEDS_PAD)'], // was ...,19,... in threeten, but we have lower MAX_WIDTH for number parsing

            ['y', 'Value(YearOfEra)'],
            ['yy', 'ReducedValue(YearOfEra,2,2,2000-01-01)'],
            ['yyy', 'Value(YearOfEra,3,15,NORMAL)'], // was ...,19,... in threeten, but we have lower MAX_WIDTH for number parsing
            ['yyyy', 'Value(YearOfEra,4,15,EXCEEDS_PAD)'], // was ...,19,... in threeten, but we have lower MAX_WIDTH for number parsing
            ['yyyyy', 'Value(YearOfEra,5,15,EXCEEDS_PAD)'], // was ...,19,... in threeten, but we have lower MAX_WIDTH for number parsing

//            ['Y', 'Value(WeekBasedYear)'],
//            ['YY', 'ReducedValue(WeekBasedYear,2,2000)'],
//            ['YYY', 'Value(WeekBasedYear,3,19,NORMAL)'],
//            ['YYYY', 'Value(WeekBasedYear,4,19,EXCEEDS_PAD)'],
//            ['YYYYY', 'Value(WeekBasedYear,5,19,EXCEEDS_PAD)'],

            ['M', 'Value(MonthOfYear)'],
            ['MM', 'Value(MonthOfYear,2)'],
            /* TODO: text patterns not implemented yet
            ['MMM', 'Text(MonthOfYear,SHORT)'],
            ['MMMM', 'Text(MonthOfYear)'],
            ['MMMMM', 'Text(MonthOfYear,NARROW)'],
            */

//            ['w', 'Value(WeekOfWeekBasedYear)'],
//            ['ww', 'Value(WeekOfWeekBasedYear,2)'],
//            ['www', 'Value(WeekOfWeekBasedYear,3)'],

            ['D', 'Value(DayOfYear)'],
            ['DD', 'Value(DayOfYear,2)'],
            ['DDD', 'Value(DayOfYear,3)'],

            ['d', 'Value(DayOfMonth)'],
            ['dd', 'Value(DayOfMonth,2)'],

            ['F', 'Value(AlignedDayOfWeekInMonth)'],

            /* TODO: text patterns not implemented yet
            ['E', 'Text(DayOfWeek,SHORT)'],
            ['EE', 'Text(DayOfWeek,SHORT)'],
            ['EEE', 'Text(DayOfWeek,SHORT)'],
            ['EEEE', 'Text(DayOfWeek)'],
            ['EEEEE', 'Text(DayOfWeek,NARROW)'],

            ['a', 'Text(AmPmOfDay,SHORT)'],
            */
            
            ['H', 'Value(HourOfDay)'],
            ['HH', 'Value(HourOfDay,2)'],

            ['K', 'Value(HourOfAmPm)'],
            ['KK', 'Value(HourOfAmPm,2)'],

            ['k', 'Value(ClockHourOfDay)'],
            ['kk', 'Value(ClockHourOfDay,2)'],

            ['h', 'Value(ClockHourOfAmPm)'],
            ['hh', 'Value(ClockHourOfAmPm,2)'],

            ['m', 'Value(MinuteOfHour)'],
            ['mm', 'Value(MinuteOfHour,2)'],

            ['s', 'Value(SecondOfMinute)'],
            ['ss', 'Value(SecondOfMinute,2)'],

            ['S', 'Fraction(NanoOfSecond,1,1)'],
            ['SS', 'Fraction(NanoOfSecond,2,2)'],
            ['SSS', 'Fraction(NanoOfSecond,3,3)'],
            ['SSSSSSSSS', 'Fraction(NanoOfSecond,9,9)'],

            ['A', 'Value(MilliOfDay)'],
            ['AA', 'Value(MilliOfDay,2)'],
            ['AAA', 'Value(MilliOfDay,3)'],
    
            ['L', 'Value(MonthOfYear)'],

            ['n', 'Value(NanoOfSecond)'],
            ['nn', 'Value(NanoOfSecond,2)'],
            ['nnn', 'Value(NanoOfSecond,3)'],

            ['N', 'Value(NanoOfDay)'],
            ['NN', 'Value(NanoOfDay,2)'],
            ['NNN', 'Value(NanoOfDay,3)'],

            /* TODO: text patterns not implemented yet
            ['z', 'ZoneText(SHORT)'],
            ['zz', 'ZoneText(SHORT)'],
            ['zzz', 'ZoneText(SHORT)'],
            ['zzzz', 'ZoneText(FULL)'],
            */

            ['VV', 'ZoneId()'],
    
            ['Z', "Offset(+HHMM,'+0000')"],  // SimpleDateFormat compatible
            ['ZZ', "Offset(+HHMM,'+0000')"],
            ['ZZZ', "Offset(+HHMM,'+0000')"],
            ['ZZZZZ', "Offset(+HH:MM:ss,'Z')"],

            ['X', "Offset(+HHmm,'Z')"],
            ['XX', "Offset(+HHMM,'Z')"],
            ['XXX', "Offset(+HH:MM,'Z')"],
            ['XXXX', "Offset(+HHMMss,'Z')"],
            ['XXXXX', "Offset(+HH:MM:ss,'Z')"],

            ['x', "Offset(+HHmm,'+00')"],
            ['xx', "Offset(+HHMM,'+0000')"],
            ['xxx', "Offset(+HH:MM,'+00:00')"],
            ['xxxx', "Offset(+HHMMss,'+0000')"],
            ['xxxxx', "Offset(+HH:MM:ss,'+00:00')"],

            ['ppH', 'Pad(Value(HourOfDay),2)'],
            ['ppm', 'Pad(Value(MinuteOfHour),2)'],
            ['pppDD', 'Pad(Value(DayOfYear,2),3)'],

            ['q', 'Value(QuarterOfYear)'],
            ['qq', 'Value(QuarterOfYear,2)'],

            ['uuuu[-MM[-dd', "Value(Year,4,15,EXCEEDS_PAD)['-'Value(MonthOfYear,2)['-'Value(DayOfMonth,2)]]"], // was ...,19,... in threeten, but we have lower MAX_WIDTH for number parsing
            ['uuuu[-MM[-dd]]', "Value(Year,4,15,EXCEEDS_PAD)['-'Value(MonthOfYear,2)['-'Value(DayOfMonth,2)]]"], // was ...,19,... in threeten, but we have lower MAX_WIDTH for number parsing
            ['uuuu[-MM[]-dd]', "Value(Year,4,15,EXCEEDS_PAD)['-'Value(MonthOfYear,2)'-'Value(DayOfMonth,2)]"], // was ...,19,... in threeten, but we have lower MAX_WIDTH for number parsing

            ["uuuu-MM-dd'T'HH:mm:ss.SSS", "Value(Year,4,15,EXCEEDS_PAD)'-'Value(MonthOfYear,2)'-'Value(DayOfMonth,2)" +
            "'T'Value(HourOfDay,2)':'Value(MinuteOfHour,2)':'Value(SecondOfMinute,2)'.'Fraction(NanoOfSecond,3,3)"] // was ...,19,... in threeten, but we have lower MAX_WIDTH for number parsing
        ];

        it('test_appendPattern_valid', () => {
            dataProviderTest(dataValid, (input, expected) => {
                // since we are forEach ing dataValid, the beforeEach doesn't catch... so we create the builder here
                builder = new DateTimeFormatterBuilder();
                builder.appendPattern(input);
                let f = builder.toFormatter();
                assertEquals(f.toString(), expected);
            });
        });

        //-----------------------------------------------------------------------
        let dataInvalid = [
            ["'"],
            ["'hello"],
            ["'hel''lo"],
            ["'hello''"],
            [']'],
            ['{'],
            ['}'],
            ['#'],

            ['yyyy]'],
            ['yyyy]MM'],
            ['yyyy[MM]]'],

            ['MMMMMM'],
            ['QQQQQQ'],
            ['cccccc'],
            ['DDDD'],
            ['eeeeee'],
            ['EEEEEE'],
            ['aaaaaa'],
            ['VVV'],
            ['W'],
            ['WW'],
            ['XXXXXX'],
            ['xxxxxx'],
            ['zzzzzz'],
            ['ZZZZZZ'],

            ['RO'],

            ['p'],
            ['pp'],
            ['p:'],
            
            ['qqqqqq'],

            ['f'],
            ['ff'],
            ['f:'],
            ['fy'],
            ['fa'],
            ['fM'],

            ['ddd'],
            ['FF'],
            ['FFF'],
            ['aa'],
            ['aaa'],
            ['aaaa'],
            ['aaaaa'],
            ['HHH'],
            ['KKK'],
            ['kkk'],
            ['hhh'],
            ['mmm'],
            ['OO'],
            ['OOO'],
            ['OOOOO'],
            ['sss']
        ];

        it('test_appendPattern_invalid', () => {
            dataProviderTest(dataInvalid, (input) => {
                // since we are forEach ing dataInvalid, the beforeEach doesn't catch... so we create the builder here
                builder = new DateTimeFormatterBuilder();
                expect(() => {
                    builder.appendPattern(input);
                }).to.throw(IllegalArgumentException);
            });
        });
    });
    
    describe('appendFraction', () => {
        it('test_appendFraction_4arg', () => {
            builder.appendFraction(ChronoField.MINUTE_OF_HOUR, 1, 9, false);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Fraction(MinuteOfHour,1,9)');
        });
        
        it('test_appendFraction_4arg_nullRule', () => {
            expect(() => {
                builder.appendFraction(null, 1, 9, false);
            }).to.throw(NullPointerException);
        });
        
        it('test_appendFraction_4arg_invalidRuleNotFixedSet', () => {
            expect(() => {
                builder.appendFraction(ChronoField.DAY_OF_MONTH, 1, 9, false);
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_appendFraction_4arg_minTooSmall', () => {
            expect(() => {
                builder.appendFraction(ChronoField.MINUTE_OF_HOUR, -1, 9, false);
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_appendFraction_4arg_minTooBig', () => {
            expect(() => {
                builder.appendFraction(ChronoField.MINUTE_OF_HOUR, 10, 9, false);
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_appendFraction_4arg_maxTooSmall', () => {
            expect(() => {
                builder.appendFraction(ChronoField.MINUTE_OF_HOUR, 0, -1, false);
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_appendFraction_4arg_maxTooBig', () => {
            expect(() => {
                builder.appendFraction(ChronoField.MINUTE_OF_HOUR, 1, 10, false);
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_appendFraction_4arg_maxWidthMinWidth', () => {
            expect(() => {
                builder.appendFraction(ChronoField.MINUTE_OF_HOUR, 9, 3, false);
            }).to.throw(IllegalArgumentException);
        });
    });
    
    describe('appendOffset', () => {
        it('test_appendOffsetId', () => {
            builder.appendOffsetId();
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Offset(+HH:MM:ss,\'Z\')');
        });
        
        let data_offsetPatterns = [
            ['+HH'],
            ['+HHMM'],
            ['+HH:MM'],
            ['+HHMMss'],
            ['+HH:MM:ss'],
            ['+HHMMSS'],
            ['+HH:MM:SS'],
        ];
        
        it('test_appendOffset', () => {
            dataProviderTest(data_offsetPatterns, (pattern) => {
                builder = new DateTimeFormatterBuilder();
                builder.appendOffset(pattern, 'Z');
                let f = builder.toFormatter();
                assertEquals(f.toString(), 'Offset(' + pattern + ',\'Z\')');
            });
        });
        
        let data_badOffsetPatterns = [
            ['HH'],
            ['HHMM'],
            ['HH:MM'],
            ['HHMMss'],
            ['HH:MM:ss'],
            ['HHMMSS'],
            ['HH:MM:SS'],
            ['+H'],
            ['+HMM'],
            ['+HHM'],
            ['+A'],
        ];
        
        it('test_appendOffset_badPattern', () => {
            dataProviderTest(data_badOffsetPatterns, (pattern) => {
                expect(() => {
                    let builder = new DateTimeFormatterBuilder();
                    builder.appendOffset(pattern, 'Z');
                }).to.throw(IllegalArgumentException);
            });
        });
        
        it('test_appendOffset_3arg_nullText', () => {
            expect(() => {
                builder.appendOffset('+HH:MM', null);
            }).to.throw(NullPointerException);
        });
        
        it('test_appendOffset_3arg_nullPattern', () => {
            expect(() => {
                builder.appendOffset(null, 'Z');
            }).to.throw(NullPointerException);
        });
    });
    
    describe('padNext', () => {
        it('test_padNext_1arg', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR).padNext(2).appendValue(ChronoField.DAY_OF_MONTH).appendValue(ChronoField.DAY_OF_WEEK);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear)Pad(Value(DayOfMonth),2)Value(DayOfWeek)');
        });
        
        it('test_padNext_1arg_invalidWidth', () => {
            expect(() => {
                builder.padNext(0);
            }).to.throw(IllegalArgumentException);
        });
        
        //-----------------------------------------------------------------------
        it('test_padNext_2arg_dash', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR).padNext(2, '-').appendValue(ChronoField.DAY_OF_MONTH).appendValue(ChronoField.DAY_OF_WEEK);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear)Pad(Value(DayOfMonth),2,\'-\')Value(DayOfWeek)');
        });
        
        it('test_padNext_2arg_invalidWidth', () => {
            expect(() => {
                builder.padNext(0, '-');
            }).to.throw(IllegalArgumentException);
        });
        
        it('test_padOptional', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR).padNext(5).optionalStart().appendValue(ChronoField.DAY_OF_MONTH).optionalEnd().appendValue(ChronoField.DAY_OF_WEEK);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear)Pad([Value(DayOfMonth)],5)Value(DayOfWeek)');
        });
    });
    
    describe('optionalStartEnd', () => {
        it('test_optionalStart_noEnd', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR).optionalStart().appendValue(ChronoField.DAY_OF_MONTH).appendValue(ChronoField.DAY_OF_WEEK);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear)[Value(DayOfMonth)Value(DayOfWeek)]');
        });
        
        it('test_optionalStart2_noEnd', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR).optionalStart().appendValue(ChronoField.DAY_OF_MONTH).optionalStart().appendValue(ChronoField.DAY_OF_WEEK);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear)[Value(DayOfMonth)[Value(DayOfWeek)]]');
        });
        
        it('test_optionalStart_doubleStart', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR).optionalStart().optionalStart().appendValue(ChronoField.DAY_OF_MONTH);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear)[[Value(DayOfMonth)]]');
        });

    //-----------------------------------------------------------------------
        it('test_optionalEnd', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR).optionalStart().appendValue(ChronoField.DAY_OF_MONTH).optionalEnd().appendValue(ChronoField.DAY_OF_WEEK);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear)[Value(DayOfMonth)]Value(DayOfWeek)');
        });
        
        it('test_optionalEnd2', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR).optionalStart().appendValue(ChronoField.DAY_OF_MONTH)
                .optionalStart().appendValue(ChronoField.DAY_OF_WEEK).optionalEnd().appendValue(ChronoField.DAY_OF_MONTH).optionalEnd();
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear)[Value(DayOfMonth)[Value(DayOfWeek)]Value(DayOfMonth)]');
        });
        
        it('test_optionalEnd_doubleStartSingleEnd', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR).optionalStart().optionalStart().appendValue(ChronoField.DAY_OF_MONTH).optionalEnd();
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear)[[Value(DayOfMonth)]]');
        });
        
        it('test_optionalEnd_doubleStartDoubleEnd', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR).optionalStart().optionalStart().appendValue(ChronoField.DAY_OF_MONTH).optionalEnd().optionalEnd();
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear)[[Value(DayOfMonth)]]');
        });
        
        it('test_optionalStartEnd_immediateStartEnd', () => {
            builder.appendValue(ChronoField.MONTH_OF_YEAR).optionalStart().optionalEnd().appendValue(ChronoField.DAY_OF_MONTH);
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'Value(MonthOfYear)Value(DayOfMonth)');
        });
        
        it('test_optionalEnd_noStart', () => {
            expect(() => {
                builder.optionalEnd();
            }).to.throw(IllegalStateException);
        });
        
    });
    
    describe('appendZone', () => {
        it('test_appendZoneId', () => {
            builder.appendZoneId();
            let f = builder.toFormatter();
            assertEquals(f.toString(), 'ZoneId()');
        });
    });
    
});


/***
 
 public class TestDateTimeFormatterBuilder {



    @Test
    public void test_appendText_1arg() throws Exception {
        builder.appendText(MONTH_OF_YEAR);
        DateTimeFormatter f = builder.toFormatter();
        assertEquals(f.toString(), 'Text(MonthOfYear)');
    }

    @Test(expectedExceptions=NullPointerException.class)
    public void test_appendText_1arg_null() throws Exception {
        builder.appendText(null);
    }

    //-----------------------------------------------------------------------
    @Test
    public void test_appendText_2arg() throws Exception {
        builder.appendText(MONTH_OF_YEAR, TextStyle.SHORT);
        DateTimeFormatter f = builder.toFormatter();
        assertEquals(f.toString(), 'Text(MonthOfYear,SHORT)');
    }

    @Test(expectedExceptions=NullPointerException.class)
    public void test_appendText_2arg_nullRule() throws Exception {
        builder.appendText(null, TextStyle.SHORT);
    }

    @Test(expectedExceptions=NullPointerException.class)
    public void test_appendText_2arg_nullStyle() throws Exception {
        builder.appendText(MONTH_OF_YEAR, (TextStyle) null);
    }

    //-----------------------------------------------------------------------
    @Test
    public void test_appendTextMap() throws Exception {
        Map<Long, String> map = new HashMap<Long, String>();
        map.put(1L, 'JNY');
        map.put(2L, 'FBY');
        map.put(3L, 'MCH');
        map.put(4L, 'APL');
        map.put(5L, 'MAY');
        map.put(6L, 'JUN');
        map.put(7L, 'JLY');
        map.put(8L, 'AGT');
        map.put(9L, 'SPT');
        map.put(10L, 'OBR');
        map.put(11L, 'NVR');
        map.put(12L, 'DBR');
        builder.appendText(MONTH_OF_YEAR, map);
        DateTimeFormatter f = builder.toFormatter();
        assertEquals(f.toString(), 'Text(MonthOfYear)');  // TODO: toString should be different?
    }

    @Test(expectedExceptions=NullPointerException.class)
    public void test_appendTextMap_nullRule() throws Exception {
        builder.appendText(null, new HashMap<Long, String>());
    }

    @Test(expectedExceptions=NullPointerException.class)
    public void test_appendTextMap_nullStyle() throws Exception {
        builder.appendText(MONTH_OF_YEAR, (Map<Long, String>) null);
    }

    //-----------------------------------------------------------------------
    @Test
    public void test_appendZoneText_1arg() throws Exception {
        builder.appendZoneText(TextStyle.FULL);
        DateTimeFormatter f = builder.toFormatter();
        assertEquals(f.toString(), 'ZoneText(FULL)');
    }

    @Test(expectedExceptions=NullPointerException.class)
    public void test_appendZoneText_1arg_nullText() throws Exception {
        builder.appendZoneText(null);
    }

    //-----------------------------------------------------------------------

}
 *
 */