import React, { useContext, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

export const AccountContext = React.createContext();

async function requestCreateNewAccount({
  username,
  email,
  password,
  handleError,
  endpoint
}) {
  if (!endpoint) return null;
  const response = await axios
    .post(`${endpoint}/auth/local/register`, {
      username,
      email,
      password
    })
    .catch(handleError);
  return response && response.data;
}

async function requestAccountLogin({
  identifier,
  password,
  handleError,
  endpoint
}) {
  if (!endpoint) return null;
  try {
    const response = await axios.post(`${endpoint}/auth/local`, {
      identifier,
      password
    });
    if (response) {
      sessionStorage.setItem('token', response.data.jwt);
      return response.data;
    }
    return null;
  } catch (e) {
    handleError(e.response.data);
  }
}

async function requestAccount(token, endpoint) {
  if (!endpoint) return null;
  const account = await axios
    .get(`${endpoint}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .catch(error => {
      // Handle error.
      return error;
    });
  return account.data;
}

export function useAccount() {
  const [token] = useState(() => sessionStorage.getItem('token'));
  const [loggingOut, setLoggingOut] = useState(false);
  const [account, setAccount, endpoint] = useContext(AccountContext);

  const logout = useCallback(
    callback => {
      sessionStorage.removeItem('token');
      setLoggingOut(true);
      setAccount({ endpoint });
      callback();
    },
    [endpoint, setAccount]
  );

  const clearError = useCallback(() => {
    setAccount({ ...account, error: null, endpoint });
  }, [account, endpoint, setAccount]);

  const getAccount = useCallback(() => {
    async function request() {
      const data = await requestAccount(token, endpoint);
      if (data) {
        setAccount({ ...account, jwt: token, user: data });
      }
    }
    if (!loggingOut) {
      request();
    }
  }, [account, endpoint, setAccount, token, loggingOut]);

  if (token && !account.user) {
    getAccount();
  }

  const createNewAccount = useCallback(
    options => {
      clearError();
      async function createAccount(options) {
        const data = await requestCreateNewAccount({
          ...options,
          handleError: error => setAccount({ ...account, error }),
          endpoint
        });
        if (data) {
          setAccount({ user: data });
        }
      }
      createAccount(options);
    },
    [account, clearError, setAccount, endpoint]
  );

  const login = useCallback(
    options => {
      clearError();
      async function attemptLogin(options) {
        const data = await requestAccountLogin({
          ...options,
          handleError: error => setAccount({ ...account, error }),
          endpoint
        });
        if (data) {
          setAccount(data);
        }
      }
      attemptLogin(options);
    },
    [account, clearError, endpoint, setAccount]
  );

  return {
    account,
    createNewAccount,
    login,
    logout,
    isLoggedIn: account && !!account.user && !!account.jwt
  };
}

export function Logout() {
  const { logout } = useAccount();
  return <button onClick={logout}>Logout</button>;
}

export function AccountProvider({ children, endpoint }) {
  const [account, setAccount] = useState({
    endpoint: endpoint || process.env.ENDPOINT
  });

  return (
    <AccountContext.Provider value={[account, setAccount, endpoint]}>
      {children}
    </AccountContext.Provider>
  );
}

export function CreateAccount({
  Form = 'form',
  Input = 'input',
  Label = 'label',
  Button = 'button'
}) {
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
    <Form onSubmit={create}>
      <Label>
        username
        <Input
          type="text"
          name="username"
          value={accountData.username}
          onChange={({ target }) =>
            setAccount({ ...accountData, username: target.value })
          }
        />
      </Label>
      <Label>
        email
        <Input
          type="text"
          name="email"
          value={accountData.email}
          onChange={({ target }) =>
            setAccount({ ...accountData, email: target.value })
          }
        />
      </Label>
      <Label>
        password
        <input
          type="password"
          name="password"
          value={accountData.password}
          onChange={({ target }) =>
            setAccount({ ...accountData, password: target.value })
          }
        />
      </Label>
      <Button type="submit">Create new account</Button>
    </Form>
  );
}

CreateAccount.propTypes = {
  Form: PropTypes.elementType,
  Label: PropTypes.elementType,
  Input: PropTypes.elementType,
  Button: PropTypes.elementType
};

export function Login({
  Form = 'form',
  Label = 'label',
  Input = 'input',
  Button = 'button',
  onLogin = () => {}
}) {
  const { login } = useAccount();

  const [accountData, setAccount] = useState({
    identifier: 'jmhudak@amazon.com',
    password: ''
  });
  function submitLogin(e) {
    e.preventDefault();
    login(accountData);
    onLogin();
  }
  return (
    <Form onSubmit={submitLogin}>
      <Label>
        <span>email or username</span>
        <Input
          autoComplete="identifier"
          type="text"
          name="identifier"
          value={accountData.username}
          onChange={({ target }) =>
            setAccount({ ...accountData, identifier: target.value })
          }
        />
      </Label>
      <Label>
        password
        <Input
          autoComplete="password"
          type="password"
          name="password"
          value={accountData.password}
          onChange={({ target }) =>
            setAccount({ ...accountData, password: target.value })
          }
        />
      </Label>
      <Button type="submit">Login</Button>
    </Form>
  );
}

Login.propTypes = {
  Form: PropTypes.elementType,
  Label: PropTypes.elementType,
  Input: PropTypes.elementType,
  Button: PropTypes.elementType,
  onLogin: PropTypes.func
};

export function useAccountUI() {
  const { isLoggedIn } = useAccount();
  return {
    isLoggedIn,
    CreateAccount,
    Login
  };
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

Account.propTypes = {
  children: PropTypes.node
};
