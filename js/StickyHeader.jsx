function StickyHeader() {
  return (
    <div className="header">
      <div className="home-menu pure-menu pure-menu-horizontal pure-menu-fixed">
        <img className="pure-menu-heading pure-img menu-heading-image" src="images/logo.gif" />

        <ul className="pure-menu-list">
          <li className="pure-menu-item"><a href="#" className="pure-menu-link">Home</a></li>
          <li className="pure-menu-item"><a href="#tech-stack-link" className="pure-menu-link">Tech Stack</a></li>
          <li className="pure-menu-item"><a href="#portfolio-link" className="pure-menu-link">Old Projects</a></li>
        </ul>
      </div>
    </div>
  );
}
