import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
//import acc from "../assets/images/acc.jpg";

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false); // State to toggle the mobile menu
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("user-info");
    const userData = JSON.parse(data);
    setUserInfo(userData);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowDetails(false);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };
  const handleLogout = () => {
    localStorage.removeItem("user-info");
    navigate("/login");
  };

  return (
    <nav className="bg-[#173753] px-16 py-4 shadow-md">
      <ul className="flex justify-between items-center h-[50px]  text-black font-medium w-full">
        {/* Left-aligned link */}
        <li>
          <NavLink
            to="/"
            className="text-2xl sm:text-3xl md:text-5xl font-Eastham font-bold text-white"
            onClick={() => setMenuOpen(false)} // Close the menu when clicked on Udhhar
          >
            Udhhar
          </NavLink>
        </li>

        {/* Right-aligned links and profile */}
        <div className="flex items-center font-bold space-x-6 ml-auto">
          {/* Regular links for larger screens */}
          <div className="hidden md:flex space-x-6">
            {/* <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#6daedb] font-bold text-lg md:text-2xl"
                    : "text-white text-lg md:text-2xl hover:text-[#6daedb]"
                }
              >
                Dashboard
              </NavLink>
            </li> */}
            <li>
              <NavLink
                to="/Expense"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#6daedb] font-bold text-lg md:text-2xl"
                    : "text-white text-lg md:text-2xl hover:text-[#6daedb]"
                }
              >
                Expenses
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/Groups"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#6daedb] font-bold text-lg md:text-2xl"
                    : "text-white text-lg md:text-2xl hover:text-[#6daedb]"
                }
              >
                Groups
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/Friends"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#6daedb] font-bold text-lg md:text-2xl"
                    : "text-white text-lg md:text-2xl hover:text-[#6daedb]"
                }
              >
                Friends
              </NavLink>
            </li>
          </div>

          {/* Profile image and name */}
          <li className="relative flex items-center text-sm sm:text-base md:text-2xl text-white space-x-2 dropdown-container">
            <img
              src={userInfo?.image}
              alt={userInfo?.name}
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={toggleDetails}
            />
            {showDetails && (
               <div className="flex items-center space-x-2">
               <span>{userInfo?.name}</span>
               <button
                 onClick={handleLogout}
                 className="text-[#6daedb] hover:underline text-lg"
               >
                 Logout
               </button>
             </div>
            )}
          </li>

          {/* Hamburger icon for mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-8 h-8 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </ul>

      {/* Mobile menu (hamburger) */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center space-y-4 mt-4">
          <NavLink
            to="/"
            className="text-white text-lg"
            onClick={() => setMenuOpen(false)} // Close menu on click
          >
            Expenses
          </NavLink>
          <NavLink
            to="/Groups"
            className="text-white text-lg"
            onClick={() => setMenuOpen(false)}
          >
            Groups
          </NavLink>
          <NavLink
            to="/Friends"
            className="text-white  text-lg"
            onClick={() => setMenuOpen(false)}
          >
            Friends
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Nav;
