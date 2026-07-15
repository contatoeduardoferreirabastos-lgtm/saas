# Security Specification & Threat Model (TDD)

## 1. Data Invariants
1. A Dentist or Procedure can only be created, modified, or deleted by their verified Clinic Owner (`ownerId == request.auth.uid`).
2. A Clinic Config's `slug` must be alphanumeric with hyphens, and its settings can only be managed by its authenticated owner.
3. Patients' personal records, attachments, and medical history are highly restricted PII; they can only be queried or viewed by the clinic's authenticated owner. No public reading of the `/patients` collection is allowed.
4. Appointments can be created by anonymous/unauthenticated public patients during booking, but they must contain a valid, non-empty `ownerId` referencing an existing, valid Clinic Config.
5. All updates to records must preserve the immutable `ownerId` field.

---

## 2. The "Dirty Dozen" Malicious Payloads

### Test 1: Identity Spoofing in Dentist Creation
An attacker tries to create a dentist record for a different clinic's `ownerId` than their own.
* **Payload:** `{"name": "Dr. Hacker", "specialty": "Implants", "workingDays": [1], "workingHours": {"start": "08:00", "end": "12:00"}, "ownerId": "victim_clinic_uid"}`
* **Auth Context:** `request.auth.uid = "attacker_uid"`
* **Expected Result:** `PERMISSION_DENIED`

### Test 2: Insecure Query Scraping of Patients
An authenticated user tries to list all patients across all clinics without filtering by their `ownerId`.
* **Query:** `db.collection('patients').get()`
* **Auth Context:** `request.auth.uid = "any_uid"`
* **Expected Result:** `PERMISSION_DENIED` (due to missing query constraint)

### Test 3: ID Poisoning Attack on Procedure ID
An attacker attempts to inject a 1MB string or invalid characters into the procedure document ID.
* **ID:** `procedure_path_with_junk_$$$_!!!!`
* **Expected Result:** `PERMISSION_DENIED`

### Test 4: Shadow Field Update in Clinic Config
An attacker attempts to modify their clinic configuration while injecting a system-only or unauthorized property (e.g., `isVerifiedSaaS`).
* **Payload:** `{"name": "New Name", "slug": "new-slug", "phone": "123", "email": "a@b.com", "address": "Rua 1", "isVerifiedSaaS": true, "ownerId": "attacker_uid"}`
* **Expected Result:** `PERMISSION_DENIED` (blocked by strict update key validation `affectedKeys().hasOnly()`)

### Test 5: Patient PII Leakage
An unauthenticated user tries to fetch a patient record directly by its document ID.
* **Path:** `/patients/patient_abc123`
* **Auth Context:** `unauthenticated`
* **Expected Result:** `PERMISSION_DENIED`

### Test 6: State Shortcutting in Appointment Status
An unauthenticated public patient tries to update an appointment directly to "completed".
* **Payload:** `{"status": "completed"}`
* **Expected Result:** `PERMISSION_DENIED`

### Test 7: Orphaned Appointment Creation
A malicious actor tries to submit an appointment that points to a non-existent clinic owner.
* **Payload:** `{"patientName": "Fake", "patientPhone": "123", "patientEmail": "f@f.com", "dentistId": "d1", "dentistName": "Dr. Silva", "procedureId": "p1", "procedureName": "Cleaning", "date": "2026-12-01", "time": "14:00", "durationMinutes": 60, "status": "pending", "ownerId": "non_existent_uid"}`
* **Expected Result:** `PERMISSION_DENIED` (relational exists validation failure)

### Test 8: Modifying Immutable `ownerId`
A logged-in dentist owner tries to reassign their clinic config to another owner ID.
* **Update Payload:** `{"ownerId": "new_uid"}`
* **Expected Result:** `PERMISSION_DENIED`

### Test 9: Giant Array Injection (Denial of Wallet)
An attacker attempts to write an array with 10,000 items into working days of a dentist.
* **Payload:** `{"workingDays": [1, 2, 3, ..., 10000]}`
* **Expected Result:** `PERMISSION_DENIED`

### Test 10: Email/Auth Spoofing (unverified email)
An attacker attempts to access owner actions using a spoofed email but with `email_verified == false`.
* **Auth Context:** `{ uid: "hacker", token: { email: "admin@odontoagenda.com", email_verified: false } }`
* **Expected Result:** `PERMISSION_DENIED`

### Test 11: Modifying Terminal Appointment Note
An attacker attempts to modify notes on an appointment that has been marked 'completed'.
* **Payload:** `{"notes": "Changed note"}`
* **Existing Doc:** `{"status": "completed", "ownerId": "owner_uid"}`
* **Expected Result:** `PERMISSION_DENIED`

### Test 12: Injection of invalid types
An attacker attempts to write a string value to `durationMinutes` in an appointment.
* **Payload:** `{"durationMinutes": "sixty"}`
* **Expected Result:** `PERMISSION_DENIED`

---

## 3. Test Runner Blueprint
All tests in `firestore.rules.test.ts` will verify that each of the "Dirty Dozen" payloads yields a permissions error, maintaining our Zero-Trust Fortress boundary.
