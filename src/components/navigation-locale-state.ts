// A one-use handoff for locale navigation; ordinary links never restore the directory.
let expandedDestination: string | null = null;

export function retainExpandedNavigation(href: string): boolean {
  const expanded = !!document.querySelector('[data-navigation-root][data-expanded="true"]');
  expandedDestination = expanded ? new URL(href, window.location.href).pathname : null;
  return expanded;
}

export function consumeExpandedNavigation(pathname: string): boolean {
  const restore = expandedDestination === pathname;
  expandedDestination = null;
  return restore;
}
