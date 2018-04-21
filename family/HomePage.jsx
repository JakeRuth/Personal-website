class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      childToFamilyJson: undefined,
      familyJson: undefined,
      personJson: undefined,
      placeJson: undefined,
    };
  }

  componentDidMount() {
    loadFile('./gedcom/childToFamily.csv', (json) => {
      this.setState({childToFamilyJson: json});
    });
    loadFile('./gedcom/family.csv', (json) => {
      this.setState({familyJson: json});
    });
    loadFile('./gedcom/person.csv', (json) => {
      this.setState({personJson: json});
    });
    loadFile('./gedcom/places.csv', (json) => {
      this.setState({placeJson: json});
    });
  }

  render() {
    return (
      <div>
        <h1>An attempt at parsing csv files generated from gedcom files, fun!</h1>
        <hr/>
        <br/><br/>

        <ExtremeUniversalSearch
          familyJson={this.state.familyJson}
          personJson={this.state.personJson}
          placeJson={this.state.placeJson}
        />
        <br/><br/>
        <hr/>

        <h2>Below is a data dump of the csv files.</h2>
        <h3>Person JSON</h3>
        <PapaParseTableView json={this.state.personJson}/>
        <hr/>

        <h3>Family JSON</h3>
        <PapaParseTableView json={this.state.familyJson}/>
        <hr/>

        <h3>Place JSON</h3>
        <PapaParseTableView json={this.state.placeJson}/>
        <hr/>

        <h3>Child to family JSON</h3>
        <PapaParseTableView json={this.state.childToFamilyJson}/>
      </div>
    );
  }
}

// it's extreme cause the search does a string contains on every field in the json ;)
// why? DO IT FOR THE PEOPLE
class ExtremeUniversalSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: undefined,
    };
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  };

  getJsonWithSearchResults = (json) => {
    const jsonCopy = {...json};
    jsonCopy.data = [];

    if (!this.state.input) return jsonCopy;

    jsonCopy.data = json.data.map((field, index) => {
      let match = false;
      Object.keys(field).map((key) => {
        if (field[key] && typeof field[key] === "string" && field[key].toUpperCase().includes(this.state.input.toUpperCase())) {
          match = true;
        } else if (field[key] && typeof field[key] === "number" && field[key].toString().toUpperCase().includes(this.state.input.toUpperCase())) {
          match = true;
        }
      });

      if (match) {
        return field;
      }
    }).filter(v => !!v);
    return jsonCopy;
  }

  renderResult(json, label) {
    return (
      <div>
        <h2>{label}</h2>
        <PapaParseTableView json={this.getJsonWithSearchResults(json)} />
      </div>
    );
  }

  renderAllResults() {
    if (!this.state.input) return;

    return (
      <div>
        {this.renderResult(this.props.familyJson, 'Family matches')}
        {this.renderResult(this.props.personJson, 'Person matches')}
        {this.renderResult(this.props.placeJson, 'Place matches')}
      </div>
    );
  }

  render() {
    // do not render until all json files are loaded, this is kinda gross but whatever
    if (!this.props.familyJson || !this.props.personJson || !this.props.placeJson) {
      return <div />;
    }

    return (
      <div>
        <label>Search for names, dates, places, etc!</label>
        <input
          onChange={this.onInputChange}
          maxLength={100}
          placeholder="Explore"
          size={30}
        />
        {this.renderAllResults()}
      </div>
    );
  }
}

class PapaParseTableView extends React.Component {
  render() {
    if (!this.props.json) {
      return <div />;
    }

    if (!this.props.json.data || ! this.props.json.data.length) {
      return <span>No Data</span>;
    }

    return (
      <table>
        <thead>
          <tr>
            {this.props.json.meta.fields.map((headerField) => {
              return <th key={headerField}>{headerField}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {this.props.json.data.map((field) => {
            return (
              <tr>
                {Object.keys(field).map((key) => {
                  return <th key={key}>{field[key]}</th>
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    )
  }
}

// For config definition
const PAPA_PARSE_CONFIG = {
  header: true,
  dynamicTyping: true,
};
// Copied from https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
function loadFile(file, callback) {
  const rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = () => {
    if(rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status == 0)) {
      const json = Papa.parse(rawFile.responseText, PAPA_PARSE_CONFIG);
      callback(json);
    }
  }
  rawFile.send(null);
}
