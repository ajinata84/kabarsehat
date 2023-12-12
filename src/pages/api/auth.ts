import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const prisma = new PrismaClient();
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        username: username
      },
    });

    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      res.status(200).json({ message: 'Login successful!', username: user.username, userId: user.userId });
    } else {
      res.status(400).json({ message: 'Invalid password' });
    }
  } else {
  }
}
