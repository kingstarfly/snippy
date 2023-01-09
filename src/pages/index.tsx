import ReactCodeMirror from "@uiw/react-codemirror";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "../utils/api";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  return (
    <>
      <Head>
        <title>Snippy</title>
        <meta name="description" content="Share code snippets" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Paste your <span className="text-[hsl(280,100%,70%)]">Snippet</span>{" "}
            here
          </h1>
          <ReactCodeMirror
            value={"const a = 0;"}
            minHeight="100px"
            className="border-spacing-0 rounded-2xl"
            theme={vscodeDark}
            extensions={[javascript({ jsx: true })]}
          />

          <p className="text-2xl text-white">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>
        </div>
      </main>
    </>
  );
};

export default Home;
