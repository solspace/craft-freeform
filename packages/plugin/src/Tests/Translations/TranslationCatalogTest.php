<?php

namespace Solspace\Freeform\Tests\Translations;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;

#[CoversNothing]
class TranslationCatalogTest extends TestCase
{
    #[TestWith(['en'])]
    #[TestWith(['de'])]
    #[TestWith(['fr'])]
    #[TestWith(['it'])]
    #[TestWith(['nl'])]
    public function testEveryRegisteredMessageHasATranslationWithTheSamePlaceholders(string $language): void
    {
        $english = require __DIR__.'/../../translations/en/freeform.php';
        $catalog = require __DIR__.'/../../translations/'.$language.'/freeform.php';

        foreach ($english as $message => $value) {
            self::assertIsString($message, 'Translation keys must be messages, not evaluated PHP expressions.');
            self::assertIsString($value, $message);
            self::assertArrayHasKey($message, $catalog, $language.': '.$message);
            self::assertIsString($catalog[$message], $language.': '.$message);
            self::assertNotSame('', trim($catalog[$message]), $language.': '.$message);
            preg_match_all('/\{[A-Za-z_]\w*\}/', $message, $expected);
            preg_match_all('/\{[A-Za-z_]\w*\}/', $catalog[$message], $actual);
            sort($expected[0]);
            sort($actual[0]);
            self::assertSame($expected[0], $actual[0], $language.': '.$message);
        }

        foreach ($catalog as $message => $translation) {
            self::assertIsString($message);
            self::assertIsString($translation, $language.': '.$message);
            self::assertNotSame('', trim($translation), $language.': '.$message);
        }
    }

    #[TestWith(['en'])]
    #[TestWith(['de'])]
    #[TestWith(['fr'])]
    #[TestWith(['it'])]
    #[TestWith(['nl'])]
    public function testNotificationRecipientPluralsFormatSingularAndPluralCounts(string $language): void
    {
        $catalog = require __DIR__.'/../../translations/'.$language.'/freeform.php';
        foreach ([
            '{count, plural, one{1 email} other{# emails}}',
            '{count, plural, one{1 submission selected} other{# submissions selected}}',
        ] as $message) {
            foreach ([1, 2] as $count) {
                $formatted = \MessageFormatter::formatMessage($language, $catalog[$message], ['count' => $count]);
                self::assertIsString($formatted, $language.': '.$message);
                self::assertStringContainsString((string) $count, $formatted);
                self::assertStringNotContainsString('{', $formatted);
            }
        }
    }
}
