import React from "react";
import {getApp, getTheme} from "../data/informations";

export const AppMetas = () => {
    const {title, description} = getApp();
    const {color1, color2} = getTheme();

    return (
        <>
            <link rel="manifest" href="/manifest.json"/>
            <meta name="application-name" content={title}/>
            <meta name="apple-mobile-web-app-title" content={title}/>

            <meta name="format-detection" content="telephone=no"/>
            <meta name="mobile-web-app-capable" content="yes"/>
            <meta name="apple-mobile-web-app-capable" content="yes"/>
            <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        </>
    );
};
