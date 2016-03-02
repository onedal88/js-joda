/**
 * @copyright (c) 2016, Philipp Thuerwaechter & Pattrick Hueper
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

import {assert, requireNonNull} from '../assert';

import {DateTimeParseException, NullPointerException} from '../errors';

import {Period} from '../Period';

import {ParsePosition} from './ParsePosition';
import {DateTimeBuilder} from './DateTimeBuilder';
import {DateTimeParseContext} from './DateTimeParseContext';
import {DateTimePrintContext} from './DateTimePrintContext';
import {DateTimeFormatterBuilder} from './DateTimeFormatterBuilder';
import {SignStyle} from './SignStyle';
import {StringBuilder} from './StringBuilder';
import {ResolverStyle} from './ResolverStyle';

import {IsoChronology} from '../chrono/IsoChronology';
import {ChronoField} from '../temporal/ChronoField';
import {createTemporalQuery} from '../temporal/TemporalQuery';

/**
 *
 * <h3>Static properties of Class {@link DateTimeFormatter}</h3>
 *
 * DateTimeFormatter.ISO_LOCAL_DATE
 *
 * DateTimeFormatter.ISO_LOCAL_TIME
 *
 * DateTimeFormatter.ISO_LOCAL_DATE_TIME
 *
 */
export class DateTimeFormatter {

    //-----------------------------------------------------------------------
    /**
     * A query that provides access to the excess days that were parsed.
     * <p>
     * This returns a singleton {@linkplain TemporalQuery query} that provides
     * access to additional information from the parse. The query always returns
     * a non-null period, with a zero period returned instead of null.
     * <p>
     * There are two situations where this query may return a non-zero period.
     * <ul>
     * <li>If the {@code ResolverStyle} is {@code LENIENT} and a time is parsed
     *  without a date, then the complete result of the parse consists of a
     *  {@code LocalTime} and an excess {@code Period} in days.
     *
     * <li>If the {@code ResolverStyle} is {@code SMART} and a time is parsed
     *  without a date where the time is 24:00:00, then the complete result of
     *  the parse consists of a {@code LocalTime} of 00:00:00 and an excess
     *  {@code Period} of one day.
     * </ul>
     * <p>
     * In both cases, if a complete {@code ChronoLocalDateTime} or {@code Instant}
     * is parsed, then the excess days are added to the date part.
     * As a result, this query will return a zero period.
     * <p>
     * The {@code SMART} behaviour handles the common "end of day" 24:00 value.
     * Processing in {@code LENIENT} mode also produces the same result:
     * <pre>
     *  Text to parse        Parsed object                         Excess days
     *  "2012-12-03T00:00"   LocalDateTime.of(2012, 12, 3, 0, 0)   ZERO
     *  "2012-12-03T24:00"   LocalDateTime.of(2012, 12, 4, 0, 0)   ZERO
     *  "00:00"              LocalTime.of(0, 0)                    ZERO
     *  "24:00"              LocalTime.of(0, 0)                    Period.ofDays(1)
     * </pre>
     * The query can be used as follows:
     * <pre>
     *  TemporalAccessor parsed = formatter.parse(str);
     *  LocalTime time = parsed.query(LocalTime.FROM);
     *  Period extraDays = parsed.query(DateTimeFormatter.parsedExcessDays());
     * </pre>
     * @return {TemporalQuery} a query that provides access to the excess days that were parsed
     */
    static parsedExcessDays() {
        return DateTimeFormatter.PARSED_EXCESS_DAYS;
    }

    /**
     * A query that provides access to whether a leap-second was parsed.
     * <p>
     * This returns a singleton {@linkplain TemporalQuery query} that provides
     * access to additional information from the parse. The query always returns
     * a non-null boolean, true if parsing saw a leap-second, false if not.
     * <p>
     * Instant parsing handles the special "leap second" time of '23:59:60'.
     * Leap seconds occur at '23:59:60' in the UTC time-zone, but at other
     * local times in different time-zones. To avoid this potential ambiguity,
     * the handling of leap-seconds is limited to
     * {@link DateTimeFormatterBuilder#appendInstant()}, as that method
     * always parses the instant with the UTC zone offset.
     * <p>
     * If the time '23:59:60' is received, then a simple conversion is applied,
     * replacing the second-of-minute of 60 with 59. This query can be used
     * on the parse result to determine if the leap-second adjustment was made.
     * The query will return one second of excess if it did adjust to remove
     * the leap-second, and zero if not. Note that applying a leap-second
     * smoothing mechanism, such as UTC-SLS, is the responsibility of the
     * application, as follows:
     * <pre>
     *  TemporalAccessor parsed = formatter.parse(str);
     *  Instant instant = parsed.query(Instant::from);
     *  if (parsed.query(DateTimeFormatter.parsedLeapSecond())) {
     *    // validate leap-second is correct and apply correct smoothing
     *  }
     * </pre>
     * @return a query that provides access to whether a leap-second was parsed
     */
    static parsedLeapSecond() {
        return DateTimeFormatter.PARSED_LEAP_SECOND;
    }

    //-----------------------------------------------------------------------
    /**
     * Constructor.
     *
     * @param printerParser  the printer/parser to use, not null
     * @param locale  the locale to use, not null
     * @param decimalStyle  the decimal style to use, not null
     * @param resolverStyle  the resolver style to use, not null
     * @param resolverFields  the fields to use during resolving, null for all fields
     * @param chrono  the chronology to use, null for no override
     * @param zone  the zone to use, null for no override
     */
    constructor(printerParser, locale, decimalStyle, resolverStyle, resolverFields, chrono=IsoChronology.INSTANCE, zone) {
        assert(printerParser != null);
        assert(decimalStyle != null);
        assert(resolverStyle != null);
        /**
         * The printer and/or parser to use, not null.
         */
        this._printerParser = printerParser;
        /**
         * The locale to use for formatting. // nyi
         */
        this._locale = locale;
        /**
         * The symbols to use for formatting, not null.
         */
        this._decimalStyle = decimalStyle;
        /**
         * The resolver style to use, not null.
         */
        this._resolverStyle = resolverStyle;
        /**
         * The fields to use in resolving, null for all fields.
         */
        this._resolverFields = resolverFields;
        /**
         * The chronology to use for formatting, null for no override.
         */
        this._chrono = chrono;
        /**
         * The zone to use for formatting, null for no override. // nyi
         */
        this._zone = zone;
    }

    locale() {
        return this._locale;
    }

    decimalStyle() {
        return this._decimalStyle;
    }

    chronology() {
        return this._chrono;
    }

    /**
     * Returns a copy of this formatter with a new override chronology.
     *
     * This returns a formatter with similar state to this formatter but
     * with the override chronology set.
     * By default, a formatter has no override chronology, returning null.
     *
     * If an override is added, then any date that is printed or parsed will be affected.
     *
     * When printing, if the {@code Temporal} object contains a date then it will
     * be converted to a date in the override chronology.
     * Any time or zone will be retained unless overridden.
     * The converted result will behave in a manner equivalent to an implementation
     * of {@code ChronoLocalDate},{@code ChronoLocalDateTime} or {@code ChronoZonedDateTime}.
     *
     * When parsing, the override chronology will be used to interpret the
     * {@linkplain ChronoField fields} into a date unless the
     * formatter directly parses a valid chronology.
     *
     * This instance is immutable and unaffected by this method call.
     *
     * @param chrono  the new chronology, not null
     * @return a formatter based on this formatter with the requested override chronology, not null
     */
    withChronology(chrono) {
        if (this._chrono != null && this._chrono.equals(chrono)) {
            return this;
        }
        return new DateTimeFormatter(this._printerParser, this._locale, this._decimalStyle,
            this._resolverStyle, this._resolverFields, chrono, this._zone);
    }

    /**
     * not yet supported
     * @returns {DateTimeFormatter}
     */
    withLocal(){
        return this;
    }

    //-----------------------------------------------------------------------
     /**
      * Formats a date-time object using this formatter.
      * <p>
      * This formats the date-time to a String using the rules of the formatter.
      *
      * @param {TemporalAccessor} temporal  the temporal object to print, not null
      * @return {String} the printed string, not null
      * @throws DateTimeException if an error occurs during formatting
      */
     format(temporal) {
         var buf = new StringBuilder(32);
         this._formatTo(temporal, buf);
         return buf.toString();
     }

     //-----------------------------------------------------------------------
     /**
      * Formats a date-time object to an {@code Appendable} using this formatter.
      * <p>
      * This formats the date-time to the specified destination.
      * {@link Appendable} is a general purpose interface that is implemented by all
      * key character output classes including {@code StringBuffer}, {@code StringBuilder},
      * {@code PrintStream} and {@code Writer}.
      * <p>
      * Although {@code Appendable} methods throw an {@code IOException}, this method does not.
      * Instead, any {@code IOException} is wrapped in a runtime exception.
      *
      * @param {TemporalAccessor} temporal - the temporal object to print, not null
      * @param {StringBuilder} appendable - the appendable to print to, not null
      * @throws DateTimeException if an error occurs during formatting
      */
     _formatTo(temporal, appendable) {
         requireNonNull(temporal, 'temporal');
         requireNonNull(appendable, 'appendable');
         var context = new DateTimePrintContext(temporal, this);
         this._printerParser.print(context, appendable);
     }

    /**
     * function overloading for {@link DateTimeFormatter.parse}
     *
     * if called with one arg {@link DateTimeFormatter.parse1} is called
     * otherwise {@link DateTimeFormatter.parse2}
     *
     * @param {string} text
     * @param {TemporalQuery} type
     * @return {TemporalAccessor}
     */
    parse(text, type){
        if(arguments.length === 1){
            return this.parse1(text);
        } else {
            return this.parse2(text, type);
        }
    }

    /**
     * Fully parses the text producing a temporal object.
     * <p>
     * This parses the entire text producing a temporal object.
     * It is typically more useful to use {@link #parse(CharSequence, TemporalQuery)}.
     * The result of this method is {@code TemporalAccessor} which has been resolved,
     * applying basic validation checks to help ensure a valid date-time.
     * <p>
     * If the parse completes without reading the entire length of the text,
     * or a problem occurs during parsing or merging, then an exception is thrown.
     *
     * @param {String} text  the text to parse, not null
     * @return {TemporalAccessor} the parsed temporal object, not null
     * @throws DateTimeParseException if unable to parse the requested result
     */
    parse1(text) {
        requireNonNull(text, 'text');
        try {
            return this._parseToBuilder(text, null).resolve(this._resolverStyle, this._resolverFields);
        } catch (ex) {
            if(ex instanceof DateTimeParseException){
                throw ex;
            } else {
                throw this._createError(text, ex);
            }
        }
    }

    /**
     * Fully parses the text producing a temporal object.
     *
     * This parses the entire text producing a temporal object.
     * It is typically more useful to use {@link #parse(CharSequence, TemporalQuery)}.
     * The result of this method is {@code TemporalAccessor} which has been resolved,
     * applying basic validation checks to help ensure a valid date-time.
     *
     * If the parse completes without reading the entire length of the text,
     * or a problem occurs during parsing or merging, then an exception is thrown.
     *
     * @param text  the text to parse, not null
     * @param type the type to extract, not null
 * @return the parsed temporal object, not null
     * @throws DateTimeParseException if unable to parse the requested result
     */
    parse2(text, type) {
        requireNonNull(text, 'text');
        requireNonNull(type, 'type');
        try {
            var builder = this._parseToBuilder(text, null).resolve(this._resolverStyle, this._resolverFields);
            return builder.build(type);
        } catch (ex) {
            if(ex instanceof DateTimeParseException){
                throw ex;
            } else {
                throw this._createError(text, ex);
            }
        }
    }

    _createError(text, ex) {
        var abbr = '';
        if (text.length > 64) {
            abbr = text.subString(0, 64) + '...';
        } else {
            abbr = text;
        }
        return new DateTimeParseException('Text \'' + abbr + '\' could not be parsed: ' + ex.message, text, 0, ex);
    }


    /**
     * Parses the text to a builder.
     * <p>
     * This parses to a {@code DateTimeBuilder} ensuring that the text is fully parsed.
     * This method throws {@link DateTimeParseException} if unable to parse, or
     * some other {@code DateTimeException} if another date/time problem occurs.
     *
     * @param text  the text to parse, not null
     * @param position  the position to parse from, updated with length parsed
     *  and the index of any error, null if parsing whole string
     * @return the engine representing the result of the parse, not null
     * @throws DateTimeParseException if the parse fails
     */
    _parseToBuilder(text, position) {
        var pos = (position != null ? position : new ParsePosition(0));
        var result = this._parseUnresolved0(text, pos);
        if (result == null || pos.getErrorIndex() >= 0 || (position == null && pos.getIndex() < text.length)) {
            var abbr = '';
            if (text.length > 64) {
                abbr = text.substr(0, 64).toString() + '...';
            } else {
                abbr = text;
            }
            if (pos.getErrorIndex() >= 0) {
                throw new DateTimeParseException('Text \'' + abbr + '\' could not be parsed at index ' +
                        pos.getErrorIndex(), text, pos.getErrorIndex());
            } else {
                throw new DateTimeParseException('Text \'' + abbr + '\' could not be parsed, unparsed text found at index ' +
                        pos.getIndex(), text, pos.getIndex());
            }
        }
        return result.toBuilder();
    }

    /**
     * Parses the text using this formatter, without resolving the result, intended
     * for advanced use cases.
     * <p>
     * Parsing is implemented as a two-phase operation.
     * First, the text is parsed using the layout defined by the formatter, producing
     * a {@code Map} of field to value, a {@code ZoneId} and a {@code Chronology}.
     * Second, the parsed data is <em>resolved</em>, by validating, combining and
     * simplifying the various fields into more useful ones.
     * This method performs the parsing stage but not the resolving stage.
     * <p>
     * The result of this method is {@code TemporalAccessor} which represents the
     * data as seen in the input. Values are not validated, thus parsing a date string
     * of '2012-00-65' would result in a temporal with three fields - year of '2012',
     * month of '0' and day-of-month of '65'.
     * <p>
     * The text will be parsed from the specified start {@code ParsePosition}.
     * The entire length of the text does not have to be parsed, the {@code ParsePosition}
     * will be updated with the index at the end of parsing.
     * <p>
     * Errors are returned using the error index field of the {@code ParsePosition}
     * instead of {@code DateTimeParseException}.
     * The returned error index will be set to an index indicative of the error.
     * Callers must check for errors before using the context.
     * <p>
     * If the formatter parses the same field more than once with different values,
     * the result will be an error.
     * <p>
     * This method is intended for advanced use cases that need access to the
     * internal state during parsing. Typical application code should use
     * {@link #parse(CharSequence, TemporalQuery)} or the parse method on the target type.
     *
     * @param text  the text to parse, not null
     * @param position  the position to parse from, updated with length parsed
     *  and the index of any error, not null
     * @return the parsed text, null if the parse results in an error
     * @throws DateTimeException if some problem occurs during parsing
     * @throws IndexOutOfBoundsException if the position is invalid
     */
    parseUnresolved(text, position) {
        return this._parseUnresolved0(text, position);
    }

    _parseUnresolved0(text, position) {
        assert(text != null, 'text', NullPointerException);
        assert(position != null, 'position', NullPointerException);
        var context = new DateTimeParseContext(this);
        var pos = position.getIndex();
        pos = this._printerParser.parse(context, text, pos);
        if (pos < 0) {
            position.setErrorIndex(~pos);  // index not updated from input
            return null;
        }
        position.setIndex(pos);  // errorIndex not updated from input
        return context.toParsed();
    }

    /**
     * Returns the formatter as a composite printer parser.
     *
     * @param {boolean} optional  whether the printer/parser should be optional
     * @return {CompositePrinterParser} the printer/parser, not null
     */
    toPrinterParser(optional) {
        return this._printerParser.withOptional(optional);
    }

    toString() {
        var pattern = this._printerParser.toString();
        return pattern.indexOf('[') === 0 ? pattern : pattern.substring(1, pattern.length - 1);
    }

}

export function _init() {

    DateTimeFormatter.ISO_LOCAL_DATE = new DateTimeFormatterBuilder()
        .appendValue(ChronoField.YEAR, 4, 10, SignStyle.EXCEEDS_PAD)
        .appendLiteral('-')
        .appendValue(ChronoField.MONTH_OF_YEAR, 2)
        .appendLiteral('-')
        .appendValue(ChronoField.DAY_OF_MONTH, 2)
        .toFormatter(ResolverStyle.STRICT).withChronology(IsoChronology.INSTANCE);

    DateTimeFormatter.ISO_LOCAL_TIME = new DateTimeFormatterBuilder()
        .appendValue(ChronoField.HOUR_OF_DAY, 2)
        .appendLiteral(':')
        .appendValue(ChronoField.MINUTE_OF_HOUR, 2)
        .optionalStart()
        .appendLiteral(':')
        .appendValue(ChronoField.SECOND_OF_MINUTE, 2)
        .optionalStart()
        .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)
        .toFormatter(ResolverStyle.STRICT);

    DateTimeFormatter.ISO_LOCAL_DATE_TIME = new DateTimeFormatterBuilder()
        .parseCaseInsensitive()
        .append(DateTimeFormatter.ISO_LOCAL_DATE)
        .appendLiteral('T')
        .append(DateTimeFormatter.ISO_LOCAL_TIME)
        .toFormatter(ResolverStyle.STRICT).withChronology(IsoChronology.INSTANCE);

    DateTimeFormatter.ISO_INSTANT = new DateTimeFormatterBuilder()
        .parseCaseInsensitive()
        .appendInstant()
        .toFormatter(ResolverStyle.STRICT);

    DateTimeFormatter.PARSED_EXCESS_DAYS = createTemporalQuery('PARSED_EXCESS_DAYS', (temporal) => {
        if (temporal instanceof DateTimeBuilder) {
            return temporal.excessDays;
        } else {
            return Period.ZERO;
        }
    });

    DateTimeFormatter.PARSED_LEAP_SECOND = createTemporalQuery('PARSED_LEAP_SECOND', (temporal) => {
        if (temporal instanceof DateTimeBuilder) {
            return temporal.leapSecond;
        } else {
            return false;
        }
    });


}