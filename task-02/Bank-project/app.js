const baseURL = '//localhost:5001'; // Base URL for API requests

const routes = {
  '/login': { templateId: 'login', title: 'login-page'}, // Route for login page
  '/dashboard': { templateId: 'dashboard', title: 'dashboard-page' }, // Route for dashboard
  '/page3' : { templateId: "page3", title: 'page3-page'} // Route for page3
};

let account = null; // Stores the logged-in user account

function updateElement(id, textOrNode) {
  const element = document.getElementById(id);
  element.textContent = ''; // Removes all children
  element.append(textOrNode); // Updates element with new content
}

async function login() {
  const loginForm = document.getElementById('loginForm');
  const user = loginForm.user.value; // Get user input from login form
  const data = await getAccount(user); // Fetch account data

  if (data.error) {
    return updateElement('loginError', data.error); // Display error message
  } else {
    updateElement('loginError', ' '); // Clear error message
  }

  account = data; // Store account data
  navigate('/dashboard'); // Redirect to dashboard
}

async function getAccount(user) {
  try {
    const response = await fetch(`${baseURL}/api/accounts/` + encodeURIComponent(user)); // Fetch account details
    return await response.json(); // Parse response JSON
  } catch (error) {
    return { error: error.message || 'Unknown error' }; // Handle errors
  }
}

async function createAccount(account) {
  try {
    const response = await fetch(`${baseURL}/api/accounts/`, {
      method: 'POST', // HTTP POST request
      headers: { 'Content-Type': 'application/json' },
      body: account // Send account data as JSON
    });
    return await response.json(); // Parse response JSON
  } catch (error) {
    return { error: error.message || 'Unknown error' }; // Handle errors
  }
}

async function register() {
  const registerForm = document.getElementById('registerForm');
  const formData = new FormData(registerForm); // Get form data
  const jsonData = JSON.stringify(Object.fromEntries(formData)); // Convert form data to JSON
  const result = await createAccount(jsonData); // Send data to create account

  if (result.error) {
    document.getElementById('regesterError').innerHTML = `An error occurred , ${result.error}`; // Display error message
  } else {
    document.getElementById('regesterError').innerHTML = " "; // Clear error message
  }

  account = result; // Store account data
  navigate('/dashboard'); // Redirect to dashboard
}

function datapush(id, date, object, amount) {
  let transaction = { id, date, object, amount: parseFloat(amount) }; // Create transaction object
  account.transactions.push(transaction); // Add transaction to account
}

function addTransaction() {
  let dateElement = document.getElementById('Date');
  let objectElement = document.getElementById('Object');
  let amountElement = document.getElementById('Amount');

  let date = dateElement.value.trim(); // Get input values
  let object = objectElement.value.trim();
  let amount = amountElement.value.trim();

  let nu = account.transactions.length > 0 ? parseInt(account.transactions[account.transactions.length - 1].id) + 1 : 1; // Generate new transaction ID

  let sn = nu.toString();

  datapush(sn, date, object, amount); // Add transaction

  console.log(account.transactions);
  
  // Clear inputs after adding
  dateElement.value = "";
  objectElement.value= "";
  amountElement.value = "";
  updateDashboard(); // Update dashboard
}

function updateDashboard() {
  if (!account) {
    return navigate('/login'); // Redirect if no account
  }
  console.log(account.transactions);
  
  const transactionsRows = document.createDocumentFragment(); // Create document fragment
  
  for (const transaction of account.transactions) {
    const transactionRow = createTransactionRow(transaction); // Create transaction row
    const tr = transactionRow.querySelector("tr"); 
  
    if (transaction.id % 2 == 0) {
      tr.style.backgroundColor = "#e3f6f5"; // Alternate row color
    } else {
      console.log("it is green");
      tr.style.backgroundColor = "#bbe4e9"; 
    }
  
    transactionsRows.appendChild(transactionRow);
  }

  if (!account.transactions || account.transactions.length === 0) {
    console.log("No transactions available");
    updateElement('transactions','No transactions available'); // Show message if no transactions
    document.getElementById('nothing').innerText = 'No transactions available';
  } else {
    document.getElementById('nothing').innerText = ''; // Clear message
  }

  updateElement('transactions', transactionsRows); // Update transaction list
  updateElement('DashboardDescription', account.description);
  updateElement('balance', account.balance.toFixed(2)); // Update balance
  updateElement('currency', account.currency); // Update currency
}

function createTransactionRow(transaction) {
  const template = document.getElementById('tableTransaction');
  const transactionRow = template.content.cloneNode(true);
  const tr = transactionRow.querySelector('tr');  
  tr.children[0].textContent = transaction.date;
  tr.children[1].textContent = transaction.object;
  tr.children[2].textContent = transaction.amount.toFixed(2);
  return transactionRow;
}

function navigate(path) {
  window.history.pushState({}, '', path); // Change URL without reloading
  updateRoute(); 
}

function updateRoute() {
  const path = window.location.pathname;
  const route = routes[path];

  if (!route) {
      navigate('/login'); // Redirect if route not found
      return;
  }

  document.title = route.title; // Update document title
 
  if (document.title) {
    console.log('Dashboard is shown');
  }
  
  const template = document.getElementById(route.templateId);
  const view = template.content.cloneNode(true);
  const app = document.getElementById('app');
  app.innerHTML = ''; // Clear previous content
  app.appendChild(view); // Load new content
  
  if(path === '/dashboard'){
    updateDashboard(); // Update dashboard if on dashboard page
  }
}

function onLinkClick(event) {
  event.preventDefault(); // Prevent default link behavior
  const newPath = new URL(event.target.href).pathname;
  navigate(newPath); // Navigate to new path
}

updateRoute(); // Initialize route
window.onpopstate = updateRoute; // Handle back/forward navigation
