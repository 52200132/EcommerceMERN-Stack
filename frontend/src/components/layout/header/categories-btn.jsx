import { useState } from "react";
import { Button, Fade } from "react-bootstrap";

const CategoriesBtn = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      {/* Nút "Danh mục" */}
      <Button variant="danger" onClick={() => setShow(!show)} >
        ☰ Danh mục
      </Button>

      <Fade in={show} style={{
        position: 'absolute',
        top: '100px',
        width: '100%',
        height: '100px',
        backgroundColor: 'white',
      }}>
        <div id="example-fade-text">
          Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus
          terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer
          labore wes anderson cred nesciunt sapiente ea proident.
        </div>
      </Fade>
    </>
  );
}

export default CategoriesBtn;