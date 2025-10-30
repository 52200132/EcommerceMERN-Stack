import { useTpsSelector } from "custom-hooks";
import parse from "html-react-parser";

const AttributesReview = ({ selector, htmlTextAttributes }) => {
  const { html_text_attributes = htmlTextAttributes } = useTpsSelector(selector, { includeProps: ['html_text_attributes'] });

  return (
    <div>{parse(html_text_attributes)}</div>
  );
}

export default AttributesReview;