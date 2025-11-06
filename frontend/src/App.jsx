import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react'

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/auth/login-page';
import RegisterPage from './pages/auth/register-page';
import ProductDetails from './components/ProductDetails/ProductDetails';

import ManageProductsLayout from 'admins/pages/product/manage-products-layout';
import ManageProductsPage from 'admins/pages/product/manage-products-page'
import CRUProduct from 'admins/pages/product/cru-product-page';
import CRUDetailsDescription from './admins/pages/product/cru-dd-page';

// import NotFoundPage from './pages/NotFoundPage'; // Optional: Create a 404 page component
// import './App.css';

const adminsLayout = lazy(() => import('./admins/layout'))
const Layout = lazy(() => import('./layout'))

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

        <Route path="/admin/*" element={<adminsLayout />}>
          <Route index element={<div>admins Home</div>} />
          <Route path="manage-products" element={<ManageProductsLayout />}>
            <Route index element={<ManageProductsPage />} />
            <Route path="add-product" element={<CRUProduct action='create'/>} />
            <Route path="edit-product/:productId" element={<CRUProduct action='update'/>} />
            <Route path="add-product/description" element={<CRUDetailsDescription />} />
          </Route>
        </Route>

      </Routes>
    </Suspense>

  );
}

export default App;
