function LandingScreen() {
  return (
    <div className="splash-container">
      <a href="https://github.com/JakeRuth/Personal-website">
        <img className="forkme" src="images/forkme.png" />
      </a>

      <div className="social-media-container">
        <a href="https://www.facebook.com/jake.t.ruth">
          <img className="social" src="images/social/Facebook.png" />
        </a>
        <a href="https://www.linkedin.com/in/JakeRuth">
          <img className="social" src="images/social/Linkedin.png" />
        </a>
        <a href="https://github.com/JakeRuth">
          <img className="social" src="images/social/Share.png" />
        </a>
      </div>

      <img className="pure-img splash-container-background-image" src="images/background.jpg" />

      <div className="splash">
        <h1 className="splash-head">Jake Ruth</h1>
        <p className="splash-subhead">
          Senior Software Engineer at <a className="oscar-link" href="https://www.hioscar.com/">Oscar Health</a>
        </p>
        <a className="pure-button pure-button-primary" href="http://jakeruth.com/official_resume.pdf">Resume</a>
      </div>
    </div>
  );
}
