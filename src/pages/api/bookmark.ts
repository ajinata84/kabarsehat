import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { userId } = req.query;

    const bookmarkedArticles = await prisma.bookmarks.findMany({
      where: {
        user_id: Number(userId),
      },
      include: {
        article: true,
      },
    });

    res.status(200).json(bookmarkedArticles.map((b) => b.article));
  } else if (req.method === "POST") {
    const { articleId, userId } = req.body;

    const bookmarked = await prisma.bookmarks.findFirst({
      where: {
        article_id: Number(articleId),
        user_id: Number(userId),
      },
    });

    if (bookmarked) {
      res.status(400).json({ message: "Already bookmarked" });
    } else {
      const bookmark = await prisma.bookmarks.create({
        data: {
          article_id: articleId,
          user_id: userId,
        },
      });

      res.status(200).json(bookmark);
    }
  } else {
  }
}
