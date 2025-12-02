import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb as BsBreadcrumb } from 'react-bootstrap';


const linkMap = {
  admin: { name: 'Bảng điều khiển', path: '/admin' },
  dashboard: { name: 'Bảng điều khiển', path: '/admin/dashboard' },
  'manage-products': { name: 'Quản lý sản phẩm', path: '/admin/manage-products' },
  'warehouse': { name: 'Kho hàng', path: '/admin/manage-products' },
  'add-product': { name: 'Thêm sản phẩm', path: '/admin/manage-products/add-product' },
  'edit-product': { name: 'Chỉnh sửa sản phẩm', path: '/admin/manage-products/edit-product' },
  'manage-orders': { name: 'Quản lý đơn hàng', path: '/admin/manage-orders' },
  'manage-users': { name: 'Quản lý người dùng', path: '/admin/manage-users' },
  'manage-discounts': { name: 'Quản lý mã giảm giá', path: '/admin/manage-discounts' },
};


const Breadcrumb = () => {
  const { pathname } = useLocation();

  const breadcrumbArr = pathname
    .split('/')
    .filter((segment) => segment !== '')
    .map((segment) => linkMap[segment])
    .filter((obj) => obj !== undefined);
  const lastIndex = breadcrumbArr.length - 1;

  // console.log('Breadcrumb:', breadcrumbArr);
  return (
    <BsBreadcrumb className="tps-breadcrumbs">
      {breadcrumbArr.map((crumb, index) => (
        <Link
          key={crumb.path}
          to={index === lastIndex ? false : crumb.path}
          className={`breadcrumb-item ${index === lastIndex ? 'current' : ''}`}
        >
          {crumb.name}
        </Link>
      ))}
    </BsBreadcrumb>
  );
};

export default Breadcrumb;
