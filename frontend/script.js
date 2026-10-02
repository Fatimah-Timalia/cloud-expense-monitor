// ==========================================
// API
// ==========================================

const API_URL = "https://cloud-expense-monitor.onrender.com";
let allExpenses = [];
let categoryChartInstance = null;
let monthlyChartInstance = null;

// ==========================================
// ELEMENTS
// ==========================================

const authBox =
    document.getElementById("authBox");

const dashboard =
    document.getElementById("dashboard");

const message =
    document.getElementById("message");


// ==========================================
// MODALS
// ==========================================

const addModal =
    document.getElementById("addModal");

const editModal =
    document.getElementById("editModal");

const deleteModal =
    document.getElementById("deleteModal");

const searchModal =
    document.getElementById("searchModal");


// ==========================================
// INITIAL PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        showLogin();

    }
);


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    authBox.style.display = "block";

    document.getElementById("registerBox").style.display = "none";

    dashboard.style.display = "none";

    document.getElementById("logoutBtn").style.display = "none";

}
// ==========================================
// SHOW REGISTER
// ==========================================

function showRegister() {

    authBox.style.display = "none";

    document.getElementById("registerBox").style.display = "block";

    dashboard.style.display = "none";

}
// ==========================================
// REGISTER
// ==========================================

async function registerUser() {

    const username =
        document.getElementById("registerUsername").value.trim();

    const email =
        document.getElementById("registerEmail").value.trim();

    const password =
        document.getElementById("registerPassword").value;


    const registerMessage =
        document.getElementById("registerMessage");


    if (!username || !email || !password) {

        registerMessage.textContent =
            "Please fill in all fields.";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            registerMessage.textContent =
                data.detail ||
                "Registration failed.";

            return;
        }


        registerMessage.textContent =
            "Account created successfully! 🎉";


        document.getElementById(
            "registerUsername"
        ).value = "";

        document.getElementById(
            "registerEmail"
        ).value = "";

        document.getElementById(
            "registerPassword"
        ).value = "";


        setTimeout(
            function () {

                showLogin();

                message.textContent =
                    "Account created! Please login.";

            },
            1200
        );

    }

    catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        registerMessage.textContent =
            "Unable to connect to server.";

    }

}


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard() {

    authBox.style.display = "none";

    document.getElementById("registerBox").style.display = "none";

    dashboard.style.display = "block";

    document.getElementById("logoutBtn").style.display = "block";

}


// ==========================================
// LOGIN
// ==========================================

async function login() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    if (!email || !password) {

        message.textContent =
            "Please enter email and password.";

        return;
    }


    const formData =
        new URLSearchParams();

    formData.append(
        "username",
        email
    );

    formData.append(
        "password",
        password
    );


    try {

        const response =
            await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },

                    body: formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.detail ||
                "Login failed.";

            return;
        }


        localStorage.setItem(
            "token",
            data.access_token
        );


        message.textContent =
            "Login successful! 🎉";


        showDashboard();


        await loadDashboard();

    }

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        message.textContent =
            "Unable to connect to server.";

    }

}


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    await loadSummary();

    await loadExpenses();

    await loadAnalytics();

    calculateMonthlySpending(
    allExpenses
);

        createCategoryChart(
        allExpenses
    );

    createMonthlyChart(
        allExpenses
    );

}


// ==========================================
// GET SUMMARY
// ==========================================

async function loadSummary() {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/expenses/summary`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            console.error(
                "SUMMARY ERROR:",
                data
            );

            return;
        }


        document.getElementById(
            "totalExpenses"
        ).textContent =
            data.total_expenses;


        document.getElementById(
            "totalAmount"
        ).textContent =
            `₹${data.total_amount}`;

    }

    catch (error) {

        console.error(
            "SUMMARY ERROR:",
            error
        );

    }

}


// ==========================================
// GET ALL EXPENSES
// ==========================================

async function loadExpenses() {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return [];
    }


    try {

        const response =
            await fetch(
                `${API_URL}/expenses`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const expenses =
            await response.json();
        
        allExpenses = expenses;

        loadCategoryFilter(expenses);

        if (response.status === 401) {

            logout();

            return [];
        }


        if (!response.ok) {

            console.error(
                "EXPENSE ERROR:",
                expenses
            );

            return [];
        }


        displayExpenses(expenses);


        return expenses;

    }

    catch (error) {

        console.error(
            "LOAD EXPENSE ERROR:",
            error
        );

        return [];
    }

}
// ==========================================
// LOAD ANALYTICS
// ==========================================

async function loadAnalytics() {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/expenses`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const expenses =
            await response.json();


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            console.error(
                "ANALYTICS ERROR:",
                expenses
            );

            return;
        }


        calculateAnalytics(
            expenses
        );

    }

    catch (error) {

        console.error(
            "ANALYTICS ERROR:",
            error
        );

    }

}
// ==========================================
// CALCULATE ANALYTICS
// ==========================================

function calculateAnalytics(expenses) {

    // No expenses

    if (
        !expenses ||
        expenses.length === 0
    ) {

        document.getElementById(
            "highestExpense"
        ).textContent = "₹0";


        document.getElementById(
            "averageExpense"
        ).textContent = "₹0";


        document.getElementById(
            "recentExpense"
        ).textContent = "None";


        document.getElementById(
            "categoryChart"
        ).innerHTML = `
            <p class="empty-message">
                No category data available.
            </p>
        `;

        return;
    }


    // ======================================
    // HIGHEST EXPENSE
    // ======================================

    const highest =
        expenses.reduce(
            (max, expense) =>
                expense.amount > max.amount
                    ? expense
                    : max
        );


    document.getElementById(
        "highestExpense"
    ).textContent =
        `₹${Number(
            highest.amount
        ).toFixed(2)}`;


    // ======================================
    // AVERAGE EXPENSE
    // ======================================

    const total =
        expenses.reduce(
            (sum, expense) =>
                sum + Number(
                    expense.amount
                ),
            0
        );


    const average =
        total / expenses.length;


    document.getElementById(
        "averageExpense"
    ).textContent =
        `₹${average.toFixed(2)}`;


    // ======================================
    // RECENT EXPENSE
    // ======================================

    const sortedExpenses =
        [...expenses].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    const recent =
        sortedExpenses[0];


    document.getElementById(
        "recentExpense"
    ).textContent =
        recent.title;


    // ======================================
    // CATEGORY TOTALS
    // ======================================

    const categories = {};


    expenses.forEach(
        expense => {

            const category =
                expense.category;


            if (
                !categories[category]
            ) {

                categories[category] =
                    0;

            }


            categories[category] +=
                Number(
                    expense.amount
                );

        }
    );


    // ======================================
    // FIND MAX CATEGORY
    // ======================================

    const maxCategoryAmount =
        Math.max(
            ...Object.values(
                categories
            )
        );


    // ======================================
    // DISPLAY CATEGORY BARS
    // ======================================

    const categoryChart =
        document.getElementById(
            "categoryChart"
        );


    categoryChart.innerHTML = "";


    Object.entries(categories)
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .forEach(
            ([category, amount]) => {

                const percentage =
                    (
                        amount /
                        maxCategoryAmount
                    ) * 100;


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "category-item";


                div.innerHTML = `

                    <div class="category-top">

                        <span class="category-name">

                            ${escapeHTML(
                                category
                            )}

                        </span>

                        <span class="category-amount">

                            ₹${amount.toFixed(2)}

                        </span>

                    </div>


                    <div class="category-bar-background">

                        <div
                            class="category-bar"
                            style="width: ${percentage}%"
                        ></div>

                    </div>

                `;


                categoryChart.appendChild(
                    div
                );

            }
        );

}

// ==========================================
// DISPLAY EXPENSES
// ==========================================

function displayExpenses(expenses) {

    const expenseList =
        document.getElementById(
            "expenseList"
        );


    expenseList.innerHTML = "";


    if (
        !expenses ||
        expenses.length === 0
    ) {

        expenseList.innerHTML = `
            <p class="empty-message">
                No expenses found. Add your first expense! 💸
            </p>
        `;

        return;
    }


    expenses.forEach(
        expense => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "expense";


            div.innerHTML = `

                <div class="expense-info">

                    <div class="expense-title">
                        ${escapeHTML(expense.title)}
                    </div>

                    <div class="expense-details">

                        📁 ${escapeHTML(expense.category)}

                        <br>

                        📅 ${expense.date}

                        <br>

                        🆔 Expense ID: ${expense.id}

                    </div>

                </div>


                <div class="expense-amount">

                    ₹${Number(expense.amount).toFixed(2)}

                </div>


                <div class="expense-actions">

                    <button
                        type="button"
                        class="expense-edit-btn"
                        onclick="openEditForExpense(${expense.id})"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        type="button"
                        class="expense-delete-btn"
                        onclick="openDeleteForExpense(${expense.id})"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            expenseList.appendChild(
                div
            );

        }
    );

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}


// ==========================================
// ADD MODAL
// ==========================================

function openAddModal() {

    addModal.style.display =
        "flex";

}


function closeAddModal() {

    addModal.style.display =
        "none";

}


// ==========================================
// ADD EXPENSE
// ==========================================

async function addExpense() {

    const token =
        localStorage.getItem("token");


    const title =
        document.getElementById(
            "addTitle"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "addAmount"
            ).value
        );


    const category =
        document.getElementById(
            "addCategory"
        ).value.trim();


    const date =
        document.getElementById(
            "addDate"
        ).value;


    if (
        !title ||
        !amount ||
        !category ||
        !date
    ) {

        message.textContent =
            "Please fill all expense fields.";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/expenses`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({
                            title:
                                title,

                            amount:
                                amount,

                            category:
                                category,

                            date:
                                date
                        })

                }
            );


        const data =
            await response.json();


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            message.textContent =
                data.detail ||
                "Failed to add expense.";

            return;
        }


        message.textContent =
            "Expense added successfully! 🎉";


        clearAddFields();


        closeAddModal();


        await loadDashboard();

    }

    catch (error) {

        console.error(
            "ADD ERROR:",
            error
        );

        message.textContent =
            "Unable to connect to server.";

    }

}


// ==========================================
// CLEAR ADD FIELDS
// ==========================================

function clearAddFields() {

    document.getElementById(
        "addTitle"
    ).value = "";

    document.getElementById(
        "addAmount"
    ).value = "";

    document.getElementById(
        "addCategory"
    ).value = "";

    document.getElementById(
        "addDate"
    ).value = "";

}


// ==========================================
// EDIT MODAL
// ==========================================

function openEditModal() {

    editModal.style.display =
        "flex";

}


function closeEditModal() {

    editModal.style.display =
        "none";

    document.getElementById(
        "editFields"
    ).classList.add("hidden");

}


// ==========================================
// OPEN EDIT FOR SPECIFIC EXPENSE
// ==========================================

async function openEditForExpense(
    expenseId
) {

    openEditModal();


    document.getElementById(
        "editId"
    ).value =
        expenseId;


    await loadExpenseForEdit(
        expenseId
    );

}


// ==========================================
// LOAD EXPENSE FOR EDIT
// ==========================================

async function loadExpenseForEdit(
    expenseId
) {

    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                `${API_URL}/expenses/${expenseId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const expense =
            await response.json();


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            message.textContent =
                expense.detail ||
                "Expense not found.";

            return;
        }


        document.getElementById(
            "editTitle"
        ).value =
            expense.title;


        document.getElementById(
            "editAmount"
        ).value =
            expense.amount;


        document.getElementById(
            "editCategory"
        ).value =
            expense.category;


        document.getElementById(
            "editDate"
        ).value =
            expense.date;


        document.getElementById(
            "editFields"
        ).classList.remove(
            "hidden"
        );

    }

    catch (error) {

        console.error(
            "EDIT LOAD ERROR:",
            error
        );

    }

}


// ==========================================
// LOAD EDIT USING ID FIELD
// ==========================================

document
    .getElementById("loadEditBtn")
    .addEventListener(
        "click",
        async function () {

            const id =
                Number(
                    document.getElementById(
                        "editId"
                    ).value
                );


            if (!id) {

                message.textContent =
                    "Please enter an expense ID.";

                return;
            }


            await loadExpenseForEdit(
                id
            );

        }
    );


// ==========================================
// SAVE EDIT
// ==========================================

async function saveEdit() {

    const token =
        localStorage.getItem("token");


    const expenseId =
        Number(
            document.getElementById(
                "editId"
            ).value
        );


    const title =
        document.getElementById(
            "editTitle"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "editAmount"
            ).value
        );


    const category =
        document.getElementById(
            "editCategory"
        ).value.trim();


    const date =
        document.getElementById(
            "editDate"
        ).value;


    if (
        !expenseId ||
        !title ||
        !amount ||
        !category ||
        !date
    ) {

        message.textContent =
            "Please fill all fields.";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/expenses/${expenseId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            title:
                                title,

                            amount:
                                amount,

                            category:
                                category,

                            date:
                                date

                        })

                }
            );


        const data =
            await response.json();


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            message.textContent =
                data.detail ||
                "Failed to update expense.";

            return;
        }


        message.textContent =
            "Expense updated successfully! ✏️";


        closeEditModal();


        await loadDashboard();

    }

    catch (error) {

        console.error(
            "EDIT ERROR:",
            error
        );

        message.textContent =
            "Unable to update expense.";

    }

}


// ==========================================
// DELETE MODAL
// ==========================================

function openDeleteModal() {

    deleteModal.style.display =
        "flex";

}


function closeDeleteModal() {

    deleteModal.style.display =
        "none";

}


// ==========================================
// OPEN DELETE FOR SPECIFIC EXPENSE
// ==========================================

function openDeleteForExpense(
    expenseId
) {

    openDeleteModal();


    document.getElementById(
        "deleteId"
    ).value =
        expenseId;

}


// ==========================================
// DELETE EXPENSE
// ==========================================

async function deleteExpense() {

    const token =
        localStorage.getItem("token");


    const expenseId =
        Number(
            document.getElementById(
                "deleteId"
            ).value
        );


    if (!expenseId) {

        message.textContent =
            "Please enter an expense ID.";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/expenses/${expenseId}`,
                {

                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }

                }
            );


        const data =
            await response.json();


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            message.textContent =
                data.detail ||
                "Failed to delete expense.";

            return;
        }


        message.textContent =
            "Expense deleted successfully! 🗑️";


        document.getElementById(
            "deleteId"
        ).value = "";


        closeDeleteModal();


        await loadDashboard();

    }

    catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );

        message.textContent =
            "Unable to delete expense.";

    }

}


// ==========================================
// SEARCH MODAL
// ==========================================

function openSearchModal() {

    searchModal.style.display =
        "flex";

    document.getElementById(
        "searchInput"
    ).focus();

}


function closeSearchModal() {

    searchModal.style.display =
        "none";

}


// ==========================================
// SEARCH EXPENSE
// ==========================================

async function searchExpenses() {

    const searchText =
        document.getElementById(
            "searchInput"
        ).value
        .trim()
        .toLowerCase();


    const results =
        document.getElementById(
            "searchResults"
        );


    if (!searchText) {

        results.innerHTML = `
            <p class="empty-message">
                Enter something to search.
            </p>
        `;

        return;
    }


    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                `${API_URL}/expenses`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const expenses =
            await response.json();


        if (response.status === 401) {

            logout();

            return;
        }


        const filtered =
            expenses.filter(
                expense => {

                    return (

                        String(expense.id)
                            .toLowerCase()
                            .includes(searchText)

                        ||

                        expense.title
                            .toLowerCase()
                            .includes(searchText)

                        ||

                        expense.category
                            .toLowerCase()
                            .includes(searchText)

                        ||

                        expense.date
                            .toLowerCase()
                            .includes(searchText)

                    );

                }
            );


        displaySearchResults(
            filtered
        );

    }

    catch (error) {

        console.error(
            "SEARCH ERROR:",
            error
        );

        results.innerHTML = `
            <p class="empty-message">
                Search failed.
            </p>
        `;

    }

}


// ==========================================
// DISPLAY SEARCH RESULTS
// ==========================================

function displaySearchResults(
    expenses
) {

    const results =
        document.getElementById(
            "searchResults"
        );


    results.innerHTML = "";


    if (
        expenses.length === 0
    ) {

        results.innerHTML = `
            <p class="empty-message">
                No matching expense found 🔍
            </p>
        `;

        return;
    }


    expenses.forEach(
        expense => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "search-result";


            div.innerHTML = `

                <div class="search-result-title">

                    ${escapeHTML(
                        expense.title
                    )}

                    — ₹${Number(
                        expense.amount
                    ).toFixed(2)}

                </div>


                <div class="search-result-details">

                    ID: ${expense.id}
                    •
                    ${escapeHTML(
                        expense.category
                    )}
                    •
                    ${expense.date}

                </div>

            `;


            results.appendChild(
                div
            );

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(
        "token"
    );


    showLogin();


    document.getElementById(
        "totalExpenses"
    ).textContent =
        "0";


    document.getElementById(
        "totalAmount"
    ).textContent =
        "₹0";


    document.getElementById(
        "expenseList"
    ).innerHTML = `
        <p class="empty-message">
            No expenses found.
        </p>
    `;


    message.textContent =
        "You have been logged out.";

}


// ==========================================
// BUTTON EVENT LISTENERS
// ==========================================


// LOGIN

document
    .getElementById("loginBtn")
    .addEventListener(
        "click",
        login
    );
    // REGISTER

document
    .getElementById("showRegisterBtn")
    .addEventListener(
        "click",
        showRegister
    );


document
    .getElementById("showLoginBtn")
    .addEventListener(
        "click",
        showLogin
    );


document
    .getElementById("registerBtn")
    .addEventListener(
        "click",
        registerUser
    );


// LOGOUT

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        logout
    );


// ADD

document
    .getElementById("openAddBtn")
    .addEventListener(
        "click",
        openAddModal
    );


document
    .getElementById("saveAddBtn")
    .addEventListener(
        "click",
        addExpense
    );


document
    .getElementById("closeAddBtn")
    .addEventListener(
        "click",
        closeAddModal
    );


document
    .getElementById("cancelAddBtn")
    .addEventListener(
        "click",
        closeAddModal
    );


// EDIT

document
    .getElementById("openEditBtn")
    .addEventListener(
        "click",
        openEditModal
    );


document
    .getElementById("saveEditBtn")
    .addEventListener(
        "click",
        saveEdit
    );


document
    .getElementById("closeEditBtn")
    .addEventListener(
        "click",
        closeEditModal
    );


document
    .getElementById("cancelEditBtn")
    .addEventListener(
        "click",
        closeEditModal
    );


// DELETE

document
    .getElementById("openDeleteBtn")
    .addEventListener(
        "click",
        openDeleteModal
    );


document
    .getElementById("confirmDeleteBtn")
    .addEventListener(
        "click",
        deleteExpense
    );


document
    .getElementById("closeDeleteBtn")
    .addEventListener(
        "click",
        closeDeleteModal
    );


document
    .getElementById("cancelDeleteBtn")
    .addEventListener(
        "click",
        closeDeleteModal
    );


// SEARCH

document
    .getElementById("openSearchBtn")
    .addEventListener(
        "click",
        openSearchModal
    );


document
    .getElementById("searchBtn")
    .addEventListener(
        "click",
        searchExpenses
    );


document
    .getElementById("closeSearchBtn")
    .addEventListener(
        "click",
        closeSearchModal
    );


// REFRESH

document
    .getElementById("refreshBtn")
    .addEventListener(
        "click",
        loadDashboard
    );


// ==========================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ==========================================

window.addEventListener(
    "click",
    function (event) {

        if (event.target === addModal) {
            closeAddModal();
        }

        if (event.target === editModal) {
            closeEditModal();
        }

        if (event.target === deleteModal) {
            closeDeleteModal();
        }

        if (event.target === searchModal) {
            closeSearchModal();
        }

    }
);


// ==========================================
// ENTER KEY FOR SEARCH
// ==========================================

document
    .getElementById("searchInput")
    .addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                searchExpenses();

            }

        }
    );

// ==========================================
// LOAD CATEGORY FILTER
// ==========================================

function loadCategoryFilter(expenses) {

    const categorySelect =
        document.getElementById(
            "filterCategory"
        );


    const categories =
        [...new Set(
            expenses.map(
                expense => expense.category
            )
        )];


    categorySelect.innerHTML = `
        <option value="">
            All Categories
        </option>
    `;


    categories
        .sort()
        .forEach(category => {

            const option =
                document.createElement("option");

            option.value = category;

            option.textContent = category;

            categorySelect.appendChild(
                option
            );

        });

}
// ==========================================
// APPLY FILTERS
// ==========================================

function applyFilters() {

    const month =
        document.getElementById(
            "filterMonth"
        ).value;


    const category =
        document.getElementById(
            "filterCategory"
        ).value;


    const minAmount =
        Number(
            document.getElementById(
                "minAmount"
            ).value
        ) || 0;


    const maxInput =
        document.getElementById(
            "maxAmount"
        ).value;


    const maxAmount =
        maxInput === ""
            ? Infinity
            : Number(maxInput);


    const filtered =
        allExpenses.filter(
            expense => {

                const matchesMonth =
                    !month ||
                    expense.date.startsWith(
                        month
                    );


                const matchesCategory =
                    !category ||
                    expense.category === category;


                const matchesMin =
                    Number(expense.amount)
                    >= minAmount;


                const matchesMax =
                    Number(expense.amount)
                    <= maxAmount;


                return (
                    matchesMonth &&
                    matchesCategory &&
                    matchesMin &&
                    matchesMax
                );

            }
        );


    displayExpenses(filtered);

}
// ==========================================
// CLEAR FILTERS
// ==========================================

function clearFilters() {

    document.getElementById(
        "filterMonth"
    ).value = "";


    document.getElementById(
        "filterCategory"
    ).value = "";


    document.getElementById(
        "minAmount"
    ).value = "";


    document.getElementById(
        "maxAmount"
    ).value = "";


    displayExpenses(
        allExpenses
    );

}
// ==========================================
// MONTHLY SPENDING
// ==========================================

function calculateMonthlySpending(
    expenses
) {

    const monthlyTotals = {};


    expenses.forEach(
        expense => {

            const month =
                expense.date.substring(
                    0,
                    7
                );


            if (!monthlyTotals[month]) {

                monthlyTotals[month] = 0;

            }


            monthlyTotals[month] +=
                Number(
                    expense.amount
                );

        }
    );


    displayMonthlySpending(
        monthlyTotals
    );

}
// ==========================================
// DISPLAY MONTHLY SPENDING
// ==========================================

function displayMonthlySpending(
    monthlyTotals
) {

    const chart =
        document.getElementById(
            "monthlyChart"
        );


    chart.innerHTML = "";


    const entries =
        Object.entries(
            monthlyTotals
        )
        .sort(
            (a, b) =>
                a[0].localeCompare(b[0])
        );


    if (entries.length === 0) {

        chart.innerHTML = `
            <p class="empty-message">
                No monthly data available.
            </p>
        `;

        return;
    }


    const maxAmount =
        Math.max(
            ...entries.map(
                item => item[1]
            )
        );


    entries.forEach(
        ([month, amount]) => {

            const percentage =
                (
                    amount /
                    maxAmount
                ) * 100;


            const [year, monthNumber] =
                month.split("-");


            const monthName =
                new Date(
                    Number(year),
                    Number(monthNumber) - 1
                )
                .toLocaleString(
                    "en-US",
                    {
                        month: "short",
                        year: "numeric"
                    }
                );


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "monthly-item";


            div.innerHTML = `

                <div class="monthly-top">

                    <span class="monthly-name">
                        ${monthName}
                    </span>

                    <span class="monthly-amount">
                        ₹${amount.toFixed(2)}
                    </span>

                </div>


                <div class="monthly-bar-background">

                    <div
                        class="monthly-bar"
                        style="width: ${percentage}%"
                    ></div>

                </div>

            `;


            chart.appendChild(
                div
            );

        }
    );

}
document
    .getElementById(
        "applyFiltersBtn"
    )
    .addEventListener(
        "click",
        applyFilters
    );


document
    .getElementById(
        "clearFiltersBtn"
    )
    .addEventListener(
        "click",
        clearFilters
    );
// ==========================================
// CATEGORY DOUGHNUT CHART
// ==========================================

function createCategoryChart(expenses) {

    const canvas =
        document.getElementById(
            "categoryChartCanvas"
        );


    if (!canvas) {
        return;
    }


    const categoryTotals = {};


    expenses.forEach(expense => {

        const category =
            expense.category;


        if (!categoryTotals[category]) {

            categoryTotals[category] = 0;

        }


        categoryTotals[category] +=
            Number(expense.amount);

    });


    const labels =
        Object.keys(categoryTotals);


    const values =
        Object.values(categoryTotals);


    // Destroy previous chart

    if (categoryChartInstance) {

        categoryChartInstance.destroy();

    }


    // No data

    if (labels.length === 0) {

        return;
    }


    categoryChartInstance =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [
                        {
                            data: values,

                            backgroundColor: [
                                "#9b6de3",
                                "#e276a8",
                                "#67b8e8",
                                "#65c98a",
                                "#f3b562",
                                "#ef767a",
                                "#7dcfb6",
                                "#8e9aaf"
                            ],

                            borderWidth: 2,

                            borderColor: "#ffffff"
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "bottom"

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            context.label +
                                            ": ₹" +
                                            Number(
                                                context.raw
                                            ).toFixed(2)
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}
// ==========================================
// MONTHLY BAR CHART
// ==========================================

function createMonthlyChart(expenses) {

    const canvas =
        document.getElementById(
            "monthlyChartCanvas"
        );


    if (!canvas) {
        return;
    }


    const monthlyTotals = {};


    expenses.forEach(expense => {

        const month =
            expense.date.substring(
                0,
                7
            );


        if (!monthlyTotals[month]) {

            monthlyTotals[month] = 0;

        }


        monthlyTotals[month] +=
            Number(expense.amount);

    });


    const sortedMonths =
        Object.keys(monthlyTotals)
            .sort();


    const labels =
        sortedMonths.map(month => {

            const [year, monthNumber] =
                month.split("-");


            return new Date(
                Number(year),
                Number(monthNumber) - 1
            ).toLocaleString(
                "en-US",
                {
                    month: "short",
                    year: "numeric"
                }
            );

        });


    const values =
        sortedMonths.map(
            month =>
                monthlyTotals[month]
        );


    // Destroy previous chart

    if (monthlyChartInstance) {

        monthlyChartInstance.destroy();

    }


    if (labels.length === 0) {

        return;
    }


    monthlyChartInstance =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: labels,

                    datasets: [

                        {
                            label:
                                "Monthly Spending",

                            data: values,

                            backgroundColor:
                                "#9b6de3",

                            borderRadius: 8,

                            borderSkipped: false

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    function(value) {

                                        return "₹" +
                                            value;

                                    }

                            }

                        }

                    },

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            "₹" +
                                            Number(
                                                context.raw
                                            ).toFixed(2)
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}