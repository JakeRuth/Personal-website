// Massive copy paste of index.html into this component, will refactor in follow up commits
function OldProjects() {
  return (
    <Fragment>
        <div id="portfolio-link"></div>

        <div className="portfolio-container">
          <h2 className="content-head is-center">Old Projects</h2>
          <div className="pure-g l-box">
            <div className="pure-u-1 pure-u-md-1-2 pure-u-lg-3-5">
              <h3 className="content-head">Youni iOS Mobile App (2015 - 2016)</h3>
              <p>
                See the video below (to the right on desktop) to see a real live demo of Youni!
              </p>
              <p>
                I created the mobile application Youni (no longer on app store) as a part of a startup venture I took on, acting
                as the Lead Developer and CTO.  The app was developed with <a href="https://facebook.github.io/react-native/">React Native</a> for
                the front-end.  I prototyped an API using Grails, the API was the real brain of the application that
                handled everything from authentication to generating post feeds and more.  The front end React Native project
                was lean and only served as a light rendering engine that made calls to the API.  The API was hosted using services
                provided by AWS.  I used MongoDB as my datastore.
              </p>
              <p>
                Reflection:  I am happy with the performanace of the app.  It handled thousands of users and thanks to AWS I was
                able to host the API in a scalable load balanced environment that scaled accordingly as the API received more traffic.
                In hindsight I would choose a different technology to create the API, since Grails had a slow startup time and
                was a bit heavy weight for what I needed.
              </p>
            </div>
            <div className="is-center pure-u-1 pure-u-md-1-2 pure-u-lg-2-5">
              <h4 className="content-head">Watch a live demo of Youni!</h4>
              <div className="portfolio-media-container">
                <iframe src="https://drive.google.com/file/d/0BzeuO4QnYgP3d0Vrb3oyOFVMRms/preview" width="300"></iframe>
              </div>
            </div>
          </div>
          <hr/>
          <div className="pure-g l-box">
            <div className="pure-u-1">
              <h3 className="content-head">Grails: Shiro Guard Plugin (2014)</h3>
              <p>
                View the plugin <a href="https://grails.org/plugin/shiro-guard">here</a>.
              </p>
              <p>
                Note: I created this plugin during the summer of 2014 while I was a full-time intern at
                <a href="http://www.commercehub.com/">CommerceHub</a>.  It is now deprecated and no longer maintained.
                However it is important to note this plugin was used in production for two years and it was a great personal accomplishment at the time.
              </p>
              <p>
                This plugin builds upon the <a href="http://grails.org/plugin/shiro">Apache Shiro Plugin</a> by adding a way to check to see if a user can
                access a URL, at the time of the request.  Without this plugin an authenticated user would gain permission to RESTful URLs either
                through a Role DB object, or through a bootstrap of permission strings into the browser session upon logging in.
                We found that managing permissions through this plugin helped us decrease user login times.  The code base also improved
                since we had an expressive way describe which users were allowed to access certain pages within our app.
              </p>
            </div>
          </div>
          <hr/>
          <div className="pure-g l-box">
            <div className="pure-u-1 pure-u-md-1-2 pure-u-lg-3-5">
              <h3 className="content-head">Private Contractor for <a href="http://myplasticbrain.com/">My Plastic Brain</a> (2013 - 2014)</h3>
              <p>
      					When I was a junior in college I began a private contract with My Plastic Brain Inc.  My job was to develop a multitude of html5 compliant
      					web games that were catered towards cognitive development.  Over the course of the contract I developed 30 different games.
      					I used the JavaScript framework <a href="http://kineticjs.com/">KineticJS</a> to create them (KineticJS is now deprecated and abondoned).
                I consistently communicated with the client over the phone to receive and collaborate on requirements for
                the various games.  I also onboarded and trained a friend to create the games, he then started a contract with the company.
              </p>
      			</div>
            <div className="is-center pure-u-1 pure-u-md-1-2 pure-u-lg-2-5">
              <h4 className="content-head">Play the Card Memory game! (Desktop only)</h4>
              <div className="portfolio-media-container">
                <a href="portfolioExternal/CardMemoryGame/index.html">
      						<img width="300" src="images/portfolio/card.png" />
      					</a>
              </div>
            </div>
          </div>
          <hr/>
          <div className="pure-g l-box">
            <div className="pure-u-1 pure-u-md-1-2 pure-u-lg-3-5">
              <h3 className="content-head">Re-developed 2048... for fun! (2014)</h3>
              <p>
                I re-coded the game 2048 as a html5 compliant web browser game.
      					I was inspired to re-code the game because when I played the app version, the animations were too slow and it
      					slowed down my game play.  I used <a href="http://kineticjs.com/">KineticJS</a> (no longer supported) to develop the game.
                It's important to note I never looked at pre-written code for 2048, I used my own wit to slowly figure out how to create it.
                At the time I created this I was still pretty new to web programming.  The code is stringy to say the least and the code quality is poor.
                I decided to put this on my portfolio because it demonstrates my creativity and ambition/motiviation to create software projects.
                On a positive note, you can button mash this game and abuse the arrow keys.  The tile animation is .03 seconds and this game
                can handle the fastest and most furious players.
              </p>
      			</div>
            <div className="is-center pure-u-1 pure-u-md-1-2 pure-u-lg-2-5">
              <h4 className="content-head">Try it out! (Only works on desktop)</h4>
              <div className="portfolio-media-container">
                <a href="portfolioExternal/2048-game/2048.html">
      						<img width="300" src="images/portfolio/2048.png" />
      					</a>
              </div>
            </div>
          </div>

        </div>
    </Fragment>
  );
}
