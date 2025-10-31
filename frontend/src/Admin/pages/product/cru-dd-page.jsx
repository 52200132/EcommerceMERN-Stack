import { Button, Container } from "react-bootstrap";
import { useDispatch } from "react-redux";

import BackButton from "Admin/components/back-btn";
import TinyMCE from "Admin/components/tiny-mce";
import { useTpsSelector } from "custom-hooks/use-tps-selector";
import { useRef } from "react";
import { setValues } from "redux-tps/features/product-slice";

const CRUDetailsDescription = () => {
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const { detail_description } = useTpsSelector((state) => state.product, {
    includeProps: ['detail_description'],
  })

  const handleSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      dispatch(setValues({ detail_description: content }) );
    }
  }

  console.log('RENDER: cru-dd-page');
  return (
    <Container className="tps-cru-dd-page">
      <BackButton />
      <TinyMCE initialValue={detail_description} editorRef={editorRef}/>
      <Button
        className="mt-3 ms-auto"
        variant="outline-success" onClick={handleSave}
      >
        Lưu
      </Button>
    </Container>
  );
};

export default CRUDetailsDescription;