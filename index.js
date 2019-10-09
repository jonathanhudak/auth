import React, { useState, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const AccountContext = React.createContext();

async function requestCreateNewAccount({
  username,
  email,
  password,
  handleError
}) {
  const response = await axios.post(`${process.env.ENDPOINT}/auth/local/register`, {
    username,
    email,
    password
  }).catch(handleError);
  return response && response.data;
}

async function requestAccountLogin({
  identifier,
  password,
  handleError
}) {
  try {
    const response = await axios.post(`${process.env.ENDPOINT}/auth/local`, {
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

async function requestAccount(token) {
  const account = await axios.get(`${process.env.ENDPOINT}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).catch(error => {
    // Handle error.
    return error;
  });
  return account.data;
}

function useAccount() {
  const [token] = useState(() => sessionStorage.getItem('token'));
  const [account, setAccount] = useContext(AccountContext);
  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    setAccount(null);
  }, [setAccount]);
  const clearError = useCallback(() => {
    setAccount({ ...account,
      error: null
    });
  }, [account, setAccount]);
  const getAccount = useCallback(() => {
    async function request() {
      const data = await requestAccount(token);

      if (data) {
        setAccount({ ...account,
          jwt: token,
          user: data
        });
      }
    }

    request();
  }, [account, setAccount, token]);

  if (token && !account) {
    getAccount();
  }

  const createNewAccount = useCallback(options => {
    clearError();

    async function createAccount(options) {
      const data = await requestCreateNewAccount({ ...options,
        handleError: error => setAccount({ ...account,
          error
        })
      });

      if (data) {
        setAccount(data);
      }
    }

    createAccount(options);
  }, [account, clearError, setAccount]);
  const login = useCallback(options => {
    clearError();

    async function attemptLogin(options) {
      const data = await requestAccountLogin({ ...options,
        handleError: error => setAccount({ ...account,
          error
        })
      });

      if (data) {
        setAccount(data);
      }
    }

    attemptLogin(options);
  }, [account, clearError, setAccount]);
  return {
    account,
    createNewAccount,
    login,
    logout,
    isLoggedIn: account && !!account.user && !!account.jwt
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

function CreateAccount({
  Form = 'form',
  Input = 'input',
  Label = 'label',
  Button = 'button'
}) {
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

  return React.createElement(Form, {
    onSubmit: create
  }, React.createElement(Label, null, "username", React.createElement(Input, {
    type: "text",
    name: "username",
    value: accountData.username,
    onChange: ({
      target
    }) => setAccount({ ...accountData,
      username: target.value
    })
  })), React.createElement(Label, null, "email", React.createElement(Input, {
    type: "text",
    name: "email",
    value: accountData.email,
    onChange: ({
      target
    }) => setAccount({ ...accountData,
      email: target.value
    })
  })), React.createElement(Label, null, "password", React.createElement("input", {
    type: "password",
    name: "password",
    value: accountData.password,
    onChange: ({
      target
    }) => setAccount({ ...accountData,
      password: target.value
    })
  })), React.createElement(Button, {
    type: "submit"
  }, "Create new account"));
}

CreateAccount.propTypes = {
  Form: PropTypes.elementType,
  Label: PropTypes.elementType,
  Input: PropTypes.elementType,
  Button: PropTypes.elementType
};

function Login({
  Form = 'form',
  Label = 'label',
  Input = 'input',
  Button = 'button'
}) {
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

  return React.createElement(Form, {
    onSubmit: create
  }, React.createElement(Label, null, "email or username", React.createElement(Input, {
    autoComplete: "identifier",
    type: "text",
    name: "identifier",
    value: accountData.username,
    onChange: ({
      target
    }) => setAccount({ ...accountData,
      identifier: target.value
    })
  })), React.createElement(Label, null, "password", React.createElement("input", {
    autoComplete: "password",
    type: "password",
    name: "password",
    value: accountData.password,
    onChange: ({
      target
    }) => setAccount({ ...accountData,
      password: target.value
    })
  })), React.createElement(Button, {
    type: "submit"
  }, "Login"));
}

Login.propTypes = {
  Form: PropTypes.elementType,
  Label: PropTypes.elementType,
  Input: PropTypes.elementType,
  Button: PropTypes.elementType
};
function useAccountUI() {
  const {
    isLoggedIn
  } = useAccount();
  return {
    isLoggedIn,
    CreateAccount,
    Login
  };
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
Account.propTypes = {
  children: PropTypes.node
};

export { Account, AccountContext, AccountProvider, Logout, useAccount, useAccountUI };
