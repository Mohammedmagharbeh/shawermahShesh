import { Link } from "react-router-dom";

function NavLink({ to, label, onClick, className }) {
  return (
    <Link to={to} onClick={onClick} className={className}>
      {label}
    </Link>
  );
}
export default NavLink;
