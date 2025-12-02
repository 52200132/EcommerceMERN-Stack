const ConfirmDialog = ({ message }) => {
  if (typeof message === "string") {
    return <p className="mb-0">{message}</p>;
  }
  return <div className="mb-0">{message}</div>;
};

export default ConfirmDialog;
