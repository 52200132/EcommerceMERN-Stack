import { Container } from "react-bootstrap";

import BackButton from "Admin/components/back-btn";
import TinyMCE from "Admin/components/tiny-mce";
import { useTpsSelector } from "custom-hooks/use-tps-selector";

const CRUDetailsDescription = () => {
  const { detail_description } = useTpsSelector((state) => state.product, {
    includeProps: ['detail_description'],
  })
  return (
    <>
      <BackButton />
      <Container className="tps-cru-dd-page">
        <TinyMCE initialValue={detail_description} />
        
      </Container>
    </>
  );
};

export default CRUDetailsDescription;