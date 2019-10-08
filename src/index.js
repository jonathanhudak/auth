import React, { useContext, useCallback, useState } from 'react';
import axios from 'axios';

export const AccountContext = React.createContext();

async function requestCreateNewAccount({ username, email, password }) {
  const response = await axios
    .post(`${process.env.ENDPOINT}/auth/local/register`, {
      username,
      email,
      password
    })
    .catch(error => {
      // Handle error.
      console.log('An error occurred:', error);
    });
  return response && response.data;
}

async function requestAccountLogin({ identifier, password, token }) {
  const response = await axios
    .post(`${process.env.ENDPOINT}/auth/local`, {
      identifier,
      password
    })
    .catch(error => {
      // Handle error.
      console.log('An error occurred:', error);
    });
  if (response) {
    sessionStorage.setItem('token', response.data.jwt);
    return response.data;
  }
  return null;
}

async function requestAccount(token) {
  const account = await axios
    .get(`${process.env.ENDPOINT}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .catch(error => {
      // Handle error.
      console.log('An error occurred:', error);
    });
  return account.data;
}

export function useAccount() {
  const [token] = useState(() => sessionStorage.getItem('token'));
  const [account, setAccount] = useContext(AccountContext);

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    setAccount(null);
    window.location.reload();
  }, [setAccount]);

  const getAccount = useCallback(() => {
    async function request() {
      const data = await requestAccount(token);
      setAccount(data);
    }
    request();
  }, [setAccount, token]);

  if (!account && token) {
    getAccount();
  }

  const createNewAccount = useCallback(
    options => {
      async function createAccount(options) {
        const data = await requestCreateNewAccount(options);
        setAccount(data);
      }
      createAccount(options);
    },
    [setAccount]
  );

  const login = useCallback(
    options => {
      async function attemptLogin(options) {
        const data = await requestAccountLogin(options);
        setAccount(data);
      }
      attemptLogin(options);
    },
    [setAccount]
  );

  return {
    account,
    createNewAccount,
    login,
    logout,
    isLoggedIn: !!account
  };
}

export function Logout() {
  const { logout } = useAccount();
  return <button onClick={logout}>Logout</button>;
}

export function AccountProvider({ children }) {
  const [account, setAccount] = useState(null);
  return (
    <AccountContext.Provider value={[account, setAccount]}>
      {children}
    </AccountContext.Provider>
  );
}

function CreateAccount() {
  const { createNewAccount } = useAccount();
  const [accountData, setAccount] = useState({
    username: 'jmhudak',
    email: 'jmhudak@amazon.com',
    password: 'tacoma'
  });
  function create(e) {
    e.preventDefault();
    createNewAccount(accountData);
  }
  return (
    <form onSubmit={create}>
      <label>
        username
        <input
          type="text"
          name="username"
          value={accountData.username}
          onChange={({ target }) =>
            setAccount({ ...accountData, username: target.value })
          }
        />
      </label>
      <label>
        email
        <input
          type="text"
          name="email"
          value={accountData.email}
          onChange={({ target }) =>
            setAccount({ ...accountData, email: target.value })
          }
        />
      </label>
      <label>
        password
        <input
          type="password"
          name="password"
          value={accountData.password}
          onChange={({ target }) =>
            setAccount({ ...accountData, password: target.value })
          }
        />
      </label>
      <button type="submit">Create</button>
    </form>
  );
}

function Login() {
  const { login } = useAccount();
  const [accountData, setAccount] = useState({
    identifier: 'jmhudak@amazon.com',
    password: ''
  });
  function create(e) {
    e.preventDefault();
    login(accountData);
  }
  return (
    <form onSubmit={create}>
      <label>
        email or username
        <input
          autoComplete="identifier"
          type="text"
          name="identifier"
          value={accountData.username}
          onChange={({ target }) =>
            setAccount({ ...accountData, identifier: target.value })
          }
        />
      </label>
      <label>
        password
        <input
          autoComplete="password"
          type="password"
          name="password"
          value={accountData.password}
          onChange={({ target }) =>
            setAccount({ ...accountData, password: target.value })
          }
        />
      </label>
      <button type="submit">Login</button>
    </form>
  );
}

export function Account({ children }) {
  const { isLoggedIn } = useAccount();
  const [state, setState] = useState('login');
  if (isLoggedIn) {
    return children;
  }

  if (state === 'register') {
    return (
      <div>
        <CreateAccount />
        <button onClick={() => setState('login')}>
          Login to existing account
        </button>
      </div>
    );
  }

  return (
    <div>
      <Login />
      <button onClick={() => setState('register')}>
        Register a new account
      </button>
    </div>
  );
}
