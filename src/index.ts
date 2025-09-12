#!/usr/bin/env node
import { fileURLToPath } from "node:url";

export const greet = (name: string): string => `Hello, ${name}!`;

const executedDirectly = fileURLToPath(import.meta.url) === process.argv[1];
if (executedDirectly) {
  const [, , name = "world"] = process.argv;
  console.log(greet(name));
}
