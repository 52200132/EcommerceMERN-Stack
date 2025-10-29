const AuthButtons = () => {
  return (
    <div className='tps-auth-buttons'>
      <ul>
        <li><Link to="/login">Đăng nhập</Link></li>
        <li><Link to="/register">Đăng ký</Link></li>
      </ul>
    </div>
  );
};

export default AuthButtons;
