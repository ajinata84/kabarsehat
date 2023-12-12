import RootLayout from "@/components/Layout";
import Image from "next/image";
import React from "react";

export default function index() {
  return (
    <RootLayout>
      <div className="flex justify-center flex-col place-items-center w-full">
        <Image
          src={"/kabarsehatlogo.png"}
          alt="logo"
          width={500}
          height={500}
        />
      </div>
    </RootLayout>
  );
}
