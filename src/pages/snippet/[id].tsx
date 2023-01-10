// Dynamic route for snippet page

import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import ReactCodeMirror from "@uiw/react-codemirror";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import CTAButton from "../../components/CTAButton";
import { api } from "../../utils/api";

export default function Snippet() {
  const router = useRouter();
  const { id } = router.query;

  const snippetQuery = api.snippet.get.useQuery({ id: id as string });

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
        {snippetQuery.isSuccess && (
          <div className="container flex flex-col items-center justify-center gap-12 px-4 pt-8 pb-16">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-[4rem]">
              Here's the snippet
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
        )}
      </main>
    </>
  );
}
