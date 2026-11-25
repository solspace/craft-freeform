<?php

namespace Solspace\Freeform\Library\Templates;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Twig\Environment;
use Twig\Extension\SandboxExtension;
use Twig\Loader\ArrayLoader;
use Twig\Markup;
use Twig\Sandbox\SecurityPolicy;

final class FormTemplateTwig
{
    private const TESTS = ['defined', 'divisible by', 'empty', 'even', 'iterable', 'mapping', 'none', 'null', 'odd', 'same as', 'sequence', 'true'];

    public static function render(string $source, array $variables, bool $escapeHtml = false): string
    {
        $name = $escapeHtml ? '__string_template__freeform_html' : '__string_template__freeform_text';

        return self::environment($escapeHtml)->createTemplate($source, $name)->render(self::prepareContext($variables));
    }

    public static function prepareContext(array $variables): array
    {
        return array_map([self::class, 'project'], $variables);
    }

    private static function environment(bool $escapeHtml): Environment
    {
        static $environments = [];

        if (!isset($environments[$escapeHtml])) {
            $environment = new Environment(new ArrayLoader(), ['autoescape' => $escapeHtml ? 'html' : false]);
            $policy = new SecurityPolicy(
                ['apply', 'for', 'if', 'set', 'with'],
                ['abs', 'capitalize', 'date', 'default', 'e', 'escape', 'first', 'join', 'keys', 'last', 'length', 'lower', 'nl2br', 'number_format', 'replace', 'round', 'slice', 'striptags', 'title', 'trim', 'upper', 'url_encode'],
                [
                    \DateTimeImmutable::class => ['format'],
                    TemplateFieldValue::class => ['__tostring', 'implements'],
                ],
                [TemplateFieldValue::class => ['id', 'handle', 'label', 'type', 'value', 'valueAsString', 'labelsAsString']],
                [],
            );
            if (method_exists($policy, 'setStrict')) {
                $policy->setStrict(true);
                $policy->setAllowedTests(self::TESTS);
            }

            $environment->addExtension(new SandboxExtension($policy, true));
            $environment->addNodeVisitor(new FormTemplateNodeVisitor(self::TESTS));
            $environments[$escapeHtml] = $environment;
        }

        return $environments[$escapeHtml];
    }

    private static function project(mixed $value): mixed
    {
        return match (true) {
            \is_array($value) => self::prepareContext($value),
            $value instanceof Form => [
                'id' => $value->getId(),
                'name' => $value->getName(),
                'handle' => $value->getHandle(),
                'color' => $value->getColor(),
                'description' => $value->getDescription(),
                'type' => $value->getType(),
            ],
            $value instanceof Submission => [
                'id' => $value->id,
                'incrementalId' => $value->incrementalId,
                'token' => $value->token,
                'title' => $value->title,
                'dateCreated' => self::project($value->dateCreated),
                'status' => $value->getStatus(),
                'cpEditUrl' => $value->getCpEditUrl(),
                'userId' => $value->userId,
                'ip' => $value->ip,
                'sourceUrl' => $value->sourceUrl,
            ],
            $value instanceof FieldInterface => new TemplateFieldValue($value, self::project($value->getValue())),
            $value instanceof TemplateFieldValue => $value,
            $value instanceof \DateTimeInterface => \DateTimeImmutable::createFromInterface($value),
            $value instanceof Markup => new Markup((string) $value, 'UTF-8'),
            \is_scalar($value) => $value,
            default => null,
        };
    }
}
