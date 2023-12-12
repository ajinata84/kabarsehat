import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const prisma = new PrismaClient();
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (user) {
      res.status(400).json({ message: "Username already exists!" });
      return;
    }

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    res.status(200).json({ message: "User registered successfully" });
  } else {
  }
}
