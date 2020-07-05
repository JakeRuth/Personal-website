function TechStack() {
  return (
    <Fragment>
      <div id="tech-stack-link"></div>

      <div id="tech-stack" className="ribbon">
        <h2 className="content-head content-head-ribbon is-center">My Tech Stack</h2>
        <p className="content-head-subtitle is-center">* indicates I'm just familiar/it's been a while</p>

        <div className="tech-stack-items-container">
          <p>JavaScript (ReactJS/Redux)</p>
          <p>Python (Flask)</p>
          <p>Go (Golang)*</p>
          <p>Java/Groovy*</p>
          <p>Thrift/Grpc</p>
          <p>Git</p>
          <p>Node/Npm</p>
          <p>SQL/Postgres</p>
          <p>Docker</p>
          <p>Html</p>
          <p>CSS</p>
        </div>
      </div>
    </Fragment>
  );
}
