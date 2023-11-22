<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Stripe;

use craft\helpers\UrlHelper;
use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapItem;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\PaymentGatewayIntegration;
use Solspace\Freeform\Library\Payments\PaymentInterface;
use Stripe as StripeAPI;
use Stripe\StripeClient;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Stripe',
    type: Type::TYPE_PAYMENT_GATEWAYS,
    iconPath: __DIR__.'/icon.svg',
)]
class Stripe extends PaymentGatewayIntegration
{
    public const LOG_CATEGORY = 'Stripe';

    public const CATEGORY_CUSTOMER = 'customer';
    public const CATEGORY_ADDRESS = 'address';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Public Key',
        instructions: 'Enter your Stripe public key here.',
    )]
    protected string $publicKey = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Secret Key',
        instructions: 'Enter your Stripe secret key here.',
    )]
    protected string $secretKey = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'Webhook Secret',
        instructions: 'Enter your Stripe webhook secret here.',
    )]
    protected string $webhookSecret = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Suppress Email Notifications & Integrations when Payments Fail',
        instructions: 'Failed payments will still be stored as submissions, but enabling this will suppress email notifications and API integrations from being sent.',
    )]
    protected bool $suppressOnFail = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Send Success Email from Stripe to Submitter',
        instructions: "When enabled, Freeform will pass off the submitter's email address to Stripe's 'receipt_email' field, which will then automatically trigger Stripe sending a success email notification.",
    )]
    protected bool $sendOnSuccess = true;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[Input\Special\Properties\FieldMapping(
        label: 'Customer Mapping',
        instructions: 'Map your form fields to Stripe Customer fields.',
        source: 'api/stripe/fields/'.self::CATEGORY_CUSTOMER,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $customerMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[Input\Special\Properties\FieldMapping(
        label: 'Customer Address Mapping',
        instructions: 'Map your form fields to Stripe Customer Address fields.',
        source: 'api/stripe/fields/'.self::CATEGORY_ADDRESS,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $addressMapping = null;

    public function getPublicKey(): string
    {
        return $this->getProcessedValue($this->publicKey);
    }

    public function getSecretKey(): string
    {
        return $this->getProcessedValue($this->secretKey);
    }

    public function getWebhookSecret(): string
    {
        return $this->getProcessedValue($this->webhookSecret);
    }

    public function isSuppressOnFail(): bool
    {
        return $this->suppressOnFail;
    }

    public function isSendOnSuccess(): bool
    {
        return $this->sendOnSuccess;
    }

    public function getWebhookUrl(): string
    {
        return UrlHelper::url('freeform/payment-webhooks/stripe/'.$this->getId());
    }

    public function checkConnection(Client $client): bool
    {
        try {
            $charges = $this->getStripeClient()->charges->all(['limit' => 1]);
        } catch (\Exception $e) {
            throw new IntegrationException($e->getMessage(), $e->getCode(), $e->getPrevious());
        }

        return $charges instanceof StripeAPI\Collection;
    }

    /**
     * @return array<array{source: string, target: string}>
     */
    public function getMappedFieldHandles(Form $form): array
    {
        $map = [];

        $items = array_merge(
            $this->customerMapping?->getMapping() ?? [],
            $this->addressMapping?->getMapping() ?? [],
        );

        foreach ($items as $item) {
            $field = $form->get($item->getValue());

            $map[] = match ($item->getType()) {
                FieldMapItem::TYPE_RELATION => [
                    'source' => $item->getSource(),
                    'target' => $field?->getHandle(),
                ],
                default => [
                    'source' => $item->getSource(),
                ],
            };
        }

        return $map;
    }

    public function getMappedFieldValues(Form $form): array
    {
        $customerFields = $this->processMapping($form, $this->customerMapping, self::CATEGORY_CUSTOMER);
        $addressFields = $this->processMapping($form, $this->addressMapping, self::CATEGORY_ADDRESS);

        if (!empty($addressFields)) {
            $customerFields['address'] = $addressFields;
        }

        return $customerFields;
    }

    public function fetchFields(string $category): array
    {
        return match ($category) {
            self::CATEGORY_CUSTOMER => [
                new FieldObject('name', 'Full Name', FieldObject::TYPE_STRING, $category),
                new FieldObject('email', 'Email', FieldObject::TYPE_STRING, $category, true),
                new FieldObject('phone', 'Phone', FieldObject::TYPE_STRING, $category),
            ],
            self::CATEGORY_ADDRESS => [
                new FieldObject('line1', 'Address #1', FieldObject::TYPE_STRING, $category),
                new FieldObject('line2', 'Address #2', FieldObject::TYPE_STRING, $category),
                new FieldObject('city', 'City', FieldObject::TYPE_STRING, $category),
                new FieldObject('state', 'State', FieldObject::TYPE_STRING, $category),
                new FieldObject('postal_code', 'Zip', FieldObject::TYPE_STRING, $category),
                new FieldObject('country', 'Country', FieldObject::TYPE_STRING, $category),
            ],
            default => [],
        };
    }

    /**
     * Returns link to stripe dashboard for selected resource.
     *
     * @param string $resourceId stripe resource id
     * @param string $type       resource type
     */
    public function getExternalDashboardLink(string $resourceId, string $type): string
    {
        return match ($type) {
            PaymentInterface::TYPE_SINGLE => "https://dashboard.stripe.com/payments/{$resourceId}",
            PaymentInterface::TYPE_SUBSCRIPTION => "https://dashboard.stripe.com/subscriptions/{$resourceId}",
            default => '',
        };
    }

    public function getStripeClient(): StripeClient
    {
        static $clients = [];
        if (!isset($clients[$this->getId()])) {
            $clients[$this->getId()] = new StripeClient($this->getSecretKey());

            \Stripe\Stripe::setAppInfo(
                'solspace/craft-freeform',
                Freeform::getInstance()->getVersion(),
                'https://docs.solspace.com/craft/freeform'
            );
        }

        return $clients[$this->getId()];
    }

    public function getApiRootUrl(): string
    {
        return 'https://api.stripe.com/';
    }

    protected function getProcessableFields(string $category): array
    {
        $indexed = [];
        foreach ($this->fetchFields($category) as $field) {
            $indexed[$field->getHandle()] = $field;
        }

        return $indexed;
    }
}
