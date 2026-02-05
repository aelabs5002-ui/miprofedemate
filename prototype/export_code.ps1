$files = @(
"src/navigation/AppNavigator.tsx",
"src/screens/LoginScreen.tsx",
"src/screens/RegisterScreen.tsx",
"src/screens/MisionScreen.tsx",
"src/screens/SubirTareaScreen.tsx",
"src/screens/ProgresoScreen.tsx",
"src/screens/PerfilScreen.tsx",
"src/screens/PanelAlumnoScreen.tsx",
"src/screens/PadrePanelScreen.tsx",
"style.css"
)
$output = @{}
foreach ($f in $files) {
    if (Test-Path $f) {
        $output[$f] = Get-Content $f -Raw
    }
}
$output | ConvertTo-Json -Depth 2 | Set-Content -Encoding UTF8 "C:/Users/USUARIO/.gemini/antigravity/brain/bf281a14-a4a9-488a-9c11-b9e89462a493/codebase_export.json"
