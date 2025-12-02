import { forwardRef } from "react";
import { Button } from "react-bootstrap";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const BackButton = forwardRef(({ onBack, className, ...rest }, ref) => {
  const navigate = useNavigate();
  const mergedClassName = ['text-decoration-none link-secondary g-1', className].filter(Boolean).join(' ');

  const handleClick = (e) => {
    onBack?.(e);
    navigate(-1);
  };

  return (
    <Button
      {...rest}
      ref={ref}
      variant='link'
      onClick={handleClick}
      className={mergedClassName}
    >
      <MdOutlineKeyboardArrowLeft style={{ marginTop: '2px' }} size={20} /> Quay lại
    </Button>
  );
});

export default BackButton;
