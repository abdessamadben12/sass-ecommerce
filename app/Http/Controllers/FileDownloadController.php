<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class FileDownloadController extends Controller
{
    public function downloadFile(Request $request)
    {
        $path = $request->query("url");
        $name = $request->name;
    
        if ($path && $name) {
            if (!Storage::disk('spaces_2')->exists($path)) {
                return abort(404, 'Fichier introuvable');
            }
    
            return Storage::disk('spaces_2')->download($path, $name);
        }
    
        return abort(404,"File Not Found");
    }
   
}
