import React, { useState, useContext, useCallback } from 'react';
import axios from 'axios';

const AccountContext = React.createContext();

async function requestCreateNewAccount({
  username,
  email,
  password
}) {
  const response = await axios.post(`${process.env.ENDPOINT}/auth/local/register`, {
    username,
    email,
    password
  }).catch(error => {
    // Handle error.
    console.log('An error occurred:', error);
  });
  return response && response.data;
}

async function requestAccountLogin({
  identifier,
  password,
  token
}) {
  const response = await axios.post(`${process.env.ENDPOINT}/auth/local`, {
    identifier,
    password
  }).catch(error => {
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
  const account = await axios.get(`${process.env.ENDPOINT}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).catch(error => {
    // Handle error.
    console.log('An error occurred:', error);
  });
  return account.data;
}

function useAccount() {
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

  const createNewAccount = useCallback(options => {
    async function createAccount(options) {
      const data = await requestCreateNewAccount(options);
      setAccount(data);
    }

    createAccount(options);
  }, [setAccount]);
  const login = useCallback(options => {
    async function attemptLogin(options) {
      const data = await requestAccountLogin(options);
      setAccount(data);
    }

    attemptLogin(options);
  }, [setAccount]);
  return {
    account,
    createNewAccount,
    login,
    logout,
    isLoggedIn: !!account
  };
}
function Logout() {
  const {
    logout
  } = useAccount();
  return React.createElement("button", {
    onClick: logout
  }, "Logout");
}
function AccountProvider({
  children
}) {
  const [account, setAccount] = useState(null);
  return React.createElement(AccountContext.Provider, {
    value: [account, setAccount]
  }, children);
}

function CreateAccount() {
  const {
    createNewAccount
  } = useAccount();
  const [accountData, setAccount] = useState({
    username: 'jmhudak',
    email: 'jmhudak@amazon.com',
    password: 'tacoma'
  });

  function create(e) {
    e.preventDefault();
    createNewAccount(accountData);
  }

  return React.createElement("form", {
    onSubmit: create
  }, React.createElement("label", null, "username", React.createElement("input", {
    type: "text",
    name: "username",
    value: accountData.username,
    onChange: ({
      target
    }) => setAccount({ ...accountData,
      username: target.value
    })
  })), React.createElement("label", null, "email", React.createElement("input", {
    type: "text",
    name: "email",
    value: accountData.email,
    onChange: ({
      target
    }) => setAccount({ ...accountData,
      email: target.value
    })
  })), React.createElement("label", null, "password", React.createElement("input", {
    type: "password",
    name: "password",
    value: accountData.password,
    onChange: ({
      target
    }) => setAccount({ ...accountData,
      password: target.value
    })
  })), React.createElement("button", {
    type: "submit"
  }, "Create"));
}

function Login() {
  const {
    login
  } = useAccount();
  const [accountData, setAccount] = useState({
    identifier: 'jmhudak@amazon.com',
    password: ''
  });

  function create(e) {
    e.preventDefault();
    login(accountData);
  }

  return React.createElement("form", {
    onSubmit: create
  }, React.createElement("label", null, "email or username", React.createElement("input", {
    autoComplete: "identifier",
    type: "text",
    name: "identifier",
    value: accountData.username,
    onChange: ({
      target
    }) => setAccount({ ...accountData,
      identifier: target.value
    })
  })), React.createElement("label", null, "password", React.createElement("input", {
    autoComplete: "password",
    type: "password",
    name: "password",
    value: accountData.password,
    onChange: ({
      target
    }) => setAccount({ ...accountData,
      password: target.value
    })
  })), React.createElement("button", {
    type: "submit"
  }, "Login"));
}

function Account({
  children
}) {
  const {
    isLoggedIn
  } = useAccount();
  const [state, setState] = useState('login');

  if (isLoggedIn) {
    return children;
  }

  if (state === 'register') {
    return React.createElement("div", null, React.createElement(CreateAccount, null), React.createElement("button", {
      onClick: () => setState('login')
    }, "Login to existing account"));
  }

  return React.createElement("div", null, React.createElement(Login, null), React.createElement("button", {
    onClick: () => setState('register')
  }, "Register a new account"));
}

export { Account, AccountContext, AccountProvider, Logout, useAccount };
