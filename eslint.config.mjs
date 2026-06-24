import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  // apps/* are independent apps (e.g. the Expo mobile app) with their own
  // tooling and dependencies — the web build must not lint/type-check them.
  { ignores: ["apps/**", ".next/**"] },
  ...nextVitals,
  ...nextTypescript
];

export default eslintConfig;
