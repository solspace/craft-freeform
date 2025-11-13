<?php

namespace Solspace\Freeform\Tests\Library\Helpers;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Helpers\GibberishHelper;

#[CoversClass(GibberishHelper::class)]
class GibberishHelperTest extends TestCase
{
    public array $allowedTerms = [
        'MDSDMDPV',
    ];

    public function testFixtures(): void
    {
        foreach ($this->getTestFixtures() as $fixture) {
            $anyGibberish = false;
            $reports = [];

            foreach ($fixture['payload'] as $key => $value) {
                if (null === $value || '' === $value) {
                    continue;
                }

                $analysis = GibberishHelper::analyzeGibberish((string) $value, 6, $this->allowedTerms);
                $reports[$key] = $analysis;

                if (!empty($analysis['is_gibberish'])) {
                    $anyGibberish = true;
                }
            }

            $message = 'Payload: '.json_encode($fixture['payload']).' | Report: '.json_encode($reports);

            if (!empty($fixture['contains_gibberish'])) {
                $this->assertTrue($anyGibberish);
            } else {
                $this->assertFalse($anyGibberish, $message);
            }
        }
    }

    private function getTestFixtures(): array
    {
        return [
            // --- Readable English (should PASS) ---
            [
                'payload' => [
                    'state' => 'ny',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'state' => 'CA',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'state' => 'us',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'state' => 'tues',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'state' => 'dutch',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'state' => 'amy',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'state' => 'eva',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'state' => 'euro',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'state' => 'peru',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'state' => 'iraq',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'message' => 'cat',
                ],
                'contains_gibberish' => false,
            ],
            [
                'label' => 'I love this website',
                'payload' => [
                    'message' => 'I love this website',
                ],
                'contains_gibberish' => false,
            ],
            [
                'label' => "wouldn't",
                'payload' => [
                    'message' => "wouldn't",
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'message' => "shouldn't",
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'message' => "industry's",
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'message' => "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'lastname' => "O'Connor",
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'full_name' => "Kevin O'Connor",
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'lastname' => 'McDonald',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'fullname' => 'Conor Fanneran',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'firstname' => 'DeAngelo',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'fullname' => 'Jason Moloney',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'firstname' => 'LeBron',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'phone' => '020 7946 0018',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'message' => 'typesetting',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'message' => 'essentially',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'firstname' => 'Cat',
                    'lastname' => 'Cole',
                    'email' => 'cat.cole@gmail.com',
                    'custom_field_1' => 'Test 1',
                    'custom_field_2' => 'Test 2',
                    'custom_field_3' => 'Test 3',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'full_name' => 'Jose Davidi',
                    'email' => 'jdavidi@gmail.com',
                    'phone' => '3797160043',
                    'company_name' => 'Swiss Cheese Co',
                    'company_zip_code' => '48881',
                    'how_can_we_help_you' => 'Our MDSDMDPV 310080 Mitsubishi drive needs rebuilt. Can you quote turnaround?',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'full_name' => 'Amelia Clarke',
                    'email' => 'amelia.clarke@example.co.uk',
                    'phone' => '07400111222',
                    'company_name' => 'Clarke Engineering',
                    'company_zip_code' => 'SW1A 1AA',
                    'how_can_we_help_you' => 'Looking for CNC training availability in November.',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'full_name' => 'Joseph Johnson',
                    'email' => 'jbjohnson@piicnc.com',
                    'phone' => '3178508930',
                    'company_name' => 'Paramount Industrial',
                    'company_zip_code' => '46203',
                    'how_can_we_help_you' => '',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'full_name' => 'Priya Nair',
                    'email' => 'priya.nair@kuka-automation.in',
                    'phone' => '+1 (407) 555-8822',
                    'company_name' => 'KUKA Automation India',
                    'company_zip_code' => '32801',
                    'how_can_we_help_you' => 'Please review our RFP at https://example.org/rfp.pdf and confirm scope.',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'full_name' => 'Ben Lee',
                    'email' => 'ben@leemetal.com',
                    'phone' => '+44 7700 900111',
                    'company_name' => 'Lee Metal',
                    'company_zip_code' => 'M1 2AB',
                    'how_can_we_help_you' => 'Quote please for spindle repair.',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'email' => 'cat.astrophe207@gmail.com',
                    'honeypot' => '',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'full_name' => 'Local Tester',
                    'email' => 'tester@local.dev',
                    'phone' => '07400900333',
                    'company_name' => 'Dev Env',
                    'company_zip_code' => 'AB1 2CD',
                    'how_can_we_help_you' => 'Testing locally, please ignore.',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'full_name' => 'Tom R',
                    'email' => 'tomr@example.net',
                    'phone' => '07700900111',
                    'company_name' => 'TR Ltd',
                    'company_zip_code' => 'AB1 2CD',
                    'how_can_we_help_you' => 'Hello, this is a test message for spam filter repetition.',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'full_name' => 'IT Support',
                    'email' => 'itsupport@corp-mailer.com',
                    'phone' => '5551231234',
                    'company_name' => 'Support',
                    'company_zip_code' => '00000',
                    'how_can_we_help_you' => 'Please verify your account password here: http://corp-mailer.com/verify',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'full_name' => 'Sarah P',
                    'email' => 'sarahp@mailinator.com',
                    'phone' => '07400999123',
                    'company_name' => 'Self',
                    'company_zip_code' => 'EC1A 1BB',
                    'how_can_we_help_you' => 'Hi can you contact me about pricing?',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'full_name' => 'Free Money!!!',
                    'email' => 'promo@tempmail.com',
                    'phone' => '9999999999',
                    'company_name' => '💰💰💰',
                    'company_zip_code' => '0000',
                    'how_can_we_help_you' => 'WIN BIG NOW 👉 https://spam.biz http://spam.co free gift!!!',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'message' => 'Please verify your account at https://ex.amp/le',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'message' => 'popularised',
                ],
                'contains_gibberish' => false,
            ],
            [
                'payload' => [
                    'message' => 'popularized',
                ],
                'contains_gibberish' => false,
            ],
            // --- Gibberish (should FAIL) ---
            [
                'payload' => [
                    'full_name' => 'MCBTyJZoy',
                    'email' => 'tunivuya94@gmail.com',
                    'phone' => '2070301291',
                    'company_name' => 'bIEFbZls',
                    'company_zip_code' => 'abAQAIajhVVXo',
                    'how_can_we_help_you' => 'VCprntbWZpZgPm',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'full_name' => 'kHSckpHEAYjO',
                    'email' => 'tunivuya94@gmail.com', // repeat
                    'phone' => '5656943861',
                    'company_name' => 'oMyOJvwmVKXCyjZ',
                    'company_zip_code' => 'DVsLTYPVtz',
                    'how_can_we_help_you' => 'OlSbMCboVCmPu',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'full_name' => 'Content Outreach',
                    'email' => 'outreach@best-seo-links.shop',
                    'phone' => '0000000000',
                    'company_name' => 'TopRankers',
                    'company_zip_code' => 'N/A',
                    'how_can_we_help_you' => 'We can place dofollow backlinks on Forbes & CNN. See https://best-seo-links.shop/offer.',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'full_name' => 'ВыгоднаяСделка',
                    'email' => 'promo@yopmail.com',
                    'phone' => '8337608946',
                    'company_name' => 'ЛучшаяКомпания',
                    'company_zip_code' => 'vzsHrmroxOz',
                    'how_can_we_help_you' => 'Купи сейчас! Скидка 90% #@@',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'full_name' => 'OVdFPmUF',
                    'email' => 'xilojeju237@gmail.com',
                    'phone' => '4079079846',
                    'company_name' => 'QKvVOEdDeiAMgba',
                    'company_zip_code' => 'wfdlzEuvEEZiSDY',
                    'how_can_we_help_you' => 'mQJYspqJugGtnXRt',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'full_name' => 'LlCSEgInkFNufMQ',
                    'email' => 'ops@manufacture.us',
                    'phone' => '8337608946',
                    'company_name' => 'eyZZbvUC',
                    'company_zip_code' => 'vzsHrmroxOz',
                    'how_can_we_help_you' => 'We need a call about training schedule and costs next week.',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'full_name' => 'LlCSEgInkFNufMQ',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'firstname' => 'fdghdfhdfhdgf',
                    'lastname' => 'fdgh fghfgh',
                    'tel' => '01234567890',
                    'email' => 'sdfsdfds@ghjhkf.hh',
                    'message' => 'fdgh df hdfasdd kjlhjk jkj asdd hdgf',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'firstname' => 'asd',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'firstname' => 'zzzzzzz',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'firstname' => 'asdasdasd',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'firstname' => 'zxcvwerjasc',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'firstname' => 'vzsHrmroxOz',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'firstname' => 'eyZZbvUC',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'firstname' => 'LlCSEgInkFNufMQ',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'firstname' => 'fdghdfhdfhdgf',
                ],
                'contains_gibberish' => true,
            ],
            [
                'payload' => [
                    'firstname' => 'bcdcdfghjklmnp',
                ],
                'contains_gibberish' => true,
            ],
        ];
    }
}
