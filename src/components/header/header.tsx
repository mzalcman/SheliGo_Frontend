import "./header.css";
import { Bell, MessageCircle } from "lucide-react";
import { useAuth } from "../../hooks/use_auth";
import { useNavigate } from "react-router-dom";
import { getImageUrl, } from "../../utils/get_image_url";

const Header = () => {

  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="header">

      <button
        className="header_profile_button"
        onClick={() => navigate("/menu")}
      >

        <img
          src={
            user?.profile_image
              ? getImageUrl(user.profile_image)
              : "/default-user.png"
          }
          alt="user profile"
          className="header_profile_image"
          onError={(event) => {
            event.currentTarget.src =
              "/user_predeterminada.png";
          }}
        />

      </button>

      <div className="header_icons">

        <button 
        className="header_icon_button" 
        onClick={() => navigate('/chats')}>
          <MessageCircle
            size={34}
            strokeWidth={2.2}
          />
        </button>

        <button className="header_icon_button" >
          <Bell
            size={34}
            strokeWidth={2.2}
          />
        </button>

      </div>

    </header>
  );
};

export default Header;