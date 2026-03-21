import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi", "node_modules", ".content-collections", "src/components/ui/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Reading localStorage in an effect to initialize state is valid
      "react-hooks/set-state-in-effect": "off",
      // Allow `any` — common with react-hook-form resolvers and 3rd-party libs
      "@typescript-eslint/no-explicit-any": "warn",
      // Unused vars: ignore underscore-prefixed and intentional unused imports
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
);
