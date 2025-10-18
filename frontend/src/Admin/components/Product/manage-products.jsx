import { Outlet } from "react-router-dom";
// import TinyMCE from "Admin/components/tiny-mce";

const ManageProducts = () => {
  
  return (
    <div>
      <h2>Manage Products</h2>
      {/* <TinyMCE /> */}
      {/* Add your product management UI here */}
      <Outlet />
    </div>
  );
}

export default ManageProducts;