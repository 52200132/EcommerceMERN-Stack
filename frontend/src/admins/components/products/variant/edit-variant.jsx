
import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "react-bootstrap";

import Variant from "./variant";
import ComponentNotFound from "../../component-not-found";

import { useDispatch } from "react-redux";
import { changeContent } from "redux-tps/features/index-features";

const EditVariant = ({ variantIndex }) => {
  variantIndex = variantIndex || 0;
  const dispatch = useDispatch();

  console.log('RENDER: edit-variant');
  if (variantIndex === undefined) {
    return <ComponentNotFound />;
  }
  return (
    <>
      <div>EditVariant Component</div>
      <div>
        <Variant {...{variantIndex}}/>
      </div>
    </>
  );
}

export default EditVariant;