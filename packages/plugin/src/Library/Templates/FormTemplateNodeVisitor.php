<?php

namespace Solspace\Freeform\Library\Templates;

use Twig\Environment;
use Twig\Node\Expression\Binary\HasEveryBinary;
use Twig\Node\Expression\Binary\HasSomeBinary;
use Twig\Node\Expression\Binary\RangeBinary;
use Twig\Node\Expression\TestExpression;
use Twig\Node\Node;
use Twig\NodeVisitor\NodeVisitorInterface;
use Twig\Sandbox\SecurityError;

final class FormTemplateNodeVisitor implements NodeVisitorInterface
{
    public function __construct(private array $allowedTests) {}

    public function enterNode(Node $node, Environment $env): Node
    {
        // Older Twig releases do not apply the sandbox policy to tests and operators.
        if ($node instanceof HasEveryBinary || $node instanceof HasSomeBinary || $node instanceof RangeBinary) {
            throw new SecurityError('This Twig operator is unavailable in form templates.', $node->getTemplateLine(), $node->getSourceContext());
        }

        if ($node instanceof TestExpression && !\in_array($node->getAttribute('name'), $this->allowedTests, true)) {
            throw new SecurityError('This Twig test is unavailable in form templates.', $node->getTemplateLine(), $node->getSourceContext());
        }

        return $node;
    }

    public function leaveNode(Node $node, Environment $env): ?Node
    {
        return $node;
    }

    public function getPriority(): int
    {
        return 0;
    }
}
