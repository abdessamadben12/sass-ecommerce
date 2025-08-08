<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
   {
    $name = $request->input('name');
    $query = Categorie::query();
    $per_Page=$request->input("per_page");
   if ($name) {
        $query->where('name', 'like', "%{$name}%");
    }
 $categories = $query->withCount('products')->paginate($per_Page);

// Modifier les icônes dans les résultats paginés
$categories->getCollection()->transform(function ($categorie) {
    if ($categorie->icon) {
        $categorie->icon = Storage::disk("spaces_2")->url($categorie->icon);
    }
    return $categorie;
});
return response()->json($categories,200);
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
           $validated = $request->validate([
        'name'              => 'required|string|max:255|unique:categories,name',
        'slug'              => 'required|string|max:255|unique:categories,slug',
        'parent_id'         => 'nullable|exists:categories,id',
        'level'             => 'nullable|integer|min:0',
        'path'              => 'nullable|string|max:500',
        'description'       => 'nullable|string',
        'icon'              => 'nullable|file|image|mimes:jpg,jpeg,png,svg|max:2048',
        'meta_title'        => 'nullable|string|max:255',
        'meta_description'  => 'nullable|string|max:500',
        'is_active'         => 'boolean',
    ]);
        $path=Storage::disk("spaces_2")->put(dirname('categorie/icon'),$request->file('icon'));
        $validated["icon"]=$path;
          Categorie::create($validated);
        return response()->json(["message"=>"categorie created"], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Categorie $categorie)
    {
            $categorie->icon=Storage::disk("spaces_2")->url($categorie->icon);
            return response()->json($categorie,200);
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,Categorie $categorie)
    {
         if ($request->parent_id === 'null' || $request->parent_id === '') {
        $request->merge(['parent_id' => null]);
    }
         $validated = $request->validate([
        'name'              => ['nullable','string','max:255',Rule::unique('categories','name')->ignore($categorie->id)],
        'slug'              =>  ['nullable','string','max:255',Rule::unique('categories','slug')->ignore($categorie->id)],
        'parent_id'         => 'nullable|exists:categories,id',
        'level'             => 'nullable|integer|min:0',
        'path'              => 'nullable|string|max:500',
        'description'       => 'nullable|string',
        'icon'              => 'nullable|file|image|mimes:jpg,jpeg,png,svg|max:2048',
        'meta_title'        => 'nullable|string|max:255',
        'meta_description'  => 'nullable|string|max:500',
        'is_active'         => 'boolean',
    ]);
     if ($request->hasFile('icon')) {
        // Supprimer l'ancien fichier s'il existe
        if (Storage::disk("spaces_2")->exists($categorie->icon)) {
            Storage::disk("spaces_2")->delete($categorie->icon);
        }

        // Uploader le nouveau fichier
        $path = Storage::disk("spaces_2")->put('categorie/icon', $request->file('icon'));
        $validated["icon"] = $path;
    }
    $categorie->update($validated);

    return response()->json($validated,200);
        
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Categorie $categorie)
    {
$hasChildren = Categorie::where("parent_id", $categorie->id)->exists();

if ($hasChildren) {
    // C’est un parent → détacher les enfants
    Categorie::where("parent_id", $categorie->id)->update([
        'parent_id' => null,
        'level' => 0
    ]);
}

if ($categorie->icon && Storage::disk("spaces_2")->exists($categorie->icon)) {
    Storage::disk("spaces_2")->delete($categorie->icon);
}
        $categorie->delete();
        return response()->json(["message"=>"categorie deleted"],200);
    }
     public function parentcategory(){
           $categories = Categorie::with('parent')->get();

    $formatted = $categories->map(function ($cat) {
        return [
            'id' => $cat->id,
            'name' => $cat->name,
            'parent_id' => $cat->parent_id,
            'level' => $cat->parent_id
        ];
    });

    return response()->json($formatted,200);
     }

      public function categoryByName(){
        $categories=Categorie::all();
        $categoryNames=[];
        foreach($categories as $index => $category){
            $categoryNames[$index]["name"]=$category["name"];
            $categoryNames[$index]["id"]=$category["id"];
        }
        return response()->json($categoryNames,200);
     }
     
}
