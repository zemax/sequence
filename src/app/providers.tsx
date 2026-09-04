"use client";

import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import store from "../data/store";

export const Providers = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
