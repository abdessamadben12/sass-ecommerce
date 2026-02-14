<?php

namespace App\Http\Controllers;

use App\Mail\MarketingEmail;
use App\Models\Subscriber;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class MarketingEmailController extends Controller
{
    public function send(Request $request)
    {
        $data = $request->validate([
            'subject' => 'nullable|string|max:150|required_without:template_id',
            'content' => 'nullable|string|required_without:template_id',
            'target' => 'required|in:subscribers,users,admins,all_users',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'integer|exists:users,id',
            'admin_ids' => 'nullable|array',
            'admin_ids.*' => 'integer|exists:users,id',
            'subscriber_emails' => 'nullable|array',
            'subscriber_emails.*' => 'email',
            'template_id' => 'nullable|integer',
            'template_variables' => 'nullable|array',
        ]);

        if ($data['target'] === 'users' && empty($data['user_ids'])) {
            return response()->json([
                'message' => 'user_ids is required when target is users.'
            ], 422);
        }

        $subject = $data['subject'] ?? null;
        $content = $data['content'] ?? null;

        if (!empty($data['template_id'])) {
            $template = DB::table('templates')
                ->select('id', 'name', 'type', 'content')
                ->where('id', $data['template_id'])
                ->first();

            if (!$template) {
                return response()->json([
                    'message' => 'Template introuvable.'
                ], 422);
            }

            if (!str_starts_with((string) $template->type, 'email_')) {
                return response()->json([
                    'message' => 'Le template doit être de type email.'
                ], 422);
            }

            $subject = $subject ?: (string) ($template->name ?: 'Marketing Campaign');
            $content = $this->replaceTemplateVariables(
                (string) $template->content,
                $data['template_variables'] ?? []
            );
        }

        if (!$subject || !$content) {
            return response()->json([
                'message' => 'subject/content ou template_id est requis.'
            ], 422);
        }

        $query = match ($data['target']) {
            'subscribers' => !empty($data['subscriber_emails'])
                ? Subscriber::query()->select('email')->whereIn('email', $data['subscriber_emails'])
                : Subscriber::query()->select('email'),
            'users' => User::query()->select('email', 'name')->whereIn('id', $data['user_ids']),
            'admins' => !empty($data['admin_ids'])
                ? User::query()->select('email', 'name')->where('role', 'admin')->whereIn('id', $data['admin_ids'])
                : User::query()->select('email', 'name')->where('role', 'admin'),
            'all_users' => User::query()->select('email', 'name'),
        };

        $sent = 0;
        $query->chunk(200, function ($rows) use ($subject, $content, &$sent) {
            foreach ($rows as $row) {
                $personalizedContent = $this->personalizeContentForRecipient($content, $row);
                Mail::to($row->email)->send(new MarketingEmail($subject, $personalizedContent));
                $sent++;
            }
        });

        return response()->json([
            'message' => 'Marketing email sent',
            'sent' => $sent,
        ]);
    }

    private function replaceTemplateVariables(string $content, array $variables): string
    {
        foreach ($variables as $key => $value) {
            if (is_array($value) || is_object($value)) {
                continue;
            }
            $content = $this->replacePlaceholder($content, (string) $key, (string) $value);
        }

        return $content;
    }

    private function personalizeContentForRecipient(string $content, object $row): string
    {
        $email = (string) ($row->email ?? '');
        $name = trim((string) ($row->name ?? ''));

        if ($name === '' && $email !== '') {
            $name = explode('@', $email)[0] ?? '';
        }

        $content = $this->replacePlaceholder($content, 'name', $name ?: 'Client');
        $content = $this->replacePlaceholder($content, 'email', $email);

        return $content;
    }

    private function replacePlaceholder(string $content, string $key, string $value): string
    {
        $pattern = '/\{\{\s*' . preg_quote($key, '/') . '\s*\}\}/i';
        return (string) preg_replace($pattern, $value, $content);
    }
}
