<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\Settings;

class m230101_100010_FF4to5_MigrateForms extends Migration
{
    public function safeUp(): bool
    {
        $propertyProvider = \Craft::$container->get(PropertyProvider::class);

        // Add form columns
        $this->createIndex(null, '{{%freeform_forms}}', ['order']);

        // Migrate form data
        $formData = (new Query())
            ->select('*')
            ->from('{{%freeform_forms}}')
            ->all()
        ;

        /** @var Settings $settings */
        $settings = Freeform::getInstance()->getSettings();
        $defaults = $settings->defaults;

        foreach ($formData as $data) {
            $id = $data['id'];
            $layoutJson = json_decode($data['layoutJson']);

            $form = $layoutJson->composer->properties->form;
            $validation = $layoutJson->composer->properties->validation;

            $general = new GeneralSettings();
            $behavior = new BehaviorSettings();

            $oldAttributes = $form->tagAttributes ?? [];
            $attributes = [];
            foreach ($oldAttributes as $oldAttribute) {
                $attr = $oldAttribute->attribute ?? $oldAttribute->value ?? '';
                $value = $oldAttribute->value ?? '';
                $attributes[$attr] = $value;
            }

            $propertyProvider->setObjectProperties(
                $general,
                [
                    'name' => $form->name,
                    'handle' => $form->handle,
                    'type' => $formData->formType ?? $data['type'] ?? 'Solspace\Freeform\Form\Types\Regular',
                    'submissionTitle' => $form->submissionTitleFormat,
                    'formattingTemplate' => $this->transformTemplate($form->formTemplate),
                    'description' => $form->description,
                    'color' => $form->color,
                    'attributes' => [
                        'form' => $attributes,
                        'row' => [],
                        'success' => [],
                        'errors' => [],
                    ],
                    'storeData' => $form->storeData,
                    'defaultStatus' => $form->defaultStatus,
                    'collectIpAddresses' => $defaults->settings->dataStorage->collectIp->getValue(),
                ]
            );

            $propertyProvider->setObjectProperties(
                $behavior,
                [
                    'ajax' => $form->ajaxEnabled ?? true,
                    'showProcessingSpinner' => $defaults->settings->processing->showIndicator->getValue(),
                    'showProcessingText' => $defaults->settings->processing->showText->getValue(),
                    'processingText' => $defaults->settings->processing->processingText->getValue(),
                    'successBehavior' => $defaults->settings->successAndErrors->successBehavior->getValue(),
                    'successTemplate' => $defaults->settings->successAndErrors->successTemplate->getValue(),
                    'returnUrl' => $form->returnUrl,
                    'successMessage' => $validation->successMessage,
                    'errorMessage' => $validation->errorMessage,
                    'duplicateCheck' => $defaults->settings->limits->duplicateCheck->getValue(),
                ]
            );

            $metadata = [
                'general' => $general,
                'behavior' => $behavior,
            ];

            $this->update(
                '{{%freeform_forms}}',
                ['metadata' => $metadata],
                ['id' => $id],
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m230101_100010_FF4to5_MigrateForms cannot be reverted.\n";

        return false;
    }

    private function transformTemplate(string $template): string
    {
        return match ($template) {
            'basic-dark.twig' => 'basic-dark/index.twig',
            'basic-light.twig' => 'basic-light/index.twig',
            'basic-floating-labels.twig' => 'basic-floating-labels/index.twig',
            'bootstrap-5.twig', 'bootstrap-3.twig', 'bootstrap-4.twig' => 'bootstrap-5/index.twig',
            'bootstrap-5-dark.twig' => 'bootstrap-5-dark/index.twig',
            'bootstrap-5-floating-labels.twig' => 'bootstrap-5-floating-labels/index.twig',
            'bootstrap-5-multipage-all-fields.twig' => 'multipage-all-fields/index.twig',
            'conversational.twig' => 'conversational/index.twig',
            'foundation-6.twig' => 'foundation-6/index.twig',
            'tailwind-3.twig', 'tailwind-1.twig' => 'tailwind-3/index.twig',
            default => $template,
        };
    }
}
