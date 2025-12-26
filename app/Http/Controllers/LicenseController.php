<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\License;
class LicenseController extends Controller
{
    public function getLicenses(Request $request)
    {
      $licenses=License::all();
      return response()->json($licenses);
    }

    // 🔹 Récupérer une licence par ID
    public function show($id)
    {
        $license = License::findOrFail($id);
        return response()->json($license);
    }

    // 🔹 Créer une nouvelle licence
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:licenses,slug',
            'description' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'usage_rights' => 'nullable|string',
            'price_multiplier' => 'required|numeric|min:0',
            'minimum_price' => 'required|numeric|min:0',
            'download_limit' => 'nullable|integer|min:0',
            'time_limit_days' => 'nullable|integer|min:0',
            'is_active' => 'required|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $license = License::create($validated);

        return response()->json(["message"=>"License created successfully"], 201);
    }

    // 🔹 Mettre à jour une licence
    public function update(Request $request, $id)
    {
        $license = License::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|min:3',
            'slug' => 'required|string|min:3',
            'description' => 'nullable|string|min:3',
            'terms_and_conditions' => 'required|string|min:3',
            'usage_rights' => 'required|string|min:3',
            'price_multiplier' => 'required|numeric|min:0',
            'minimum_price' => 'required|numeric|min:0',
            'download_limit' => 'nullable|integer|min:0',
            'time_limit_days' => 'nullable|integer|min:0|max:365',
            'is_active' => 'required|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $license->update($validated);

        return response()->json(["message"=>"License updated successfully"], 200);
    }

    // 🔹 Supprimer une licence
    public function destroy($id)
    {
        $license = License::findOrFail($id);
        $license->delete();

            return response()->json(["message"=>"License deleted successfully"], 200);
    }

    // 🔹 Activer/Désactiver une licence (optionnel)
    public function toggleStatus($id)
    {
        $license = License::findOrFail($id);
        $license->is_active = !$license->is_active;
        $license->save();

        return response()->json(['message' => 'License status updated.', 'status' => $license->is_active]);
    }
    public function licenseByName(){
        $licenses=License::all();
        $licenseNames=[];
        foreach($licenses as $index => $license){
            $licenseNames[$index]["name"]=$license["name"];
            $licenseNames[$index]["id"]=$license["id"];
        }
        return response()->json($licenseNames,200);
    }
}


