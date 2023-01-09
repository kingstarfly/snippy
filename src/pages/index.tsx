import { formatDistanceToNow } from "date-fns";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { TbClipboard } from "react-icons/tb";

import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import ReactCodeMirror from "@uiw/react-codemirror";

import { api, getBaseUrl } from "../utils/api";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const snippets = api.snippet.getTopThree.useQuery();
  const [value, setValue] = useState<string>("");
  const [hasShared, setHasShared] = useState(false);

  const apiContext = api.useContext();
  const createSnippetMutation = api.snippet.create.useMutation({
    onSuccess() {
      apiContext.snippet.getTopThree.invalidate();
    },
  });
  const deleteSnippetMutation = api.snippet.delete.useMutation({
    onSuccess() {
      apiContext.snippet.getTopThree.invalidate();
    },
  });

  function handleShare() {
    setHasShared(true);
    createSnippetMutation.mutate({ code: value });
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
  }

  function handleDelete(id: string) {
    setValue("");
    setHasShared(false);
    deleteSnippetMutation.mutate({ id });
  }

  return (
    <>
      <Head>
        <title>Snippy</title>
        <meta name="description" content="Share code snippets" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-start gap-12 px-4 pt-8 pb-16">
          <div className="container flex flex-col items-center justify-start gap-6">
            <h1 className="text-5xl font-extrabold tracking-tight text-[hsl(280,100%,70%)] sm:text-[5rem]">
              Snippy
            </h1>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-[2rem]">
              Copy. Paste. Share.
            </h2>
          </div>

          <ReactCodeMirror
            value={value}
            onChange={setValue}
            width="85vw"
            theme={vscodeDark}
            extensions={[javascript({ jsx: true })]}
            placeholder="// ---Paste your code here!---"
            editable={!hasShared}
          />

          {!hasShared ? (
            <button
              className="rounded-md bg-[hsl(280,100%,70%)]/90 px-6 py-3 text-3xl font-semibold tracking-tight text-white/90 hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-gray-400"
              onClick={handleShare}
              disabled={!value}
            >
              Share
            </button>
          ) : createSnippetMutation.isLoading ? (
            <p>Creating snippet...</p>
          ) : createSnippetMutation.isError ? (
            <p>Error: {createSnippetMutation.error.message}</p>
          ) : createSnippetMutation.isSuccess ? (
            <div className="flex flex-col items-center text-center text-xl font-medium text-white">
              <div className="mt-4 flex flex-row items-center gap-2 rounded-md bg-black pl-2">
                <Link
                  href={`/snippet/${createSnippetMutation.data.id}`}
                  className="font-mono text-lg text-gray-600"
                >
                  {`${getBaseUrl()}/snippet/${createSnippetMutation.data.id}`}{" "}
                </Link>

                <div className="flex flex-row items-center gap-1 rounded-md bg-[hsl(280,100%,70%)]/90 px-2 py-1 text-lg font-medium tracking-wide hover:cursor-pointer hover:bg-purple-400">
                  <TbClipboard
                    size={24}
                    onClick={() =>
                      handleCopy(
                        `${getBaseUrl()}/snippet/${
                          createSnippetMutation.data.id
                        }`
                      )
                    }
                  />
                  Copy
                </div>
              </div>
              <span className="mt-4 text-xs text-gray-500">
                Made an error?{" "}
                <button
                  className="underline"
                  onClick={() => handleDelete(createSnippetMutation.data.id)}
                >
                  Delete snippet
                </button>
              </span>
            </div>
          ) : null}

          <div className="text-2xl text-white">
            <h3 className="mb-6 text-center text-3xl font-bold text-white ">
              Recent Snippets
            </h3>
            <div className="container flex flex-col gap-4 text-xs">
              {snippets.data?.map((snippet) => {
                return (
                  <div key={snippet.id}>
                    <ReactCodeMirror
                      value={snippet.code}
                      editable={false}
                      width="65vw"
                      theme={vscodeDark}
                      extensions={[javascript({ jsx: true })]}
                      maxHeight="20vh"
                    />
                    <span className="align-text-top text-sm font-medium text-gray-400">
                      Shared{" "}
                      {formatDistanceToNow(snippet.createdAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                );
              }) ?? "No snippets so far... :("}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
