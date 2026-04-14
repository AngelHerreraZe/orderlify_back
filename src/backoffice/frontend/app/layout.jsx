import '../styles.css';
import { Sidebar } from '../components/sidebar';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100">
        <div className="min-h-screen grid grid-cols-[260px_1fr]">
          <Sidebar />
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
