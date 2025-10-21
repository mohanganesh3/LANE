import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatBreadcrumb = (str) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className="breadcrumb">
      <Link to="/" className="breadcrumb-item">
        🏠 Home
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <span key={name} className="breadcrumb-segment">
            <span className="breadcrumb-separator">›</span>
            {isLast ? (
              <span className="breadcrumb-item active">{formatBreadcrumb(name)}</span>
            ) : (
              <Link to={routeTo} className="breadcrumb-item">
                {formatBreadcrumb(name)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
