// ===============================
// Importación de dependencias
// ===============================

// defineConfig: para estructurar la configuración ESLint en flat config
// globalIgnores: para definir qué carpetas/archivos ignorar
const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

// Parser de TypeScript para que ESLint entienda código TS
const tsParser = require("@typescript-eslint/parser");

// Colección de variables globales predefinidas (node, browser, etc.)
const globals = require("globals");

// Plugin oficial de ESLint para TypeScript
const typescriptEslint = require("@typescript-eslint/eslint-plugin");

// Configuraciones recomendadas de ESLint para JavaScript
const js = require("@eslint/js");

// FlatCompat: utilidad para migrar configuraciones clásicas de `.eslintrc`
// al nuevo sistema de configuración plana de ESLint
const {
    FlatCompat,
} = require("@eslint/eslintrc");

// Compatibilidad con configs clásicas usando FlatCompat
const compat = new FlatCompat({
    baseDirectory: __dirname,             // Carpeta base del proyecto
    recommendedConfig: js.configs.recommended, // Reglas recomendadas de ESLint
    allConfig: js.configs.all             // Reglas estrictas de ESLint
});


// ===============================
// Exportación de configuración ESLint
// ===============================
module.exports = defineConfig([ {
    // -------------------------------
    // Opciones de lenguaje
    // -------------------------------
    languageOptions: {
        parser: tsParser,                 // Parser de TypeScript
        ecmaVersion: "latest",            // Soporta la última versión de ECMAScript
        sourceType: "module",             // Usa módulos ES (import/export)

        parserOptions: {                  // Configuración específica de TypeScript
            project: './tsconfig.json',   // Ruta al archivo tsconfig.json
            tsconfigRootDir: __dirname,   // Directorio raíz del proyecto
        },

        globals: {                        // Variables globales permitidas
            ...globals.node,              // Variables de Node.js (require, module, etc.)
        },
    },

    // -------------------------------
    // Plugins
    // -------------------------------
    plugins: {
        "@typescript-eslint": typescriptEslint, // Plugin de ESLint para TypeScript
    },

    // -------------------------------
    // Configuración base extendida
    // -------------------------------
    extends: compat.extends(
        "eslint:recommended",                 // Reglas recomendadas de ESLint
        "plugin:@typescript-eslint/recommended", // Buenas prácticas para TypeScript
        "prettier"                            // Desactiva reglas conflictivas con Prettier
    ),

    // -------------------------------
    // Reglas personalizadas
    // -------------------------------
    rules: {
        // Obliga a definir tipo de retorno en todas las funciones
        "@typescript-eslint/explicit-function-return-type": "error",

        // Controla el mal uso de promesas, pero permite void
        "@typescript-eslint/no-misused-promises": [ "error", {
            checksVoidReturn: false,
        } ],

        // Prohíbe promesas sin manejar (no-floating)
        "@typescript-eslint/no-floating-promises": "error",

        // Marca uso de `any` como advertencia (no error)
        "@typescript-eslint/no-explicit-any": "warn",

        // Marca variables o argumentos no usados como advertencia,
        // excepto si comienzan con "_"
        "@typescript-eslint/no-unused-vars": [ "warn", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
        } ],

        // Uso de console.log() queda prohibido,
        // excepto console.warn y console.error
        "no-console": [ "warn", {
            allow: [ "warn", "error" ],
        } ],

        // Prefiere `const` en lugar de `let` cuando no se reasigna
        "prefer-const": "error",
    },
},
// -------------------------------
// Ignorar archivos/carpetas
// -------------------------------
globalIgnores([
    "**/dist",               // Ignora la carpeta de compilación
    "**/node_modules",       // Ignora dependencias
    "**/prisma",             // Ignora archivos generados de Prisma
    "./eslint.config.cjs",   // Ignora config duplicada o legacy
]) ]);
