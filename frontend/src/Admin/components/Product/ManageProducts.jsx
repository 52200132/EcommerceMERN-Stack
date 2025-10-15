import { Outlet } from "react-router-dom";

const ManageProducts = () => {
  return (
    <div>
      <h2>Manage Products</h2>

      {/* Add your product management UI here */}
      <Outlet />
    </div>
  );
}

export default ManageProducts;