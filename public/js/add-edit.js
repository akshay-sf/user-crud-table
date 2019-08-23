import DatabaseConfig from "./db.config.js";

var myForm = new FormData(document.getElementById("user-form"));
var submitBtn = document.querySelector("button[type='submit']");
var userObj = {};
var dbOps = null;

// IIFE
(function () {
    getDatabaseInstance();
})();

function getDatabaseInstance() {
    DatabaseConfig.open("UserTable").generateInstance()
        .then((dbReqOperations) => {
            if (dbReqOperations) {
                dbOps = dbReqOperations;
                checkForEditedUserObj();
            }
        })
        .catch(err => console.log(err));
}

function checkForEditedUserObj() {
    var url = new URL(window.location.href);
    const idParam = url.searchParams.has("id");
    if (idParam) {
        let id = url.searchParams.get("id");
        if (id) {
            console.log(dbOps);
            dbOps
                .get(id)
                .then(resp => {
                    userObj = resp;
                    // console.log(resp);
                    for (let key of myForm.keys()) {
                        let elem = document.getElementById(key);
                        if (key == "phone") {
                            elem.setAttribute("value", +userObj[key]);
                            myForm.set(key, +userObj[key]);
                        } else if(key == 'address') {
                            elem.innerHTML = userObj[key];
                            myForm.set(key, userObj[key]);
                        } else {
                            elem.setAttribute("value", userObj[key]);
                            myForm.set(key, userObj[key]);
                        }
                    }
                    submitBtn.innerHTML = "Edit";
                })
                .catch(err => console.log(err));
        }
    }
}

window.onSubmit = (event) => {
    event.preventDefault();
    if (!userObj.id) {
        userObj['id'] = uuidv4();
    }
    for (let value of myForm.entries()) {
        userObj[value[0]] = value[1];
    }
    dbOps = DatabaseConfig.createTransaction();
    if (submitBtn.innerHTML == 'Edit') {
        // update into db
        dbOps.update(userObj)
        .then(resp => {
            if (!resp.error && resp.result) {
                resetObjectValue(userObj);
                showModal('User Updated Successfull');
            }
        })
        .catch(err => console.log(err));
    } else {
        // add into db
        console.log(userObj);
        dbOps.add(userObj)
        .then(resp => {
            if (!resp.error && resp.result) {
                // when added, empty the form contents.
                emptyForm();
                resetObjectValue(userObj);
                showModal('User Added Successfull');
            }
        })
        .catch(err => console.log(err));
    }
};

window.setValue = event => {
    myForm.set(event.target.name, event.target.value);
};

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

function emptyForm() {
    for (let key of myForm.keys()) {
        let elem = document.getElementById(key);
        if (key == "phone") {
            elem.setAttribute("value", null);
            myForm.set(key, null);
        } else if (key == 'address') {
            elem.innerHTML = '';
            myForm.set(key, '');
        } else {
            elem.setAttribute("value", '');
            myForm.set(key, '');
        }
    }
}

function showModal(bodyContent) {
    let modalElem = document.getElementById('modal');
    modalElem.innerHTML = `
    <div class="modal fade" id="myConfirmationModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Confirmation</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${bodyContent}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="dismissModal()">Ok</button>
                    </div>
                </div>
            </div>
    </div>
    `;
    $('#myConfirmationModal').modal({
        keyboard: false
    });

}

window.dismissModal = function() {
    let modalElem = document.getElementById('modal');
    modalElem.innerHTML = null;
}
