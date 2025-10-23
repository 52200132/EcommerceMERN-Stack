import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react'

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import Layout from './components/Layout/Layout';
import ProductDetails from './components/ProductDetails/ProductDetails';

import ManageProducts from 'Admin/components/Product/manage-products';
import ManageProductsLayout from 'Admin/components/Product/manage-products-layout';
import AddProduct from 'Admin/components/Product/add-product';

// import NotFoundPage from './pages/NotFoundPage'; // Optional: Create a 404 page component
import './App.css';

const AdminLayout = lazy(() => import('./Admin/Layout'))


const App = () => {
  const allowedCategorySlugs = ['may-tinh', 'dien-thoai'];

  return (
    <Suspense fallback={<div>⏳ Loading page...</div>}>
      <Routes>
        <Route element={<Layout />}>
          {allowedCategorySlugs && allowedCategorySlugs.length > 0 &&
            allowedCategorySlugs.map((category) => (
              <Route
                key={category}
                path={`${category}/:productNameSlug`}
                element={<ProductDetails />}
              />
            ))}
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          {/* Add more routes as needed */}
          <Route path="*" element={
            <div className="container section">
              <div className="row">
                <div className="col-12 text-center">
                  <div className="alert alert-warning">
                    <h1>404</h1>
                    <h4>Page Not Found</h4>
                    <p>The page you are looking for doesn't exist.</p>
                    <a href="/" className="btn btn-primary">Go Home</a>
                  </div>
                </div>
              </div>
            </div>
          } />
        </Route>

        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<div>Admin Home</div>} />
          <Route path="manage-products" element={<ManageProducts />}>
            <Route index element={<ManageProductsLayout />} />
            <Route path="add-product" element={<AddProduct />} />
          </Route>
        </Route>

      </Routes>
    </Suspense>

  );
}

export default App;
