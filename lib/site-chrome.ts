export function isSiteChromeVisible(pathname: string): boolean {
  return !pathname.startsWith("/share/") &&
    pathname !== "/private" &&
    !pathname.startsWith("/private/");
}
