import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { updateCredentials } from "#features/auth-slice";
import { useTpsSelector } from "#custom-hooks";

const ProtectedRoute = ({ redirectTo = "/login" }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoggedIn } = useTpsSelector(
    (state) => state.auth.user || {},
    { includeProps: ["isLoggedIn"] }
  );
  const [isChecking, setIsChecking] = useState(true);

  const cachedUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user")) || null;
    } catch (error) {
      console.error("Không thể đọc thông tin phiên người dùng", error);
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
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
