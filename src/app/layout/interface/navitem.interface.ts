export interface NavItem {
  label: string;
  routerLink: string;
  fragment?: string;
  priority?: boolean;
}

export interface AdminNavItem {
  label: string;
  icon: string;
  routerLink: string;
}
