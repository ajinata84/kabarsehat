// pages/api/comment.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { articleId, contents, userId } = req.body;

    const comment = await prisma.comments.create({
      data: {
        articleId,
        contents,
        userId
      },
    });

    res.status(200).json(comment);
  } else {
  }
}
