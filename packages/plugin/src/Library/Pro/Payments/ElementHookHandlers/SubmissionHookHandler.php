<?php

namespace Solspace\Freeform\Library\Pro\Payments\ElementHookHandlers;

use craft\events\DefineSourceTableAttributesEvent;
use craft\events\RegisterElementActionsEvent;
use craft\events\SetElementTableAttributeHtmlEvent;
use craft\helpers\ElementHelper;
use craft\services\ElementSources;
use Solspace\Freeform\Elements\Actions\Pro\Payments\FixPaymentsAction;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Implementations\Pro\Payments\CreditCardDetailsField;
use Solspace\Freeform\Fields\Interfaces\PaymentInterface as FieldPaymentInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Payments\PaymentInterface;
use yii\base\Event;

class SubmissionHookHandler
{
    public const COLUMN_STATUS = 'paymentStatus';
    public const COLUMN_TYPE = 'paymentType';
    public const COLUMN_CARD = 'paymentCard';

    public const ATTRIBUTES = [
        self::COLUMN_TYPE => 'Payment Type',
        self::COLUMN_STATUS => 'Payment Status',
        self::COLUMN_CARD => 'Payment Card',
    ];

    public const TEMPLATE_FOLDER = 'freeform/_components/fields';

    /**
     * Register hooks on Submission element handled by this class.
     */
    public static function registerHooks()
    {
        Event::on(
            ElementSources::class,
            ElementSources::EVENT_DEFINE_SOURCE_TABLE_ATTRIBUTES,
            [self::class, 'injectTableColumns']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_SET_TABLE_ATTRIBUTE_HTML,
            [self::class, 'renderTableColumns']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_REGISTER_SORT_OPTIONS,
            [self::class, 'removePaymentFromSortOptions']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_REGISTER_ACTIONS,
            [self::class, 'registerPaymentActions']
        );
    }

    /**
     * Unregisters all previously registered hooks.
     */
    public static function unregisterHooks()
    {
        Event::off(
            Submission::class,
            Submission::EVENT_REGISTER_TABLE_ATTRIBUTES
        );

        Event::off(
            Submission::class,
            Submission::EVENT_SET_TABLE_ATTRIBUTE_HTML
        );

        Event::off(
            Submission::class,
            Submission::EVENT_REGISTER_SORT_OPTIONS
        );

        Event::off(
            Submission::class,
            Submission::EVENT_REGISTER_ACTIONS
        );
    }

    /**
     * Handler for RegisterElementTableAttributesEvent from Submission element.
     *
     * @param SetElementTableAttributeHtmlEvent $event
     */
    public static function injectTableColumns(DefineSourceTableAttributesEvent $event)
    {
        if (Submission::class === $event->elementType) {
            if (preg_match('/^form:(\d+)$/', $event->source, $matches)) {
                $formId = (int) $matches[1];
                $form = Freeform::getInstance()->forms->getFormById($formId);

                if (!$form) {
                    return;
                }

                if ($form->getForm()->getLayout()->hasFields(CreditCardDetailsField::class)) {
                    foreach (self::ATTRIBUTES as $attribute => $label) {
                        $event->attributes[$attribute] = ['label' => Freeform::t($label)];
                    }
                }
            }
        }
    }

    /**
     * Handler for SetElementTableAttributeHtmlEvent from Submission element.
     */
    public static function renderTableColumns(SetElementTableAttributeHtmlEvent $event)
    {
        $html = null;
        $attribute = $event->attribute;

        if (\in_array($attribute, array_keys(self::ATTRIBUTES))) {
            $payment = self::getPayment($event);
            $html = self::renderColumn($attribute, $payment);
        } elseif ($event->sender->{$attribute}) {
            $field = $event->sender->{$attribute};
            if ($field instanceof FieldPaymentInterface) {
                $payment = self::getPayment($event);
                $html = self::renderColumn(self::COLUMN_TYPE, $payment);
            }
        }

        if (!$html) {
            return;
        }

        $event->html = $html;
        $event->handled = true;
    }

    /**
     * Returns html for submission payments column.
     *
     * @param PaymentInterface $payment
     */
    public static function renderColumn(string $attribute, PaymentInterface $payment = null): string
    {
        $template = self::getTemplatePath($attribute);

        return \Craft::$app->view->renderTemplate($template, ['payment' => $payment]);
    }

    /**
     * Generates template path for submission payment column.
     */
    public static function getTemplatePath(string $attribute): string
    {
        return self::TEMPLATE_FOLDER.'/'.$attribute.'.html';
    }

    /**
     * Returns Payment for a submission event.
     *
     * @return PaymentInterface
     */
    public static function getPayment(Event $event)
    {
        $submission = $event->sender;
        $submissionId = $submission->getId();

        $payment = Freeform::getInstance()->subscriptions->getBySubmissionId($submissionId);
        if (!$payment) {
            $payment = Freeform::getInstance()->payments->getBySubmissionId($submissionId);
        }

        return $payment;
    }

    public static function removePaymentFromSortOptions(Event $event)
    {
        $injectedColumns = array_keys(self::ATTRIBUTES);
        $sortOptions = $event->sortOptions;

        $event->sortOptions = array_reduce(
            array_keys($sortOptions),
            function ($carry, $key) use ($injectedColumns, $sortOptions) {
                if (!\in_array($key, $injectedColumns)) {
                    $carry[$key] = $sortOptions[$key];
                }

                return $carry;
            },
            []
        );
    }

    /**
     * @throws ComposerException
     */
    public static function registerPaymentActions(RegisterElementActionsEvent $event)
    {
        // show action only for forms with payments configured
        $source = ElementHelper::findSource(Submission::class, $event->source);
        if ('*' == $source['key']) {
            return;
        }
        $form = Freeform::getInstance()->forms->getFormByHandle($source['data']['handle']);
        $paymentFields = $form->getLayout()->getFields(PaymentInterface::class);
        if (\count($paymentFields) > 0) {
            $event->actions[] = FixPaymentsAction::class;
        }
    }
}
