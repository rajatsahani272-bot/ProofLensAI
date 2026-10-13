
import { LoaderCircle } from "lucide-react";
import "./Button.css";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${className}`.trim()}
      {...props}
    >
      {loading && (
        <LoaderCircle size={18} className="btn-loader" />
      )}
      {children}
    </button>
  );
};

export default Button;
