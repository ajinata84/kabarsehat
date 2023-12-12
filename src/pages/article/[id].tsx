import RootLayout from "@/components/Layout";
import { prisma } from "@/db";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

interface User {
  username: string;
}

interface Comment {
  created_at: string;
  contents: string;
  user: {
    username: string;
  };
}

interface Article {
  articleId: number;
  created_at: string;
  userId: number;
  title: string;
  subtitle: string;
  contents: string;
  thumbnail_url: string;
  user: User;
  tags: string[];
  comments: Comment[];
}

async function getArticle(articleId: number) {
  const article = await prisma.article.findUnique({
    where: {
      articleId: articleId,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      tags_map: {
        include: {
          tags: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });

  if (!article) {
    throw new Error(`No article found for the ID: ${articleId}`);
  }

  const { tags_map, comments, ...articleData } = article;

  return {
    ...articleData,
    created_at: article.created_at.toISOString(),
    tags: tags_map.map((tag_map) => tag_map.tags.tagName),
    comments: comments.map((comment) => ({
      ...comment,
      created_at: comment.created_at.toISOString(),
    })),
  };
}

export default function Article({ article }: { article: Article }) {
  const router = useRouter();

  const [newComment, setNewComment] = useState("");

  const [userId, setuserId] = useState<string>("");

  const [isBookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lcuid = localStorage.getItem("userId");

      setuserId(lcuid || "");

      const checkBookmark = async () => {
        const res = await fetch(
          `/api/isBookmarked?articleId=${article.articleId}&userId=${lcuid}`
        );
        const data = await res.json();

        if (data.bookmarked) setBookmarked(true);
      };
      checkBookmark();
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newComment.length == 0) return;

    const res = await fetch("/api/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        articleId: article.articleId,
        contents: newComment,
        userId: parseInt(userId),
      }),
    });

    if (res.status == 200) {
      setNewComment("");
      router.replace(router.asPath);
    }
  };

  const handleBookmark = async () => {
    const res = await fetch("/api/bookmark", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        articleId: article.articleId,
        userId: parseInt(userId),
      }),
    });

    if (res.status == 200) {
      setBookmarked(true);
    }
  };

  return (
    <RootLayout>
      <div className="flex flex-row w-[80%] justify-end">
        <Link href={"/"}>
          <Image
            src={"/kabarsehatlogo.png"}
            alt="logo"
            width={200}
            height={200}
          />
        </Link>
      </div>
      <div className="flex w-[90%] flex-col gap-6 bg-[#ecf4d6] p-[40px] rounded">
        {userId && (
          <span
            className="yeseva font-normal text-[#265073] cursor-pointer"
            onClick={() => {
              if (!isBookmarked) handleBookmark();
            }}
          >
            {isBookmarked ? "Bookmarked!" : "Bookmark this article"}
          </span>
        )}

        <img src={article.thumbnail_url} alt="test" className="object-cover" />
        <span className="text-xl yeseva">
          {article.user.username}, {new Date(article.created_at).toDateString()}
        </span>
        <div className="flex flex-row justify-between ">
          <span
            className="article-title text-6xl"
            style={{ backgroundImage: article.thumbnail_url }}
          >
            {article.title}
          </span>
        </div>
        <p className="text-3xl">{article.subtitle}</p>
        <div className="flex flex-row gap-6">
          {article.tags.map((t) => (
            <>
              <div className="text-xl outline p-2 capitalize rounded outline-[#265073] yeseva text-[#265073]">
                {t}
              </div>
            </>
          ))}
        </div>
        <p className="text-2xl">{article.contents}</p>
        <div
          className="article-title text-3xl flex flex-col"
          style={{ backgroundImage: article.thumbnail_url }}
        >
          <span>Comments</span>
          {userId && (
            <form onSubmit={handleSubmit} className="flex flex-row gap-7 mb-5">
              <input
                type="text"
                className="w-full rounded text-2xl p-2 text-black"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                type="submit"
                className="yeseva outline p-2 rounded bg-[#265073] text-[#ecf4d6]"
              >
                Submit
              </button>
            </form>
          )}
          {article.comments.map((c) => (
            <div className="my-4 outline outline-[#2D9596] outline-4 p-4 rounded" key={c.created_at}>
              <div className="flex flex-row justify-between text-2xl mb-6 yeseva">
                <span className="">{c.user.username}</span>
                <span>{new Date(c.created_at).toDateString()}</span>
              </div>
              <p className="text-2xl text-black font-normal">{c.contents}</p>
            </div>
          ))}
        </div>
      </div>
    </RootLayout>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { id } = ctx.params as { id: string };

  const article = await getArticle(parseInt(id));
  return {
    props: {
      article,
    },
  };
}
