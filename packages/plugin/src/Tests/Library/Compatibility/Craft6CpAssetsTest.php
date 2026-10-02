<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Resources\Craft6CpAssets;

#[CoversNothing]
class Craft6CpAssetsTest extends TestCase
{
    private const ASSETS = '<link rel="preload" as="style" href="/cp.css" />'
        .'<link rel="modulepreload" href="/components.js" />'
        .'<link rel="stylesheet" href="/cp.css" />'
        .'<link rel="stylesheet" href="/legacy.css" />'
        .'<script type="module" src="/legacy.js"></script>';

    public function testNativeAssetsLoadBeforeBodyAndKeepTheirOrderWithoutDuplicates(): void
    {
        $before = '<!DOCTYPE html><html><head><script>window.Craft = {}</script>'
            .'<link rel="stylesheet" href="/freeform.css" /></head>'
            .'<body class="ltr freeform-cp cp-legacy"><nav>Freeform</nav>'
            .self::ASSETS.'<script src="/jquery.js"></script><script src="/freeform.js"></script></body></html>';
        $after = Craft6CpAssets::moveToHead($before, self::ASSETS);

        self::assertSame(1, substr_count($after, self::ASSETS));
        self::assertLessThan(strpos($after, '</head>'), strpos($after, self::ASSETS));
        self::assertLessThan(strpos($after, self::ASSETS), strpos($after, '/freeform.css'));
        self::assertStringContainsString('<nav>Freeform</nav><script src="/jquery.js"></script><script src="/freeform.js"></script>', $after);
        self::assertSame($after, Craft6CpAssets::moveToHead($after, self::ASSETS));
    }

    public function testHotServerModuleTagsAndCspAttributesArePreserved(): void
    {
        $assets = '<script type="module" src="https://craft.test:5173/@vite/client" nonce="nonce"></script>'
            .'<script type="module" src="https://craft.test:5173/resources/css/cp.css" nonce="nonce"></script>'
            .'<script type="module" src="https://craft.test:5173/resources/js/legacy.ts" nonce="nonce"></script>';
        $html = '<head></head><body class="freeform-cp">Settings'.$assets.'</body>';
        self::assertSame('<head>'.$assets.\PHP_EOL.'</head><body class="freeform-cp">Settings</body>', Craft6CpAssets::moveToHead($html, $assets));
    }

    public function testNativePagesFragmentsAndMissingAssetBlocksAreUntouched(): void
    {
        foreach ([
            '<head></head><body class="cp-legacy">Entries'.self::ASSETS.'</body>',
            '<head></head><body class="freeform-cp">Settings</body>',
            '<div class="freeform-cp">Modal'.self::ASSETS.'</div>',
            '<head></head><body class="freeform-cp">Settings'.self::ASSETS.'</body>',
        ] as $html) {
            $assets = str_contains($html, '>Settings'.self::ASSETS) ? '' : self::ASSETS;
            self::assertSame($html, Craft6CpAssets::moveToHead($html, $assets));
        }
    }
}
