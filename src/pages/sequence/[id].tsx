import { useRouter } from "next/router";
import React from "react";
import { View } from "../../domains/sequence/View";

export default () => {
  const router = useRouter();
  const { id } = router.query;

  return <View id={id} />;
};
