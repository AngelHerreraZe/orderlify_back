const links = [
  'dashboard', 'tenants', 'billing', 'analytics', 'support', 'settings', 'monitoring',
  'marketing', 'security', 'reports', 'feature-flags', 'automations',
];

export function Sidebar() {
  return (
    <aside className="border-r border-slate-800 p-4">
      <h1 className="text-xl font-bold mb-6">Orderlify Backoffice</h1>
      <nav className="space-y-2">
        {links.map((link) => (
          <a key={link} href={`/${link}`} className="block rounded-md px-3 py-2 hover:bg-slate-800">
            {link.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </a>
        ))}
      </nav>
    </aside>
  );
}
