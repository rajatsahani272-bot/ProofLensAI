
import "./Card.css";

const Card = ({
  children,
  title,
  description,
  action,
  className = ""
}) => {
  return (
    <section className={`app-card ${className}`.trim()}>
      {(title || description || action) && (
        <div className="app-card-header">
          <div className="app-card-heading">
            {title && <h2 className="app-card-title">{title}</h2>}
            {description && (
              <p className="app-card-description">{description}</p>
            )}
          </div>

          {action && (
            <div className="app-card-action">{action}</div>
          )}
        </div>
      )}

      <div className="app-card-content">{children}</div>
    </section>
  );
};

export default Card;

