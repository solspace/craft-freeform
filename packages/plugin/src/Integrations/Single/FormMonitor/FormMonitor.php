<?php

namespace Solspace\Freeform\Integrations\Single\FormMonitor;

use craft\helpers\DateTimeHelper;
use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Boolean;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\EmailValueGenerator;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\SiteNameValueGenerator;
use Solspace\Freeform\Integrations\Single\FormMonitor\Transformers\ManifestTransformer;
use Solspace\Freeform\Library\Integrations\APIIntegration;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Form Monitor',
    type: Type::TYPE_SINGLE,
    version: 'v1',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class FormMonitor extends APIIntegration
{
    #[Required]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Boolean(
        label: 'Test Email Notifications',
        instructions: 'Allow Form Monitor to test any email notifications configured for this form.',
        order: 5
    )]
    protected bool $testEmails = true;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Boolean(
        label: 'Test Email Notifications on Live Environment only',
        instructions: 'When enabled, Form Monitor will only test email notifications when the Craft environment is set to production.',
        order: 7
    )]
    protected bool $liveOnly = true;

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Hidden]
    private string $apiKey = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Hidden]
    private string $requestToken = '';

    #[Required]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Text(
        label: 'URL the Form Monitor should access to check the form',
        instructions: 'This is the URL that Form Monitor will use to check the form. It should be a publicly accessible URL and contain the form.',
        placeholder: 'https://example.com/contact-us',
    )]
    private string $testUrl = '';

    #[Required]
    #[ValueGenerator(EmailValueGenerator::class)]
    #[Input\Text(
        label: 'Notification Email',
        instructions: 'Email address to receive email alerts and other notifications for the form.',
        placeholder: 'notices@example.com',
    )]
    private string $email = '';

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[ValueGenerator(SiteNameValueGenerator::class)]
    #[Input\Text(
        label: 'Site Name',
        instructions: 'The name of your Craft site. Form Monitor will use this in email notifications.',
        order: 6,
        placeholder: 'My Craft Site'
    )]
    private string $siteName = '';

    public function getApiKey(): string
    {
        return $this->apiKey;
    }

    public function setApiKey(string $apiKey): self
    {
        $this->apiKey = $apiKey;

        return $this;
    }

    public function getRequestToken(): string
    {
        return $this->requestToken;
    }

    public function setRequestToken(string $requestToken): void
    {
        $this->requestToken = $requestToken;
    }

    public function getTestUrl(): string
    {
        return $this->getProcessedValue($this->testUrl);
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getSiteName(): string
    {
        return $this->siteName;
    }

    public function getTestEmails(): bool
    {
        return $this->testEmails;
    }

    public function getLiveOnly(): bool
    {
        return $this->liveOnly;
    }

    public function getApiRootUrl(): string
    {
        return 'https://api.formmonitor.com/v1';
    }

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/me'));

            return 200 === $response->getStatusCode();
        } catch (\Exception $exception) {
            return false;
        }
    }

    public function disableMe(Client $client): void
    {
        $endpoint = $this->getEndpoint('/me');
        $client->patch($endpoint);
    }

    public function deleteMe(Client $client): void
    {
        $endpoint = $this->getEndpoint('/me');
        $client->delete($endpoint);
    }

    public function acknowledgeSubmission(Client $client, Form $form, Submission $submission, string $requestId): void
    {
        $isSuccessful = !$form->hasErrors() && $submission->getId();
        $errors = [];

        if (!$isSuccessful) {
            $fieldErrors = [];
            foreach ($form->getLayout()->getFields() as $field) {
                if ($field->hasErrors()) {
                    $fieldErrors[$field->getHandle()] = $field->getErrors();
                }
            }

            $errors = [
                'fields' => $fieldErrors,
                'form' => $form->getErrors(),
            ];
        }

        $payload = [
            'requestId' => $requestId,
            'submissionId' => $submission->getId(),
            'status' => $isSuccessful ? 'success' : 'fail',
            'errors' => $errors,
        ];

        if ($this->getLiveOnly()) {
            $payload['environment'] = [
                'isProduction' => 'production' === strtolower(\Craft::$app->getConfig()->env),
            ];
        }

        $endpoint = $this->getEndpoint('/submissions/acknowledgement');
        $client->post(
            $endpoint,
            [
                'json' => $payload,
            ]
        );
    }

    public function fetchTests(Client $client, Form $form, array $options = []): array
    {
        $endpoint = $this->getEndpoint('/forms/'.$form->getId().'/tests');
        $response = $client->get($endpoint, ['query' => $options]);
        $data = json_decode((string) $response->getBody(), true);

        $formatDate = function ($dateString) {
            if (!$dateString) {
                return null;
            }

            $date = DateTimeHelper::toDateTime($dateString);
            if (!$date) {
                return null;
            }

            return [
                'formatted' => \Craft::$app->getFormatter()->asDatetime(
                    $date,
                    \Craft::$app->getLocale()->getDateTimeFormat('short')
                ),
                'date' => $date->format('Y-m-d'),
            ];
        };

        $groupedTests = [];
        if (isset($data['tests']) && \is_array($data['tests'])) {
            // First pass: group tests by date
            foreach ($data['tests'] as $test) {
                $attemptedDates = $formatDate($test['dateAttempted'] ?? null);
                $completedDates = $formatDate($test['dateCompleted'] ?? null);

                if ($attemptedDates) {
                    $test['dateAttempted'] = $attemptedDates['formatted'];
                    $groupDate = $attemptedDates['date'];

                    if (!isset($groupedTests[$groupDate])) {
                        $groupedTests[$groupDate] = [
                            'date' => $groupDate,
                            'tests' => [],
                            'isInactive' => true,
                        ];
                    }
                }

                if ($completedDates) {
                    $test['dateCompleted'] = $completedDates['formatted'];
                }

                if (isset($groupDate)) {
                    $groupedTests[$groupDate]['tests'][] = $test;
                    $groupedTests[$groupDate]['isInactive'] = false;
                }
            }

            // Always create 30 days of data, starting from today
            $today = DateTimeHelper::now();
            $currentDate = clone $today;

            // Go back 29 days to have a total of 30 days including today
            for ($i = 0; $i < 30; ++$i) {
                $dateStr = $currentDate->format('Y-m-d');

                if (!isset($groupedTests[$dateStr])) {
                    $groupedTests[$dateStr] = [
                        'date' => $dateStr,
                        'tests' => [],
                        'isInactive' => true,
                    ];
                }

                $currentDate->modify('-1 day');
            }

            // Sort by date descending (today first)
            krsort($groupedTests);
            $data['tests'] = array_values($groupedTests);
        }

        if (isset($data['lastSubmission'])) {
            $lastAttempted = $formatDate($data['lastSubmission']['dateAttempted'] ?? null);
            $lastCompleted = $formatDate($data['lastSubmission']['dateCompleted'] ?? null);

            if ($lastAttempted) {
                $data['lastSubmission']['dateAttempted'] = $lastAttempted['formatted'];
            }
            if ($lastCompleted) {
                $data['lastSubmission']['dateCompleted'] = $lastCompleted['formatted'];
            }
        }

        if (isset($data['fmFormStats']['nextMonitoringTime'])) {
            $nextMonitoring = $formatDate($data['fmFormStats']['nextMonitoringTime']);
            if ($nextMonitoring) {
                $data['fmFormStats']['nextMonitoringTime'] = $nextMonitoring['formatted'];
            }
        }

        $data['enabled'] = $this->isEnabled();
        $data['url'] = $this->getTestUrl();
        $data['formId'] = $form->getId();

        $data['notifications'] = [
            'enabled' => $this->getTestEmails(),
        ];

        return $data;
    }

    public function fetchStats(Client $client, Form $form): array
    {
        $endpoint = $this->getEndpoint('/forms/'.$form->getId().'/stats');
        $response = $client->get($endpoint);

        return json_decode((string) $response->getBody(), true);
    }

    public function sendManifest(Client $client, Form $form, ManifestTransformer $transformer): void
    {
        $endpoint = $this->getEndpoint('forms/'.$form->getId());
        $payload = [
            'name' => $form->getName(),
            'url' => $this->getTestUrl(),
            'email' => $this->getEmail(),
            'manifest' => $transformer->transform($form),
            'enabled' => $this->isEnabled(),
            'testEmailsEnabled' => $this->getTestEmails(),
        ];

        $client->put($endpoint, ['json' => $payload]);
    }

    public function deleteManifest(Client $client, Form $form): void
    {
        $endpoint = $this->getEndpoint('forms/'.$form->getId().'/delete');
        $client->delete($endpoint);
    }

    public function disableManifest(Client $client, Form $form): void
    {
        $endpoint = $this->getEndpoint('forms/'.$form->getId().'/disable');
        $client->put($endpoint);
    }

    public function enableMonitoring(Client $client, Form $form): void
    {
        $endpoint = $this->getEndpoint('forms/'.$form->getId().'/enable');
        $client->put($endpoint);
    }

    public function deleteTest(Client $client, Form $form, int $testId): void
    {
        $endpoint = $this->getEndpoint('forms/'.$form->getId().'/tests/'.$testId);
        $client->delete($endpoint);
    }

    public function clearAllTests(Client $client, Form $form): void
    {
        $endpoint = $this->getEndpoint('forms/'.$form->getId().'/tests/all');
        $client->delete($endpoint);
    }

    protected function getProcessableFields(string $category): array
    {
        return [];
    }
}
