const baseUrl = process.env.API_BASE_URL || "http://localhost:5000";

const protectedEndpoints = [
  ["GET", "/api/auth/me"],
  ["POST", "/api/organizations"],
  ["GET", "/api/organizations"],
  ["GET", "/api/organizations/members"],
  ["POST", "/api/documents"],
  ["GET", "/api/documents"],
  ["GET", "/api/document-requests"],
  ["GET", "/api/external-recipients"],
  ["GET", "/api/notifications"],
  ["POST", "/api/agent/command"],
];

const checks = [
  ["GET", "/", 200],
  ["GET", "/api/health", 200],
  ["POST", "/api/auth/register", 400],
  ["POST", "/api/auth/login", 400],
  ...protectedEndpoints.map(([method, path]) => [method, path, 401]),
];

let failures = 0;

for (const [method, path, expected] of checks) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "POST" ? "{}" : undefined,
  });

  const ok = response.status === expected;
  console.log(`${ok ? "PASS" : "FAIL"} ${method} ${path} -> ${response.status} (expected ${expected})`);
  if (!ok) failures += 1;
}

if (failures) {
  process.exitCode = 1;
} else {
  console.log(`Contract smoke test passed: ${checks.length} checks.`);
}
