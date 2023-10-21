import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectSequence } from "../../../data/sequences/sequencesSlice";
import { Edit } from "../../../domains/sequence/Edit";
import { Page } from "../../../domains/ui/components/Page/Page";

export default () => {
  const router = useRouter();
  const { id } = router.query;
  const sequence = useSelector(selectSequence(id as string));

  if (!sequence) {
    return null;
  }

  return (
    <Page title={sequence.name} back>
      <Edit sequence={sequence} />
    </Page>
  );
};
