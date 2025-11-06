import { Outlet } from "react-router-dom";
import './manage-products-layout.scss';

const ManageProducts = () => {

  return (
    <div className="tps-manage-products-layout">
      <Outlet />
    </div>
  );
}

export default ManageProducts;