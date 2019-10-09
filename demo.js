import ReactDOM from 'react-dom';
import React from 'react';
import styled from '@emotion/styled';
import { Account, AccountProvider, Logout, useAccountUI, useAccount } from '.';

const ErrorMessage = styled.p`
  padding: 8px;
  background: tomato;
  color: white;
`;

function Notification() {
  const { account } = useAccount();

  if (account && account.error) {
    return <ErrorMessage>{account.error.message}</ErrorMessage>;
  }

  return null;
}

function App() {
  return (
    <div>
      <AccountProvider>
        <Notification />
        <Account>
          <h1>Authorized content</h1>
          <Logout />
        </Account>
      </AccountProvider>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
