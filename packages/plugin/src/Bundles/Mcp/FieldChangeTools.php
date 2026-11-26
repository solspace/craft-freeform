<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\mcp\attributes\RequiresPermission;
use Mcp\Capability\Attribute\McpTool;
use Mcp\Capability\Attribute\Schema;
use Mcp\Schema\ToolAnnotations;
use Solspace\Freeform\Freeform;

final class FieldChangeTools
{
    #[McpTool(name: 'freeform.fields.request-change', description: 'Preview removing custom choices, switching a choice source, or changing a field type. Return the impact and Craft approval link. This tool does not change the field.', annotations: new ToolAnnotations(destructiveHint: false, openWorldHint: false))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function request(
        string $form,
        string $site,
        string $field,
        #[Schema(enum: FieldChange::OPERATIONS)]
        string $operation,
        #[Schema(items: ['type' => 'string'], maxItems: 50)]
        array $removeValues = [],
        #[Schema(type: 'object', required: ['type', 'handle'], properties: ['type' => ['type' => 'string', 'enum' => ChoiceSources::TYPES], 'handle' => ['type' => 'string']], additionalProperties: false)]
        ?array $optionSource = null,
        #[Schema(items: ['type' => 'string'], maxItems: 50)]
        array $customOptions = [],
        #[Schema(enum: FieldChange::FIELD_TYPES)]
        ?string $targetType = null,
    ): array {
        return FieldChange::request($form, $site, $field, $operation, compact('removeValues', 'optionSource', 'customOptions', 'targetType'));
    }

    #[McpTool(name: 'freeform.fields.apply-change', description: 'Apply a reviewed field change after its impact preview, only when Craft approval is disabled by the site administrator. Otherwise use the signed-in Craft link.', annotations: new ToolAnnotations(destructiveHint: true, openWorldHint: false))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function apply(string $reviewId): array
    {
        return FieldChange::review($reviewId, confirm: true, viaMcp: true);
    }
}
