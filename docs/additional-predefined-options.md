# Additional predefined options

Choose **Predefined Options** as the option source for a Dropdown, Multiple Select,
Checkboxes, or Radios field, then select one of these types.

| Type | Contents | Default stored values |
| --- | --- | --- |
| Regional Subdivisions | Select Australia, Germany, France, Italy, the Netherlands, or the United Kingdom | Country-qualified subdivision codes, such as `AU-NSW` and `DE-BY` |
| Survey Scales | Agreement, satisfaction, frequency, importance, or likelihood | Scores `1`–`5`, from lowest to highest |
| Time Intervals | A same-day time range in 15-, 30-, or 60-minute increments | `HH:MM` in 24-hour format |
| Age Ranges | Under 18, 18–24, 25–34, 35–44, 45–54, 55–64, 65 or older, and Prefer not to say | Identifiers such as `under-18`, `18-24`, and `65-plus` |
| Company Sizes | Eight employee-count bands, from 1 to 5,001 or more | Identifiers such as `1`, `2-10`, and `5001-plus` |
| Industries | Nineteen broad business sectors plus Other | Identifiers such as `construction`, `healthcare`, and `other` |
| Employment Statuses | Full-time, part-time, self-employed, unemployed, student, retired, homemaker, unable to work, Other, and Prefer not to say | Identifiers such as `full-time`, `self-employed`, and `prefer-not-to-say` |
| Continents | Africa, Antarctica, Asia, Europe, North America, Oceania, and South America | `AF`, `AN`, `AS`, `EU`, `NA`, `OC`, and `SA` |

## Labels, values, and customization

All lists except Time Intervals offer **Full** and **Full (translated)** labels.
Translated labels are the default and are provided in English, German, French,
Italian, and Dutch using Freeform's existing translation system. Proper names may
be spelled identically in several languages. Unsupported languages fall back to
the English label.

The default **Identifier** values stay the same when labels are translated.
**Full** and **Full (translated)** values are also available, matching Freeform's
existing predefined option conventions. Keep Identifier selected for numeric
survey scores and for consistent integration mappings. Changing the value format
after collecting submissions changes the option values used to look up old answers.

Use **Convert to Custom Values** to edit, remove, add, or reorder choices. Age
groups, employee bands, employment statuses, and industries are general-purpose
starting points; customize them for the audience. Industries are broad categories,
not a formal NAICS or NACE classification. Continent identifiers are Freeform's
list identifiers, not country codes.

The existing empty-option setting remains available for applicable fields. These
providers use the existing form configuration and import/export mechanisms and
do not require a database migration.

## Regional coverage

| Country | Coverage |
| --- | --- |
| Australia | Six states and two mainland territories (8 options); external territories are not included |
| Germany | Federal states (16 options) |
| France | Regions and equivalent territorial collectivities, including Corsica and the five overseas regions (18 options) |
| Italy | Regions, including autonomous regions (20 options) |
| Netherlands | European Netherlands provinces (12 options) |
| United Kingdom | England, Northern Ireland, Scotland, and Wales (4 options); not counties or local authorities |

The country is chosen by the form editor. This does not introduce a dependent
country/region field on the frontend. Regional lists retain their English name
order when labels are translated.

Regional names and their translations were adapted from
[Unicode CLDR subdivision data](https://github.com/unicode-org/cldr/tree/main/common/subdivisions)
(`en`, `de`, `fr`, `it`, and `nl`, retrieved September 22, 2026). English names were
normalized where necessary. The bundled data and translations work offline.
See the included
[Unicode license](../packages/plugin/src/Fields/Properties/Options/Predefined/Types/RegionalSubdivisions/UNICODE-LICENSE.txt).

## Survey scales

Each scale has five ordered answers. The numeric identifiers increase in the
direction indicated below:

| Scale | 1 | 5 |
| --- | --- | --- |
| Agreement | Strongly disagree | Strongly agree |
| Satisfaction | Very dissatisfied | Very satisfied |
| Frequency | Never | Always |
| Importance | Not at all important | Extremely important |
| Likelihood | Very unlikely | Very likely |

These presets supply answer choices and scores; they do not automatically grade
quizzes or calculate a total score.

## Time intervals

Enter Start Time and End Time in zero-padded 24-hour `HH:MM` format. The default
range is `09:00`–`17:00` with 30-minute intervals. Choose 12-hour or 24-hour display
labels; the stored values always remain `HH:MM`.

- The start time is included. The end time is included only if an interval lands
  exactly on it. For example, `09:10`–`10:00` in 30-minute intervals produces
  `09:10` and `09:40`.
- Equal start and end times produce one option.
- Use `00:00`–`23:59` to cover a full day. `24:00` is not a valid time.
- Invalid times, an end before the start, or an unsupported interval produce no
  options. Overnight ranges are not supported.
- This is a list of preferred times, not an appointment availability or booking
  system. Values do not include a date, timezone, or daylight-saving conversion.
