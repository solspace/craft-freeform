<?php

$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__ . '/packages/plugin');

return (new PhpCsFixer\Config())
    ->setRules([
        '@Symfony' => true,
        '@Symfony:risky' => true,
        '@PHPUnit75Migration:risky' => true,
        '@PhpCsFixer' => true,
        'array_indentation' => true,
        'array_syntax' => ['syntax' => 'short'],
        'combine_nested_dirname' => true,
        'linebreak_after_opening_tag' => true,
        'list_syntax' => ['syntax' => 'long'],
        'protected_to_private' => false,
        'single_trait_insert_per_statement' => true,
        'ternary_to_null_coalescing' => true,
        'visibility_required' => ['elements' => ['property', 'method']],
    ])
    ->setRiskyAllowed(true)
    ->setFinder($finder);
