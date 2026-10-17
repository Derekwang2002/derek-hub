// Shared by the modal and the homepage animation; dispatch before locking scroll.
export const SEARCH_CHANGE_EVENT = "site-search-change";
export function isSearchOpen() { return document.documentElement.dataset.searchOpen === "true"; }
