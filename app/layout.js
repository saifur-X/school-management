import './globals.css';

export const metadata = {
  title: 'School Management System',
  description: 'Full functional school management web app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}

