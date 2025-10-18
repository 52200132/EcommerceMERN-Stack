import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux-tps/store';

// css file
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/LineIcons.3.0.css';
import './assets/css/main.css';
import './index.scss';

// js file
import './assets/js/main.js';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <Provider store={store}>
        <App />
    </Provider>
  </BrowserRouter>
  // </React.StrictMode>
);
