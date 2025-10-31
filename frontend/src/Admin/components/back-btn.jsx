import { Button } from "react-bootstrap";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const BackButton = (props) => {
  const navigate = useNavigate();
  return (
    <Button {...props} variant='link' onClick={() => navigate(-1)} className='text-decoration-none link-secondary g-1'>
      <MdOutlineKeyboardArrowLeft style={{ marginTop: '2px' }} size={20} /> Quay lại
    </Button>
  );
};

export default BackButton;