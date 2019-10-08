import ReactDOM from 'react-dom';
import React from 'react';
import { Account, AccountProvider, Logout } from '.';

function App() {
  return (
    <div>
      <AccountProvider>
        <Account>
          <h1>Authorized content</h1>
          <Logout />
        </Account>
      </AccountProvider>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
