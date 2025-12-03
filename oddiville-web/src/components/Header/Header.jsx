import { NavLink, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formatBreadcrumb = (str) =>
  str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const Header = ({ onSidebarToggle }) => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <>
      <nav
        className="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl"
        id="navbarBlur"
        navbar-scroll="true"
      >
        <div className="container-fluid py-1 px-3">
          <button
            className="btn btn-link d-lg-none"
            onClick={onSidebarToggle}
            style={{ fontSize: 24 }}
          >
            <i className="fas fa-bars"></i>
          </button>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
              <li className="breadcrumb-item text-sm">
                <NavLink className="opacity-5 text-dark" to="/">
                  Home
                </NavLink>
              </li>
              {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                const isLast = index === pathnames.length - 1;
                return isLast ? (
                  <li
                    className="breadcrumb-item text-sm text-dark active"
                    aria-current="page"
                    key={name}
                  >
                    {formatBreadcrumb(name)}
                  </li>
                ) : (
                  <li className="breadcrumb-item text-sm" key={name}>
                    <NavLink className="opacity-5 text-dark" to={routeTo}>
                      {formatBreadcrumb(name)}
                    </NavLink>
                  </li>
                );
              })}
            </ol>
            <h6 className="font-weight-bolder mb-0">
              {pathnames.length > 0
                ? formatBreadcrumb(pathnames[pathnames.length - 1])
                : "Home"}
            </h6>
          </nav>
          <div
            className="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4"
            id="navbar"
          >
            <ul className="navbar-nav  justify-content-end">
              <li className="nav-item d-flex align-items-center">
                <NavLink
                  to="/logout"
                  href="javascript:;"
                  className="nav-link text-body font-weight-bold px-0"
                >
                  <i className="fa fa-user me-sm-1" />
                  <span className="d-sm-inline d-none">LogOut</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default Header;
