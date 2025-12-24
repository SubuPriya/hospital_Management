const db = require('./db');

/* ---------------- LOGIN ---------------- */
function login() {
    const u = username.value;
    const p = password.value;

    db.query(
        "SELECT * FROM users WHERE username=? AND password=?",
        [u, p],
        (err, result) => {
            if (result.length > 0) {
                localStorage.setItem("role", result[0].role);
                location = "dashboard.html";
            } else {
                alert("Invalid Login");
            }
        }
    );
}

/* ---------------- DASHBOARD LOAD ---------------- */
window.onload = () => {
    const role = localStorage.getItem("role");
    if (!role) return;

    roleTitle.innerText =
        role === 'admin' ? "Admin Dashboard" : "Staff Dashboard";

    if (role === 'admin') adminPanel.style.display = "block";

    loadDoctors();
    loadPatients();
    loadDoctorsDropdown();
};

/* ---------------- LOGOUT ---------------- */
function logout() {
    localStorage.clear();
    location = "login.html";
}

/* ---------------- DOCTORS ---------------- */
function loadDoctors() {
    db.query("SELECT * FROM doctors", (err, rows) => {
        let html = "";
        rows.forEach(r => {
            html += `
            <tr>
                <td>${r.id}</td>
                <td>${r.name}</td>
                <td>${r.department}</td>
                <td>${r.phone}</td>
                <td>
                    <button onclick="editDoctor(${r.id},'${r.name}','${r.department}','${r.phone}')">Edit</button>
                    <button onclick="deleteDoctor(${r.id})">Delete</button>
                </td>
            </tr>`;
        });
        doctorTable.innerHTML = html;
    });
}

function addDoctor() {
    db.query(
        "INSERT INTO doctors (name, department, phone) VALUES (?,?,?)",
        [dname.value, dept.value, phone.value],
        () => {
            loadDoctors();
            dname.value = dept.value = phone.value = "";
        }
    );
}

function editDoctor(id, name, department, phoneNo) {
    dname.value = name;
    dept.value = department;
    phone.value = phoneNo;
    window.did = id;
}

function updateDoctor() {
    db.query(
        "UPDATE doctors SET name=?, department=?, phone=? WHERE id=?",
        [dname.value, dept.value, phone.value, window.did],
        () => {
            loadDoctors();
            dname.value = dept.value = phone.value = "";
        }
    );
}

function deleteDoctor(id) {
    if (confirm("Delete Doctor?")) {
        db.query("DELETE FROM doctors WHERE id=?", [id], loadDoctors);
    }
}

/* ---------------- PATIENTS ---------------- */
function loadPatients() {
    db.query("SELECT * FROM patients", (err, rows) => {
        let html = "";
        rows.forEach(r => {
            html += `
            <tr>
                <td>${r.id}</td>
                <td>${r.name}</td>
                <td>${r.age}</td>
                <td>${r.gender}</td>
                <td>${r.disease}</td>
                <td>${r.doctor}</td>
                <td>
                    <button onclick="editPatient(${r.id},'${r.name}',${r.age},'${r.gender}','${r.disease}','${r.doctor}')">Edit</button>
                    <button onclick="deletePatient(${r.id})">Delete</button>
                </td>
            </tr>`;
        });
        patientTable.innerHTML = html;
    });
}

function addPatient() {
    if (!doctorName.value) {
        alert("Please select a doctor");
        return;
    }

    db.query(
        "INSERT INTO patients (name, age, gender, disease, doctor) VALUES (?,?,?,?,?)",
        [
            pname.value,
            age.value,
            gender.value,
            disease.value,
            doctorName.value
        ],
        () => {
            loadPatients();
            clearPatientForm();
        }
    );
}

function editPatient(id, name, ag, gen, dis, doc) {
    pid.value = id;
    pname.value = name;
    age.value = ag;
    gender.value = gen;
    disease.value = dis;
    doctorName.value = doc;
}

function updatePatient() {
    if (!pid.value) {
        alert("Click Edit before Update");
        return;
    }

    db.query(
        "UPDATE patients SET name=?, age=?, gender=?, disease=?, doctor=? WHERE id=?",
        [
            pname.value,
            age.value,
            gender.value,
            disease.value,
            doctorName.value,
            pid.value
        ],
        () => {
            loadPatients();
            clearPatientForm();
        }
    );
}

function deletePatient(id) {
    if (confirm("Delete Patient?")) {
        db.query("DELETE FROM patients WHERE id=?", [id], loadPatients);
    }
}

function clearPatientForm() {
    pid.value = "";
    pname.value = "";
    age.value = "";
    gender.value = "";
    disease.value = "";
    doctorName.value = "";
}

/* ---------------- DOCTOR DROPDOWN ---------------- */
function loadDoctorsDropdown() {
    db.query("SELECT * FROM doctors", (err, rows) => {
        const select = document.getElementById("doctorName");
        select.innerHTML = '<option value="">Select Doctor</option>';

        rows.forEach(doc => {
            const option = document.createElement("option");
            option.value = doc.name;
            option.textContent = `${doc.name} (${doc.department})`;
            select.appendChild(option);
        });
    });
}
