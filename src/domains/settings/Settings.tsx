import { getUI } from "../../data/informations";

export const Settings = () => {
  const { settings } = getUI();

  return <h1>{settings}</h1>;
};
