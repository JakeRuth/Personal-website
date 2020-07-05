// Followed this sweet blog post: https://medium.com/@PrudhviD/setup-reactjs-without-npm-and-webpack-77546436f0ed

// globals so we don't need to do React.* for everything...
const {
  createElement,
  Fragment,
} = React;

function App() {
  return (
    <Fragment>
      <StickyHeader />
      <LandingScreen />
      <div className="content-wrapper">
        <AboutMe />
        <TechStack />
        <OldProjects />
      </div>
    </Fragment>
  );
}

ReactDOM.render(
  createElement(App),
  document.querySelector('#reactjs-root'),
);
