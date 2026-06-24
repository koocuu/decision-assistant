export type NavItem = {
  href: string;
  label: string;
};

export function isNavItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/decisions/new") {
    return pathname === "/decisions/new";
  }

  if (href === "/decisions") {
    return pathname === "/decisions" || (pathname.startsWith("/decisions/") && pathname !== "/decisions/new");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
