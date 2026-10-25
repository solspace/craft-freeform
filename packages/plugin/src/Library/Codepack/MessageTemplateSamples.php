<?php

namespace Solspace\Freeform\Library\Codepack;

class MessageTemplateSamples
{
    private const TEMPLATES = [
        'success' => [
            'submission-received' => ['name' => 'Submission Received', 'fileName' => 'submission_received'],
            'contact-follow-up' => ['name' => 'Contact Follow-up', 'fileName' => 'contact_follow_up'],
            'booking-request' => ['name' => 'Booking Request', 'fileName' => 'booking_request'],
            'registration-received' => ['name' => 'Registration Received', 'fileName' => 'registration_received'],
        ],
        'email' => [
            'team-notification' => ['name' => 'Team Notification', 'fileName' => 'team_notification'],
            'visitor-confirmation' => ['name' => 'Visitor Confirmation', 'fileName' => 'visitor_confirmation'],
            'booking-request' => ['name' => 'Booking Request Alert', 'fileName' => 'booking_request_alert'],
            'support-request' => ['name' => 'Support Request Alert', 'fileName' => 'support_request_alert'],
        ],
    ];

    public static function options(string $type): array
    {
        return self::TEMPLATES[$type] ?? [];
    }

    public static function get(string $type, string $id): ?array
    {
        $sample = self::TEMPLATES[$type][$id] ?? null;
        if (!$sample) {
            return null;
        }

        return [
            ...$sample,
            'content' => file_get_contents(__DIR__.'/../../Resources/message-template-samples/'.$type.'/'.$id.'.twig'),
        ];
    }
}
