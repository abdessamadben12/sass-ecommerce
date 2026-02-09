<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);
        $search = $request->input('q');
        $event = $request->input('event');
        $logName = $request->input('log_name');
        $from = $request->input('from');
        $to = $request->input('to');

        $query = Activity::query()->with(['causer', 'subject'])->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('event', 'like', "%{$search}%")
                    ->orWhere('log_name', 'like', "%{$search}%");
            });
        }

        if ($event) {
            $query->where('event', $event);
        }

        if ($logName) {
            $query->where('log_name', $logName);
        }

        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        $logs = $query->paginate($perPage);

        $logs->getCollection()->transform(function (Activity $activity) {
            return [
                'id' => $activity->id,
                'log_name' => $activity->log_name,
                'description' => $activity->description,
                'event' => $activity->event,
                'subject_type' => $activity->subject_type,
                'subject_id' => $activity->subject_id,
                'causer_type' => $activity->causer_type,
                'causer_id' => $activity->causer_id,
                'created_at' => $activity->created_at?->toDateTimeString(),
                'properties' => $activity->properties,
                'causer' => $activity->causer ? [
                    'id' => $activity->causer->id ?? null,
                    'name' => $activity->causer->name ?? null,
                    'email' => $activity->causer->email ?? null,
                ] : null,
            ];
        });

        return response()->json($logs);
    }
}
