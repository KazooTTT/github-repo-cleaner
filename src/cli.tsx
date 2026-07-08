#!/usr/bin/env node
import React from "react";
import {render} from "ink";
import {getGhToken, AuthError} from "./auth.js";
import {OctokitGitHubApi} from "./github.js";
import {App} from "./ui.js";

function parseOwner(argv: string[]): string | undefined {
  const ownerIndex = argv.indexOf("--owner");
  if (ownerIndex === -1) return undefined;
  return argv[ownerIndex + 1];
}

try {
  const token = await getGhToken();
  const api = new OctokitGitHubApi(token);
  render(<App api={api} owner={parseOwner(process.argv.slice(2))} />);
} catch (error) {
  if (error instanceof AuthError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
