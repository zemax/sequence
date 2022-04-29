import Head from "next/head";
import React from "react";
import { getApp } from "../commons/data/informations";
import { AppMetas } from "../commons/head/AppMetas";
import { ThemeMetas } from "../commons/head/ThemeMetas";
import "../commons/styles/global.scss";

export default function App({ Component, pageProps }) {
  const { title, description } = getApp();

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />

        <title>{title}</title>
        <meta name="description" content={description}></meta>

        <AppMetas />
        <ThemeMetas />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
