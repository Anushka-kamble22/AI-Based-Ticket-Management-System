export default function Loader({ text = "Loading..." }) {
  return (
    <div className="loader-wrapper">

      <div className="glass-loader-card">

        <div className="glass-spinner"></div>

        {text && (
          <p className="loader-text">
            {text}
          </p>
        )}

      </div>

    </div>
  );
}