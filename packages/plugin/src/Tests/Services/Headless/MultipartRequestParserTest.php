<?php

namespace Solspace\Freeform\Tests\Services\Headless;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\Headless\MultipartRequestParser;

#[CoversClass(MultipartRequestParser::class)]
class MultipartRequestParserTest extends TestCase
{
    private MultipartRequestParser $parser;

    protected function setUp(): void
    {
        $this->parser = new MultipartRequestParser();
        $_FILES = [];
    }

    protected function tearDown(): void
    {
        $_FILES = [];
    }

    public function testParseMetadataReturnsDecodedJson(): void
    {
        $request = $this->createMock(Request::class);
        $request->method('post')->with('_freeform')->willReturn(json_encode([
            'values' => ['email' => 'a@b.com'],
            'intent' => 'submit',
        ]));

        $result = $this->parser->parseMetadata($request);

        self::assertSame('submit', $result['intent']);
        self::assertSame(['email' => 'a@b.com'], $result['values']);
    }

    public function testParseMetadataReturnsNullWhenMissing(): void
    {
        $request = $this->createMock(Request::class);
        $request->method('post')->with('_freeform')->willReturn(null);

        self::assertNull($this->parser->parseMetadata($request));
    }

    public function testParseMetadataReturnsNullWhenEmptyString(): void
    {
        $request = $this->createMock(Request::class);
        $request->method('post')->with('_freeform')->willReturn('');

        self::assertNull($this->parser->parseMetadata($request));
    }

    public function testParseMetadataReturnsNullWhenInvalidJson(): void
    {
        $request = $this->createMock(Request::class);
        $request->method('post')->with('_freeform')->willReturn('{not-json');

        self::assertNull($this->parser->parseMetadata($request));
    }

    public function testParseMetadataReturnsNullWhenJsonIsNotObject(): void
    {
        $request = $this->createMock(Request::class);
        $request->method('post')->with('_freeform')->willReturn('"string"');

        self::assertNull($this->parser->parseMetadata($request));
    }

    public function testExtractFilesByHandleGroupsUploads(): void
    {
        $_FILES['files'] = [
            'name' => [
                'cover' => ['a.png', 'b.png'],
                'resume' => ['cv.pdf'],
            ],
            'type' => [
                'cover' => ['image/png', 'image/png'],
                'resume' => ['application/pdf'],
            ],
            'tmp_name' => [
                'cover' => ['/tmp/a', '/tmp/b'],
                'resume' => ['/tmp/c'],
            ],
            'error' => [
                'cover' => [0, 0],
                'resume' => [0],
            ],
            'size' => [
                'cover' => [10, 20],
                'resume' => [30],
            ],
        ];

        $request = $this->createMock(Request::class);
        $byHandle = $this->parser->extractFilesByHandle($request);

        self::assertArrayHasKey('cover', $byHandle);
        self::assertArrayHasKey('resume', $byHandle);
        self::assertSame(['a.png', 'b.png'], $byHandle['cover']['name']);
        self::assertSame(['cv.pdf'], $byHandle['resume']['name']);
    }

    public function testExtractFilesByHandleReturnsEmptyWithoutNamespace(): void
    {
        $request = $this->createMock(Request::class);

        self::assertSame([], $this->parser->extractFilesByHandle($request));
    }

    public function testRemapFilesToFieldHandlesWritesIntoFilesSuperglobal(): void
    {
        $_FILES['files'] = [
            'name' => ['bookCoverImage' => ['cover.png']],
            'type' => ['bookCoverImage' => ['image/png']],
            'tmp_name' => ['bookCoverImage' => ['/tmp/cover']],
            'error' => ['bookCoverImage' => [0]],
            'size' => ['bookCoverImage' => [100]],
        ];

        $request = $this->createMock(Request::class);
        $byHandle = $this->parser->remapFilesToFieldHandles($request);

        self::assertArrayHasKey('bookCoverImage', $byHandle);
        self::assertArrayHasKey('bookCoverImage', $_FILES);
        self::assertSame(['cover.png'], $_FILES['bookCoverImage']['name']);
    }
}
