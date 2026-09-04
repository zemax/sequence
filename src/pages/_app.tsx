import Head from "next/head";
import { Provider } from "react-redux";
import { getApp } from "../data/informations";
import store from "../data/store";
import { AppMetas } from "../domains/head/AppMetas";
import { ThemeMetas } from "../domains/head/ThemeMetas";

import "../styles/global.scss";

export default function App({ Component, pageProps }) {
  const { title, description } = getApp();

  return (
    <Provider store={store}>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />

        <title>{title}</title>
        <meta name="description" content={description}></meta>

        <AppMetas />
        <ThemeMetas />
      </Head>
      <Component {...pageProps} />
    </Provider>
  );
}
