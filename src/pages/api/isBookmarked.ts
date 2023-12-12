import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { articleId, userId } = req.query;

    const bookmark = await prisma.bookmarks.findFirst({
      where: {
        article_id: Number(articleId),
        user_id: Number(userId),
      },
    });

    if (bookmark) {
      res.status(200).json({ bookmarked: true });
    } else {
      res.status(200).json({ bookmarked: false });
    }
  }
}
