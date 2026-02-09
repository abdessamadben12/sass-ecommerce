<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(private array $data)
    {
    }

    public function build()
    {
        return $this->subject($this->data['title'] ?? 'Notification')
            ->view('emails.notification')
            ->with(['messageBody' => $this->data['message'] ?? '']);
    }
}
