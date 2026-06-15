export function verifyAdminPassword(password: string | null | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected || !password) return false;
  return password === expected;
}

export function getAdminPasswordFromRequest(request: Request): string | null {
  return request.headers.get("x-admin-password");
}

export function assertAdminRequest(request: Request): Response | null {
  const password = getAdminPasswordFromRequest(request);
  if (!verifyAdminPassword(password)) {
    return Response.json({ error: "認証に失敗しました" }, { status: 401 });
  }
  return null;
}
