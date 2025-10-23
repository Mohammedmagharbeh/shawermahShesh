import { Link } from "react-router-dom";

function NavLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-sm xl:text-base text-gray-700 hover:text-red-700 font-semibold transition-all duration-300 whitespace-nowrap relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-red-600 after:to-yellow-500 hover:after:w-full after:transition-all after:duration-300"
    >
      {label}
    </Link>
  );
}
export default NavLink;
