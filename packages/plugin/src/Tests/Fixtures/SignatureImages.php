<?php

namespace Solspace\Freeform\Tests\Fixtures;

class SignatureImages
{
    public const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAADElEQVQImWNgYGAAAAAEAAGjChXjAAAAAElFTkSuQmCC';
    public const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA+Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBkZWZhdWx0IHF1YWxpdHkK/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A+f6KKKAP/9k=';

    public static function validImages(): array
    {
        return [
            'PNG' => [self::PNG, 'image/png'],
            'JPEG' => [self::JPEG, 'image/jpeg'],
            'saved signature' => [trim(file_get_contents(__DIR__.'/../../Bundles/Form/Submissions/fake-signature.txt')), 'image/png'],
            'surrounding whitespace' => ["\n ".self::PNG."\r\n", 'image/png'],
        ];
    }

    public static function invalidImages(): array
    {
        return [
            'empty' => [''],
            'null' => [null],
            'array' => [[self::PNG]],
            'object' => [new \stdClass()],
            'local path' => ['/tmp/signature.png'],
            'file URL' => ['file:///tmp/signature.png'],
            'remote URL' => ['https://example.com/signature.png'],
            'PHP stream' => ['php://filter/convert.base64-encode/resource=/tmp/signature.png'],
            'attribute injection' => ['x" onerror="alert(1)'],
            'image with attribute injection' => [self::PNG.'" onerror="alert(1)'],
            'SVG' => ['data:image/svg+xml;base64,'.base64_encode('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>')],
            'HTML' => ['data:text/html;base64,'.base64_encode('<script>alert(1)</script>')],
            'text claiming to be PNG' => ['data:image/png;base64,'.base64_encode('not an image')],
            'zero-width PNG' => ['data:image/png;base64,'.base64_encode(substr_replace(base64_decode(explode(',', self::PNG, 2)[1]), pack('N', 0), 16, 4))],
            'truncated PNG' => ['data:image/png;base64,'.base64_encode("\x89PNG\r\n\x1a\n")],
            'truncated JPEG' => ['data:image/jpeg;base64,'.base64_encode("\xff\xd8\xff")],
            'mismatched image type' => [str_replace('image/png', 'image/jpeg', self::PNG)],
            'invalid base64' => ['data:image/png;base64,not!base64'],
            'empty base64' => ['data:image/png;base64,'],
        ];
    }
}
