import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kabar Sehat",
  description: "Artikel seputar kesehatan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="main-body flex flex-col overflow-hidden">
      <div className="max-w-[900px] min-w-[900px] bg-[#9AD0C2] h-[100vh] overflow-auto place-items-center flex flex-col">
        {children}
      </div>
    </div>
  );
}
