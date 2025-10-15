import { Outlet } from "react-router-dom";
import Footer from "../Footer";
import Header from "../Header/Header";

const Layout = () => {
  return (
    <>
      <Header />
      <div className="tps-content-container">
        <Outlet/>
      </div>
      <Footer/>
    </>
  );
}

export default Layout;
