import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

import 'normalize.css/normalize.css';
import '@blueprintjs/core/dist/blueprint.css';
import '@blueprintjs/table/dist/table.css';
import './styles/index.css';

const render = () => {
    ReactDOM.render(<App/>, document.getElementById('root'));
};

render();