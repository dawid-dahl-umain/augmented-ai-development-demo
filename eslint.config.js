// @ts-check
import js from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
    {
        ignores: ["dist/**", "node_modules/**"]
    },
    // Base recommended (non type-checked) for all files
    js.configs.recommended,
    tseslint.configs.recommended,
    // Type-checked rules only for source TypeScript files in tsconfig project
    {
        files: ["src/**/*.ts"],
        ignores: ["**/*.spec.ts", "**/*.test.ts"],
        extends: [...tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.eslint.json"],
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            "no-console": ["warn", { allow: ["warn", "error", "log"] }],
            "no-var": "error",
            "prefer-const": "error",
            eqeqeq: ["error", "smart"],
            "object-shorthand": ["error", "always"],
            // Disallow adding file extensions in relative imports
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        "./**/*.js",
                        "../**/*.js",
                        "./**/*.ts",
                        "../**/*.ts"
                    ]
                }
            ],
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/consistent-type-definitions": ["error"],
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
            ],
            "@typescript-eslint/no-unsafe-assignment": "error",
            "@typescript-eslint/no-unsafe-return": "error",
            "@typescript-eslint/no-unsafe-member-access": "error",
            "@typescript-eslint/restrict-template-expressions": [
                "error",
                { allowNumber: true, allowBoolean: true }
            ]
        }
    }
)
