import { format, formatDistanceToNowStrict } from "date-fns";
import Head from "next/head";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { TbClipboard } from "react-icons/tb";

import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import ReactCodeMirror from "@uiw/react-codemirror";

import CTAButton from "../components/CTAButton";
import { api } from "../utils/api";
import { getFullBaseUrl } from "../utils/link";

import type { NextPage } from "next";
const Home: NextPage = () => {
  const snippets = api.snippet.getTopThree.useQuery();
  const [value, setValue] = useState<string>("");
  const [hasShared, setHasShared] = useState(false);

  const apiContext = api.useContext();
  const createSnippetMutation = api.snippet.create.useMutation({
    async onSuccess() {
      await apiContext.snippet.getTopThree.invalidate();
    },
  });
  const deleteSnippetMutation = api.snippet.delete.useMutation({
    async onSuccess() {
      await apiContext.snippet.getTopThree.invalidate();
    },
  });

  function handleShare() {
    setHasShared(true);
    createSnippetMutation.mutate({ code: value });
  }

  function handleCopy(text: string) {
    console.log("copying to clipboard");

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }

  function handleDelete(id: string) {
    setValue("");
    setHasShared(false);
    deleteSnippetMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Snippet deleted");
        },
      }
    );
  }

  return (
    <>
      <Toaster />
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

          <div className="flex flex-col items-center justify-start gap-4">
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
              <CTAButton onClick={handleShare} disabled={!value}>
                Share
              </CTAButton>
            ) : createSnippetMutation.isLoading ? (
              <p>Creating snippet...</p>
            ) : createSnippetMutation.isError ? (
              <p>Error: {createSnippetMutation.error.message}</p>
            ) : createSnippetMutation.isSuccess ? (
              <div className="flex flex-col items-center text-center text-xl font-medium text-white">
                <div className="mt-4 flex flex-row items-center gap-2 rounded-md bg-black pl-2">
                  <span className="font-mono text-lg text-gray-600">
                    {`${getFullBaseUrl()}/snippet/${
                      createSnippetMutation.data.id
                    }`}
                  </span>

                  <button
                    onClick={() => {
                      handleCopy(
                        `${getFullBaseUrl()}/snippet/${
                          createSnippetMutation.data.id
                        }`
                      );
                    }}
                    className="flex flex-row items-center gap-1 rounded-md bg-[hsl(280,100%,70%)]/90 px-2 py-1 text-lg font-medium tracking-wide hover:cursor-pointer hover:bg-purple-400"
                  >
                    <TbClipboard size={24} />
                    Copy
                  </button>
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
          </div>

          <div className="mt-32 text-2xl text-white">
            <h3 className="mb-2 text-center text-3xl font-bold text-white">
              Recent Snippets
            </h3>
            <p className="mb-12 text-center text-sm font-medium text-gray-500 ">
              Last updated {format(snippets.dataUpdatedAt, "HH:mm:ss")}
            </p>
            <div className="container flex flex-col items-center gap-12 text-xs">
              {snippets.isLoading ? (
                <p>Getting snippets...</p>
              ) : snippets.isError ? (
                <p>Error: {snippets.error.message}</p>
              ) : snippets.data.length === 0 ? (
                <p>No snippets so far... {":("}</p>
              ) : (
                snippets.data?.map((snippet) => {
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
                        {formatDistanceToNowStrict(snippet.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
