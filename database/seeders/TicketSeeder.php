<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('ticket_replies')->delete();
        DB::table('tickets')->delete();
        $now     = Carbon::now();
        $userIds = DB::table('users')->whereIn('role', ['buyer', 'seller'])->pluck('id')->toArray();
        $adminId = DB::table('users')->where('role', 'admin')->value('id');

        $types      = ['report', 'support', 'feature_request'];
        $priorities = ['low', 'medium', 'high', 'critical'];
        $statuses   = ['new', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'];

        $ticketTitles = [
            'Cannot download my purchase',
            'Payment not processed',
            'File is corrupted',
            'Need refund for order',
            'Account login issue',
            'Product not as described',
            'Request to add new category',
            'Billing statement incorrect',
            'Shop not visible in search',
            'Withdrawal not received',
        ];

        $ticketBodies = [
            'I have been trying to download my purchase for the past hour but keep getting an error.',
            'My payment was deducted but the order shows as pending.',
            'The file I downloaded seems to be corrupted. Please help.',
            'The product does not match the preview images shown.',
            'I cannot log into my account despite resetting my password.',
            'I would like to request a refund for order #1234.',
        ];

        $replyTexts = [
            'Thank you for contacting us. We are looking into this.',
            'We have escalated this to our technical team.',
            'Your issue has been resolved. Please let us know if you need further assistance.',
            'Could you provide more details about the problem?',
            'We apologize for the inconvenience. A refund has been processed.',
        ];

        $tickets = [];
        for ($i = 1; $i <= 300; $i++) {
            $status    = $statuses[array_rand($statuses)];
            $createdAt = $now->copy()->subDays(rand(1, 400));
            $tickets[] = [
                'ticket_number'      => 'TKT-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'title'              => $ticketTitles[array_rand($ticketTitles)],
                'description'        => $ticketBodies[array_rand($ticketBodies)],
                'type'               => $types[array_rand($types)],
                'priority'           => $priorities[array_rand($priorities)],
                'status'             => $status,
                'user_id'            => $userIds[array_rand($userIds)],
                'assigned_to'        => in_array($status, ['assigned', 'in_progress', 'resolved', 'closed']) ? $adminId : null,
                'resolved_at'        => in_array($status, ['resolved', 'closed']) ? $createdAt->copy()->addDays(rand(1, 10)) : null,
                'satisfaction_score' => in_array($status, ['resolved', 'closed']) ? rand(1, 5) : null,
                'attachments'        => null,
                'created_at'         => $createdAt,
                'updated_at'         => $createdAt,
            ];
        }

        foreach (array_chunk($tickets, 100) as $chunk) {
            DB::table('tickets')->insert($chunk);
        }

        // ── Ticket Replies ────────────────────────────────────
        $ticketIds = DB::table('tickets')->pluck('id')->toArray();
        $replies   = [];
        foreach ($ticketIds as $tid) {
            $replyCount = rand(0, 4);
            for ($r = 0; $r < $replyCount; $r++) {
                $isAdmin = rand(0, 1) === 1;
                $replies[] = [
                    'ticket_id'   => $tid,
                    'user_id'     => $isAdmin ? $adminId : $userIds[array_rand($userIds)],
                    'message'     => $replyTexts[array_rand($replyTexts)],
                    'is_internal' => $isAdmin,
                    'is_edited'   => false,
                    'created_at'  => $now->copy()->subDays(rand(0, 10)),
                    'updated_at'  => $now,
                ];
            }
        }

        foreach (array_chunk($replies, 200) as $chunk) {
            DB::table('ticket_replies')->insert($chunk);
        }
    }
}
