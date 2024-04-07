import type { AppType } from "next/app";
import { Inter } from "next/font/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";
import Header from "~/components/Header";
import { UserProvider } from "~/context/UserContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={`font-sans ${inter.variable}`}>
      <Head>
        <title>Turnover assignment</title>
        <meta name="description" content="Turnover assignment by Gunpreet Singh" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <UserProvider>
        <div className="font-inter inline-flex w-full flex-row rounded leading-[normal]" >
          <div className="flex h-full w-full flex-col items-center overflow-clip rounded bg-white pb-44" >
            <Header></Header>
            <div className="mr-0 flex items-end justify-center px-96 pt-10 mt-32" >
              <div className="flex w-[576px] flex-col items-center justify-center gap-y-2 self-stretch rounded-3xl border border-solid border-neutral-400 bg-white px-14 pb-12" >
                <Component {...pageProps} />
              </div>
            </div>
          </div>
        </div>
      </UserProvider>
    </main>
  );
};

export default api.withTRPC(MyApp);
