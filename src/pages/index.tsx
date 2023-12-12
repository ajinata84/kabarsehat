import RootLayout from "@/components/Layout";
import { prisma } from "@/db";
import { article } from "@prisma/client";
import Image, { ImageLoaderProps } from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface User {
  username: string;
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
}

async function getArticles() {
  const articles = await prisma.article.findMany({
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
    },
  });

  return articles.map(({ tags_map, ...article }) => ({
    ...article,
    created_at: article.created_at.toISOString(), // Convert date to string
    tags: tags_map.map((tag_map) => tag_map.tags.tagName),
  }));
}

export default function Home({ articles }: { articles: Article[] }) {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [showBookmarked, setShowBookmarked] = useState(false);

  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lcuid = localStorage.getItem("userId");

      setCurrentUser(localStorage.getItem("username") || "");
      setCurrentUserId(lcuid || "");
    }
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setBookmarkLoading(true);
      let fetchedArticles;
      if (showBookmarked) {
        const res = await fetch(
          `/api/bookmark?userId=${parseInt(currentUserId)}`
        );
        fetchedArticles = await res.json();
      } else {
        fetchedArticles = articles;
      }
      setDisplayedArticles(fetchedArticles);
      setBookmarkLoading(false);
    };

    fetchArticles();
  }, [showBookmarked, articles]);

  const handleBookmarkClick = () => {
    setShowBookmarked(!showBookmarked);
  };

  return (
    <RootLayout>
      <div className="flex justify-center flex-col place-items-center w-full">
        <Image
          src={"/kabarsehatlogo.png"}
          alt="logo"
          width={500}
          height={500}
        />
        <div className="yeseva text-2xl flex flex-row justify-between w-[80%] text-[#265073]">
          {currentUser && (
            <span
              onClick={() => handleBookmarkClick()}
              className="cursor-pointer"
            >
              {showBookmarked ? "Home" : "Bookmarks"}
            </span>
          )}
          {currentUser ? (
            <div>
              <span>{currentUser}</span>{" "}
              <span
                className="text-[#f5f5f5] istok cursor-pointer"
                onClick={() => {
                  localStorage.removeItem("username");
                  localStorage.removeItem("userId");
                  router.replace("/auth");
                }}
              >
                Log Off
              </span>
            </div>
          ) : (
            <Link href={"/auth"}>Login</Link>
          )}
        </div>

        {!bookmarkLoading ? (
          displayedArticles?.map((e, i) => (
            <Link
              className="flex w-[80%] my-4 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105"
              href={`/article/${e.articleId}`}
              key={`article${i}`}
            >
              <div className="flex w-[100%] flex-col outline-[#2D9596] outline-[6px] outline rounded-b-lg">
                <img
                  src={e.thumbnail_url}
                  alt="test"
                  className="h-[200px] object-cover"
                />
                <div className="bg-[#ecf4d6] flex flex-col gap-4 py-6 px-8 rounded-b-lg ">
                  <div className="flex flex-row justify-between ">
                    <span
                      className="article-title text-4xl"
                      style={{ backgroundImage: e.thumbnail_url }}
                    >
                      {e.title}
                    </span>
                  </div>
                  <p className="text-ellipsis overflow-hidden text-2xl">
                    {e.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <span className="text-[#265073] yeseva font-normal">Loading...</span>
        )}
      </div>
    </RootLayout>
  );
}

export async function getServerSideProps() {
  const articles = await getArticles();
  return {
    props: {
      articles,
    },
  };
}
