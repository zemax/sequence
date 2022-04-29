import {Head, Html, Main, NextScript} from "next/document";
import {getApp} from "../commons/data/informations";

export default function Document() {
    const {language} = getApp();

    return (
        <Html lang={language}>
            <Head/>
            <body>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    );
}
