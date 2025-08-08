<?php
namespace App\Http\Controllers;

use App\Models\Template;
use App\Enums\TemplateType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Services\TemplateService;
use App\Models\User;

class TemplateController extends Controller
{
    public function __construct(
        private TemplateService $templateService
    ) {}

    /**
     * Liste des templates
     */
    public function index(Request $request)
    { 
        $perPage=$request->input('per_page',0);
        $query = Template::query();

        if($request->type !=="null" && $request->type !== null){
            $query->where('type', $request->type);
        }
        $templates = $query->paginate($perPage);
        return response()->json($templates);
    }

    /**
     * Créer un template
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::enum(TemplateType::class)],
            'content' => 'required|string',
            'variables' => 'array|nullable',
            'settings' => 'array|nullable',
            "tags"=>"array|nullable",
            "description"=>"string|nullable",
            "is_default"=>"boolean|nullable",
            "output_format"=>"string|nullable",
            "target_audience"=>"string|nullable",
            "css-content"=>"string|nullable",
            "js-content"=>"string|nullable",
            "subtype"=>"string|nullable"

        ]);

        $template = $this->templateService->createTemplate($validated);

        return response()->json(["message"=>"Template created",$template], 201);
    }

    /**
     * Afficher un template
     */
    public function show(Template $template)
    {  
        return response()->json($template->load("creator"));
    }
  public function update(Request $request){
    $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::enum(TemplateType::class)],
            'content' => 'required|string',
            'variables' => 'array|nullable',
            'settings' => 'array|nullable',
            "tags"=>"array|nullable",
            "description"=>"string|nullable",
            "is_default"=>"boolean|nullable",
            "output_format"=>"string|nullable",
            "target_audience"=>"string|nullable",
            "css-content"=>"string|nullable",
            "js-content"=>"string|nullable",
            "subtype"=>"string|nullable"

        ]);
    $template = Template::findOrFail($request->id);
    $template->update($validated);
    $template->save();
    return response()->json(["message"=>"Template updated",$template], 201);

  }
    /**
     * Prévisualiser un template
     */
    public function preview(Template $template)
    {
        $preview = $this->templateService->preview($template->id);
        
        return response()->json([
            'template' => $template,
            'preview' => $preview
        ]);
    }

    /**
     * Rendre un template
     */
    public function render(Request $request, Template $template)
    {
        $variables = $request->input('variables', []);
        
        try {
            $rendered = $this->templateService->render($template->id, $variables);
            
            return response()->json([
                'success' => true,
                'rendered' => $rendered
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Rendre en PDF
     */
    public function renderPdf(Request $request)
    {
        // $variables = $request->input('variables', []);
        $variables = User::all()->toArray();
        $pdf = $this->templateService->renderToPdf(2, $variables);
        
        return response($pdf)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="template.pdf"');
    }

    /**
     * Templates par type
     */
    // public function byType(string $type)
    // {
    //     $templateType = TemplateType::from($type);
        
    //     $templates = Template::byType($templateType)
    //         ->active()
    //         ->orderBy('is_default', 'desc')
    //         ->orderBy('usage_count', 'desc')
    //         ->get();

    //     return response()->json($templates);
    // }
}