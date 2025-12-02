import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { updateCredentials } from "#features/auth-slice";
import { useTpsSelector } from "#custom-hooks";

const AdminRouteGuard = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoggedIn, isManager } = useTpsSelector(
    (state) => state.auth.user || {},
    { includeProps: ["isLoggedIn", "isManager"] }
  );
  const [isChecking, setIsChecking] = useState(true);

  const cachedUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user")) || null;
    } catch (error) {
      console.error("Không thể đọc thông tin phiên quản trị", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setIsChecking(false);
      return;
    }
    if (cachedUser?.token) {
      dispatch(updateCredentials(cachedUser));
    }
    setIsChecking(false);
  }, [cachedUser, dispatch, isLoggedIn]);

  if (isChecking) {
    return (
      <div className="tps-auth-guard__loading text-center py-5">
        Đang xác thực quản trị viên...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isManager) {
    return <Navigate to="/khong-co-quyen" replace />;
  }

  return <Outlet />;
};

export default AdminRouteGuard;
