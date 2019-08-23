import DatabaseConfig from "./db.config.js";
import seed from  '../../seed.js';

var userData = [];
var editUserObj = {};
var addUserObj = {};
var dbOps = null;

// Prototypes function
String.prototype.capitalize = function () {
    let str = this;
    let split = str.split('_');
    const res = split.reduce((result, name) => {
        return result + ' ' + name[0].toUpperCase()+name.substr(1);
    }, '')
    return res;
}

// Connection with Indexed DB.
function connectToDatabase(name) {
    DatabaseConfig.open(name).generateInstance()
    .then(dbReqOperation => {
        let allUsers = [];
        dbOps = dbReqOperation;
        dbOps.getAll()
        .then(resp => {
            allUsers = [...resp];
            if (!allUsers.length) {
                // if there is no users in db, then add it to db from external seed src.
                allUsers = modifyUserData(seed);
                const promiseArr = [];
                allUsers.forEach(user => {
                    promiseArr.push(dbOps.add(user));
                })
                Promise.all(promiseArr).then(resp => console.log(resp)).catch(err => console.log(err));
            }
            userData = [...allUsers];
            reloadTable();
        })
        .catch(err => console.log(err));
    })
    .catch(error => console.log(error));
}

connectToDatabase('UserTable');

/**
 * 
 * @param userArr this is the user array on which the data manipulation will be occured.
 * @returns user[]
 */
function modifyUserData(userArr) {
    return userArr.map(user => {
        return {
            ...user,
            address: `${user.address.suite}, ${user.address.street}, ${user.address.city}, ${user.address.zipcode}`
        }
    });
}

// Display Table Header
function displayTableHeader() {
    if (userData.length > 0) {
        let props = Object.keys(userData[0]);
        props = props.map(prop => {
            return prop.capitalize();
        });
        const $tr = $('<tr></tr>').appendTo('thead');
        props.forEach((prop, index) => {
            if (index == 0) {
                $(`<td>${prop}</td>`).attr({ 'hidden': 'true' }).appendTo($tr);
            } else {
                $(`<td>${prop}</td>`).appendTo($tr);
            }
        })
        $(`<td>Actions</td>`).appendTo($tr);
    } else {
        $('<h1>Data source unknown!</h1>').appendTo('thead');
    }
}

// Display individual data row.
function displayTableData() {
    // addUserTableRow();
    allUserTableRow();
}

// Add the add user row at the end of the table.
function addUserTableRow() {
    if (userData.length > 0) {
        let props = Object.keys(userData[0]);
        const $tr = $('<tr></tr>').attr({ id: `add-row`, 'class': 'bg-success' }).appendTo('#user-table');
        props.forEach((prop, index) => {
            if (index != 0) {
                $(`<td></td>`).attr({ 'class': `${prop}`, 'contenteditable': 'true', 'onkeyup': "setChanges(event, 'add')", 'style': 'border: 0.5px solid #0a521a' }).appendTo($tr);
            }
        })
        const $td = $('<td></td>').attr({ 'style': 'text-align: center' }).appendTo($tr);
        $('<button></button>').attr({ 'onclick': `onAdd()`, 'class': 'btn btn-primary', 'style': 'margin: 5px' }).html('Add').appendTo($td);
    }
}

// Display all the users in the row format.
window.allUserTableRow = () => {
    userData.forEach(user => {
        const $tr = $('<tr></tr>').attr({ id: `${user.id}` }).appendTo('tbody');
        Object.keys(user).forEach((prop, index) => {
            if (index == 0) {
                $(`<td>${user[prop]}</td>`).attr({ 'class': `${prop}`, 'hidden': 'true' }).appendTo($tr);
            } else {
                $(`<td>${user[prop]}</td>`).attr({ 'class': `${prop}` }).appendTo($tr);
            }
        })
        const $td = $('<td></td>').attr({ 'class': 'd-flex' }).appendTo($tr);
        $('<button></button>').attr({ id: `edit--${user.id}`, 'onclick': `onEdit(event)`, 'class': 'btn btn-primary', 'style': 'margin: 5px' }).html('Edit').appendTo($td);
        $('<button></button>').attr({ id: `delete--${user.id}`, 'onclick': `onDelete(event)`, 'class': 'btn btn-danger', 'style': 'margin: 5px' }).html('Delete').appendTo($td);
    });
}

// Add User handler
// window.onAdd = () => {
//     if (Object.keys(addUserObj).length > 0) {
//         const topId = userData.map(user => +user.id);
//         let max = Math.max(...topId);
//         const newUser = {
//             id: max + 1,
//             ...addUserObj
//         };
//         userData.unshift(newUser);
//         reloadTable();
//     }
// }

// Edit Individual User handler.
window.onEdit = (event) => {
    const id = event.target.id.split('--')[1];
    if (event.target.textContent == 'Edit') {
        // Edit operation
        if (Object.keys(editUserObj).length > 0) {
            $('#myEditConfirmationModal').modal({
                keyboard: true,
                backdrop: 'static'
            })
            .on('click', '#edit-confirmation', (event) => {
                $(this).off(event);
                reloadTable();
                window.location.href = `../../add-edit.html?id=${id}`;
            })
        } else {
            window.location.href = `../../add-edit.html?id=${id}`;
        }
    } else if (event.target.textContent == 'Save') {
        // Save operation
        $('#mySaveModal').modal({
            keyboard: true,
            backdrop: 'static'
        })
        .on('click', '#save', (event) => {
            $(this).off(event);
            console.log('Edit Object Value -> ', JSON.stringify(editUserObj, null, 2));
            userData = userData.map(user => {
                if (id && id == user.id) {
                    return {
                        ...editUserObj
                    }
                }
                return user;
            })
            reloadTable();
        })
    }
}

function editTask(id) {
    $(`#edit-${id}`).html('Save');
    $(`#delete-${id}`).html('Cancel');
    const children = $(`#${id}`).attr({ 'class': 'bg-info' }).children();
    for (let i = 0; i < children.length - 1; i++) {
        $(children[i]).attr({ 'contenteditable': 'true', 'onkeyup': "setChanges(event, 'edit')" });
        editUserObj[$(children[i]).attr('class')] = $(children[i]).text();
    }
}

// Delete User handler.
window.onDelete = (event) => {
    const id = event.target.id.split('--')[1];
    if (event.target.textContent == 'Delete') {
        // Delete Operation
        $('#myDeleteModal').modal({
            keyboard: true,
            backdrop: 'static'
        })
            .on('click', '#delete', (event) => {
                $(this).off(event);
                dbOps = DatabaseConfig.createTransaction();
                dbOps.remove(id)
                .then(resp => {
                    if (!resp.error) {
                        const filteredArray = userData.filter(user => {
                            return user.id != id;
                        });
                        userData = [...filteredArray];
                        reloadTable();
                    }
                })
                .catch(err => console.log(err));
            });
    } else if (event.target.textContent == 'Cancel') {
        // Cancel operation.
        reloadTable();
    }
}

// Reload table handler.
function reloadTable() {
    // empty table contents
    resetObjectValue(editUserObj);
    resetObjectValue(addUserObj);
    $('thead').empty();
    $('tbody').empty();
    // reload the data
    displayTableHeader();
    displayTableData();
}

// Set object specific values.
function setChanges(event, actionType) {
    if (actionType == 'edit') {
        editUserObj[event.target.className] = event.target.textContent;
    } else {
        addUserObj[event.target.className] = event.target.textContent;
    }
}

// Reset Object for later use.
function resetObjectValue(obj) {
    for (let i of Object.keys(obj)) {
        delete obj[i];
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
