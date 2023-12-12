import RootLayout from "@/components/Layout";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function Index() {
  const router = useRouter();

  const [authState, setAuthState] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [apiRes, setApiRes] = useState("");

  const registerUser = async (event: React.FormEvent) => {
    event.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.status == 200) setApiRes("Registered Succesfully");
    if (res.status == 400) setApiRes(data.message);
  };

  const authUser = async (event: React.FormEvent) => {
    event.preventDefault();

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (res.status == 400) setApiRes(data.message);

    if (data.message === "Login successful!") {
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", data.userId);

      router.replace("/");
    }
  };

  return (
    <RootLayout>
      <div className="flex justify-center flex-col place-items-center w-full h-full">
        <Image
          src={"/kabarsehatlogo.png"}
          alt="logo"
          width={500}
          height={500}
        />
        <form
          onSubmit={authState ? authUser : registerUser}
          className="flex flex-col gap-3 w-[40%] text-[#265073]"
        >
          <span className="yeseva font-normal">username</span>
          <input
            className="p-2 rounded"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <span className="yeseva font-normal">password</span>
          <input
            className="p-2 rounded"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-[#265073] text-xl p-2 text-[#ecf4d6] yeseva rounded-xl w-1/2 self-center"
          >
            {authState ? "Login" : "Register"}
          </button>
          <div className="flex flex-row justify-between">
            <span
              onClick={() => setAuthState(!authState)}
              className="cursor-pointer "
            >
              {authState ? "Register" : "Login"}
            </span>
            <span onClick={() => router.replace('/')} className="cursor-pointer">Home</span>
          </div>
          <span className="text-yellow-100">{apiRes}</span>
        </form>
      </div>
    </RootLayout>
  );
}
