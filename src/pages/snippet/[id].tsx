// Dynamic route for snippet page

import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import Link from "next/link";

import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import ReactCodeMirror from "@uiw/react-codemirror";

import CTAButton from "../../components/CTAButton";
import { api } from "../../utils/api";

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import superjson from "superjson";
import { appRouter } from "../../server/api/root";
import { createInnerTRPCContext } from "../../server/api/trpc";

// TODO: Make sure that ISR changes work since these dynamic routes should now be statically rendered at request time and then cached.
// TODO: When deleting a snippet, do on-demand revalidation / purge the cached page.
export default function Snippet({
  id,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const snippetQuery = api.snippet.get.useQuery({ id: id });

  return (
    <>
      <Head>
        <title>Snippy</title>
        <meta name="description" content="Share code snippets" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {snippetQuery.isLoading && <p>Loading...</p>}
        {snippetQuery.isError && <p>Error: {snippetQuery.error.message}</p>}
        {snippetQuery.isSuccess ? (
          !snippetQuery.data ? (
            <div className="container flex flex-col items-center justify-center gap-4 px-4 pt-8 pb-16">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-[2rem]">
                Sorry, the{" "}
                <span className="text-[hsl(280,100%,70%)]">Snippet</span> was
                not found!
              </h2>
              <p>It could have been deleted by the author.</p>
            </div>
          ) : (
            <div className="container flex flex-col items-center justify-center gap-12 px-4 pt-8 pb-16">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-[4rem]">
                Here&apos;s the snippet
              </h2>
              <ReactCodeMirror
                value={snippetQuery.data?.code}
                editable={false}
                width="65vw"
                theme={vscodeDark}
                extensions={[javascript({ jsx: true })]}
              />
              <CTAButton>
                <Link href="/">Create a New Snippet</Link>
              </CTAButton>
            </div>
          )
        ) : null}
      </main>
    </>
  );
}

type PathParams = { id: string };

export const getStaticPaths: GetStaticPaths<PathParams> = () => {
  return {
    paths: [], // empty paths to not pre-render any pages via SSG. Idea is to use ISR to only generate snippet pages on user's request and then cache them
    fallback: "blocking",
  };
};

export const getStaticProps = async ({
  params,
}: GetStaticPropsContext<{ id: string }>) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({}),
    transformer: superjson, // optional - adds superjson serialization
  });

  const id = params?.id as string;

  // pre-fetch `snippet.get`
  await ssg.snippet.get.prefetch({ id: id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
    revalidate: false, // Do not automatically revalidate. Instead, opt to do on-demand revalidation.
  };
};