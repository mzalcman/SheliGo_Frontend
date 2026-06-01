import "./header.css";
import { Bell, MessageCircle } from "lucide-react";
import { useAuth } from "../../hooks/use_auth";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">

      <button className="header_profile_button">

        <img
          src={user?.profile_image || "/default-user.png"}
          alt="user profile"
          className="header_profile_image"
        />

      </button>

      <div className="header_icons">

        <button className="header_icon_button">
          <MessageCircle size={34} strokeWidth={2.2} />
        </button>

        <button className="header_icon_button">
          <Bell size={34} strokeWidth={2.2} />
        </button>

      </div>

    </header>
  );
};

export default Header;