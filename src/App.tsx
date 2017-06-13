/*
* This file demonstrates a basic ReactXP app.
*/

import RX = require('reactxp');
import * as RxDB from 'rxdb';
import * as PouchDB from 'pouchdb';
import 'babel-polyfill';
import * as Rx from 'rxjs';

declare let ENV_PLATFORM;

const isWeb = RX.Platform.getType() !== 'ios' && RX.Platform.getType() !== 'android';

if (typeof ENV_PLATFORM !== 'undefined' && ENV_PLATFORM === 'web') {
  RxDB.plugin(require('pouchdb-adapter-idb'));
} else {
  RxDB.plugin(require('pouchdb-adapter-asyncstorage'));
}

RxDB.plugin(require('pouchdb-replication'));
RxDB.plugin(require('pouchdb-adapter-http'));

// for debugging only
declare const window: any;

const styles = {
  container: RX.Styles.createViewStyle({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fcff'
  }),
  helloWorld: RX.Styles.createTextStyle({
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 28
  }),
  welcome: RX.Styles.createTextStyle({
    fontSize: 32,
    marginBottom: 12
  }),
  instructions: RX.Styles.createTextStyle({
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40
  }),
  docLink: RX.Styles.createLinkStyle({
    fontSize: 16,
    color: 'blue'
  })
};

interface AppState {
  humans?: Array<any>;
}

class App extends RX.Component<{}, AppState> {
  private _translationValue: RX.Animated.Value;
  private _animatedStyle: RX.Types.AnimatedTextStyleRuleSet;
  private _col: RxDB.RxCollection = null;
  state: AppState = {
    humans: []
  };

  constructor() {
    super();

    this._translationValue = new RX.Animated.Value(-100);
    this._animatedStyle = RX.Styles.createAnimatedTextStyle({
      transform: [
        {
          translateY: this._translationValue
        }
      ]
    });

    RxDB.create({
      name: 'heroesdb',
      adapter: !isWeb ? 'asyncstorage' : 'idb',
      password: 'myPassword',
      multiInstance: true
    }).then((db) => {
      // for debug only, gives access to db object on console
      window.db = db;
      return db;
    }).then((db) => {
      return db.collection({
        name: 'humans',
        schema: {
          version: 0,
          type: 'object',
          properties: {
            name: 'name',
            age: 'age'
          }
        }
      });
    }).then(col => {
      // set instance variable
      this._col = col;
      return col;
    }).then(col => {
      // sync with couchdb
      this._col.sync('http://104.131.165.18:5984/db/');
      return col;
    }).then(col => {
      // $ returns an observable
      // returns new data whenever collection changes
      col.find().$.subscribe((humans) => {
        if (!humans) return;
        this.setState({
          humans: humans
        });
      });
    });
  }

  componentDidMount() {
    let animation = RX.Animated.timing(
      this._translationValue, {
        toValue: 0,
        easing: RX.Animated.Easing.OutBack(),
        duration: 500
      });
    animation.start();
  }

  render(): JSX.Element | null {
    return (
      <RX.View style={styles.container}>
        <RX.Animated.Text style={[styles.helloWorld, this._animatedStyle]}>
          Hello World
        </RX.Animated.Text>
        <RX.Text style={styles.welcome}>
          Welcome to ReactXP
        </RX.Text>
        <RX.Text>{this.state.humans.length}</RX.Text>
        {this.state.humans.map((human, i) => {
          return <RX.Text key={i}>
            {`${human.name} (${human.age})`}
          </RX.Text>
        })}
        <RX.Button onPress={this.addHuman}>
          <RX.Text>
            Click me please!
          </RX.Text>
        </RX.Button>
      </RX.View>
    );
  }

  addHuman = () => {
    // async-storage is way slower than indexDB
    // so we setState immediately with local changes
    // then once they're synced, we reset state based
    // on observed changes. A little redundant, but faster.
    const newHuman = {
      name: 'Nikolas',
      age: Date.now().toString()
    }
    const humans = [
      ...this.state.humans,
      newHuman
    ];
    this.setState({
      humans: humans
    });
    this._col.insert(newHuman);
  }
}

export = App;
