<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\TicketService;


class TicketsController extends Controller
{
    public function index(Request $request)
    {
        // Logic to retrieve and display tickets
        $perPage = $request->input('per_page', 10);
        $status = $request->input('status', 'all');
        $searchQuery = $request->input('search', $request->input('name', ''));
        $sortBy = $request->input('sort_by', 'created_at');
        $query = Ticket::query();
        if($status !== 'all') {
            $query->where('status', $status);
        }
        if ($searchQuery) {
            $query->where(function ($q) use ($searchQuery) {
                $q->where('title', 'like', '%' . $searchQuery . '%')
                  ->orWhere('description', 'like', '%' . $searchQuery . '%');
            });
        }
         switch($sortBy){
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'priority':
                $query->orderByRaw("FIELD(priority, 'low', 'medium', 'high', 'critical')");
                break;
            case 'status':
                $query->orderByRaw("FIELD(status, 'new', 'assigned', 'in_progress', 'pending', 'resolved', 'closed')");
                break;
        }
        $tickets = $query->with(['user', 'assignedUser'])->paginate($perPage);
        $TotalallTickets = Ticket::count();
        $ProgssesTickets = Ticket::where('status', 'in_progress')->count();
        $newTickets = Ticket::where('status', 'new')->count();
        $resolvedTickets = Ticket::where('status', 'resolved')->count();
       

        return response()->json([
            'tickets' => $tickets,
            'total' => $TotalallTickets,
            'in_progress' => $ProgssesTickets,
            'new' => $newTickets,
            'resolved' => $resolvedTickets
        ], 200);
    }
    public function getTicketDetail($id)
    {
        $ticket = Ticket::with(['user', 'assignedUser', 'messageReplay'])->find($id);
        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }
        if($ticket->attachments){
            $attachments=$ticket->attachments;
            foreach($attachments as $index => $attachment){
            $path=$attachment["path"];
            $cleanPath=str_replace("//","/",$path);
            $attachments[$index]["url"]=Storage::disk("spaces_2")->url($cleanPath);
        } 
        $ticket->attachments=$attachments;
    }
     
        if($ticket->messageReplay !==[] && $ticket->messageReplay !== null ){
            foreach($ticket->messageReplay	 as $message){
            $attachments=$message->attachments;
            if($attachments){
                foreach($attachments as $index => $attachment){
                    $path=$attachment["path"];
                    $cleanPath=str_replace("//","/",$path);
                    $attachments[$index]["url"]=Storage::disk("spaces_2")->url($cleanPath);
                }
                $message->attachments=$attachments;
            }
        }
        }   
        
        return response()->json($ticket, 200);

    }
    public function createTicket(){
        return 0;
    }
 
    public function updateTicket($id,Request $request){
        $request->validate([
            "status"=>"required|in:new,assigned,in_progress,pending,resolved,closed",
            "priority"=>"required|in:low,medium,high,critical",
            "assigned_to"=>"nullable|exists:users,id",
        ]);
        $ticket = Ticket::findOrFail($id);
        $ticket->status = $request->status;
        $ticket->priority = $request->priority;
        if ($request->has('assigned_to')) {
            $ticket->assigned_to = $request->assigned_to;
        }
        $ticket->save();
        return response()->json(["message"=>"Ticket updated successfully","ticket"=>$ticket], 200);
    }
    public function deleteTicket($id)
    {
        $ticket = Ticket::findOrFail($id);
        $messages=$ticket->messageReplay;
        if($messages){
             foreach($messages as $index=> $reply){
                $service = new TicketService();
                $idMessage = $messages[$index]['id'];
                $service->deleteMessage($idMessage);
            }
        }
       $attachments=$ticket->attachments;
        if($attachments){
              foreach($attachments as $index=>$attachment){
            $path=$attachments[$index]["path"];
            $attachmentpath=str_replace("//","/",$path);
            $name=$attachments[$index]["name"];
            Storage::disk("spaces_2")->delete($attachmentpath);
        }
        }
      
        $ticket->delete();
        return response()->json(['message' => 'Ticket deleted successfully'], 200);
    }
    
}

