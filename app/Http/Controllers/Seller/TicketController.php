<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketReply;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class TicketController extends Controller
{
    public function index(Request $request): View
    {
        $query = Ticket::where('user_id', auth()->id());

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $tickets = $query->latest()->paginate(15);

        return view('seller.tickets.index', compact('tickets'));
    }

    public function create(): View
    {
        return view('seller.tickets.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:20',
            'priority' => 'required|in:low,medium,high,critical',
            'type' => 'required|in:report,support,feature_request',
        ]);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-' . strtoupper(uniqid()),
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'priority' => $request->priority,
            'status' => 'new',
            'user_id' => auth()->id(),
        ]);

        return redirect()
            ->route('seller.tickets.show', $ticket)
            ->with('success', 'Ticket cree avec succes.');
    }

    public function show(Ticket $ticket): View
    {
        abort_if($ticket->user_id !== auth()->id(), 403);

        $ticket->load(['messageReplay.user']);

        return view('seller.tickets.show', compact('ticket'));
    }

    public function reply(Request $request, Ticket $ticket): RedirectResponse
    {
        abort_if($ticket->user_id !== auth()->id(), 403);

        $request->validate([
            'message' => 'required|string|min:5',
        ]);

        TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => auth()->id(),
            'message' => $request->message,
        ]);

        if ($ticket->status === 'resolved' || $ticket->status === 'closed') {
            $ticket->update(['status' => 'in_progress']);
        }

        return back()->with('success', 'Reponse envoyee.');
    }
}
